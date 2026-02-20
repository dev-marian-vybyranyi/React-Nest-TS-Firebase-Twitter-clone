import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { Comment } from '../entities/comment.entity';

@Injectable()
export class CommentRepository {
  private collection = admin.firestore().collection('comments');

  private mapDoc(doc: FirebaseFirestore.DocumentSnapshot): Comment | null {
    if (!doc.exists) return null;
    const data = doc.data();
    if (!data) return null;
    return {
      id: doc.id,
      ...data,
      createdAt:
        data.createdAt && typeof data.createdAt.toDate === 'function'
          ? data.createdAt.toDate()
          : data.createdAt,
      updatedAt:
        data.updatedAt && typeof data.updatedAt.toDate === 'function'
          ? data.updatedAt.toDate()
          : data.updatedAt,
    } as Comment;
  }

  async findOne(id: string): Promise<Comment | null> {
    const doc = await this.collection.doc(id).get();
    return this.mapDoc(doc);
  }

  async findAll(
    postId: string,
    limit: number,
    lastDocId?: string,
  ): Promise<{ docs: Comment[] }> {
    let query = this.collection
      .where('postId', '==', postId)
      .where('parentId', '==', null)
      .orderBy('createdAt', 'desc')
      .limit(limit);

    if (lastDocId) {
      const lastDoc = await this.collection.doc(lastDocId).get();
      if (lastDoc.exists) query = query.startAfter(lastDoc);
    }

    const snapshot = await query.get();
    return { docs: snapshot.docs.map((doc) => this.mapDoc(doc) as Comment) };
  }

  async findReplies(
    parentId: string,
    limit: number,
    lastDocId?: string,
  ): Promise<{ docs: Comment[] }> {
    let query = this.collection
      .where('parentId', '==', parentId)
      .orderBy('createdAt', 'asc')
      .limit(limit);

    if (lastDocId) {
      const lastDoc = await this.collection.doc(lastDocId).get();
      if (lastDoc.exists) query = query.startAfter(lastDoc);
    }

    const snapshot = await query.get();
    return { docs: snapshot.docs.map((doc) => this.mapDoc(doc) as Comment) };
  }

  async create(
    comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Comment> {
    const now = FieldValue.serverTimestamp();

    if (comment.parentId) {
      const batch = admin.firestore().batch();
      const newRef = this.collection.doc();
      const parentRef = this.collection.doc(comment.parentId);

      batch.set(newRef, { ...comment, createdAt: now, updatedAt: now });
      batch.update(parentRef, { replyCount: FieldValue.increment(1) });

      await batch.commit();

      const doc = await newRef.get();
      return this.mapDoc(doc) as Comment;
    }

    const ref = await this.collection.add({
      ...comment,
      createdAt: now,
      updatedAt: now,
    });
    const doc = await ref.get();
    return this.mapDoc(doc) as Comment;
  }

  async update(id: string, updateData: Partial<Comment>): Promise<void> {
    await this.collection.doc(id).update({
      ...updateData,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.collection.doc(id).update({
      isDeleted: true,
      content: '[Comment deleted]',
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  async updateUserInComments(
    userId: string,
    user: { name?: string; surname?: string; photo?: string | null },
  ): Promise<void> {
    const snapshot = await this.collection
      .where('authorId', '==', userId)
      .get();
    if (snapshot.empty) return;

    const db = admin.firestore();
    let batch = db.batch();
    let count = 0;
    const batches: Promise<any>[] = [];

    snapshot.docs.forEach((doc) => {
      const updates: Record<string, any> = {};
      const authorUsernameParts: string[] = [];
      if (user.name) authorUsernameParts.push(user.name);
      if (user.surname) authorUsernameParts.push(user.surname);
      if (authorUsernameParts.length > 0) {
        updates['authorUsername'] = authorUsernameParts.join(' ');
      }

      if (user.photo !== undefined) {
        updates['authorPhotoURL'] = user.photo;
      }

      if (Object.keys(updates).length > 0) {
        batch.update(doc.ref, updates);
        count++;

        if (count === 500) {
          batches.push(batch.commit());
          batch = db.batch();
          count = 0;
        }
      }
    });

    if (count > 0) {
      batches.push(batch.commit());
    }

    await Promise.all(batches);
  }

  async delete(id: string, parentId?: string | null): Promise<void> {
    if (parentId) {
      const batch = admin.firestore().batch();
      batch.delete(this.collection.doc(id));
      batch.update(this.collection.doc(parentId), {
        replyCount: FieldValue.increment(-1),
      });
      await batch.commit();
    } else {
      await this.collection.doc(id).delete();
    }
  }

  async deleteByPostId(postId: string): Promise<void> {
    const snapshot = await this.collection.where('postId', '==', postId).get();
    const batch = admin.firestore().batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }

  async deleteByUserId(userId: string): Promise<void> {
    const snapshot = await this.collection
      .where('authorId', '==', userId)
      .get();
    if (snapshot.empty) return;

    const db = admin.firestore();
    let batch = db.batch();
    let count = 0;
    const batches: Promise<any>[] = [];

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
      count++;

      const data = doc.data();
      if (data.parentId) {
        batch.update(this.collection.doc(data.parentId), {
          replyCount: FieldValue.increment(-1),
        });
        count++;
      }

      if (count >= 400) {
        batches.push(batch.commit());
        batch = db.batch();
        count = 0;
      }
    });

    if (count > 0) {
      batches.push(batch.commit());
    }

    await Promise.all(batches);
  }
}
