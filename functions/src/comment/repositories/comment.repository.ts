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

  async findOne(
    id: string,
    transaction?: FirebaseFirestore.Transaction,
  ): Promise<Comment | null> {
    const doc = transaction
      ? await transaction.get(this.collection.doc(id))
      : await this.collection.doc(id).get();
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
      .limit(limit + 1);

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
      .limit(limit + 1);

    if (lastDocId) {
      const lastDoc = await this.collection.doc(lastDocId).get();
      if (lastDoc.exists) query = query.startAfter(lastDoc);
    }

    const snapshot = await query.get();
    return { docs: snapshot.docs.map((doc) => this.mapDoc(doc) as Comment) };
  }

  async create(
    comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>,
    transaction?: FirebaseFirestore.Transaction,
  ): Promise<Comment> {
    const now = FieldValue.serverTimestamp();
    const newRef = this.collection.doc();

    if (comment.parentId) {
      if (transaction) {
        const parentRef = this.collection.doc(comment.parentId);
        transaction.set(newRef, { ...comment, createdAt: now, updatedAt: now });
        transaction.update(parentRef, { replyCount: FieldValue.increment(1) });
        return {
          id: newRef.id,
          ...comment,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Comment;
      } else {
        const batch = admin.firestore().batch();
        const parentRef = this.collection.doc(comment.parentId);
        batch.set(newRef, { ...comment, createdAt: now, updatedAt: now });
        batch.update(parentRef, { replyCount: FieldValue.increment(1) });
        await batch.commit();
        const doc = await newRef.get();
        return this.mapDoc(doc) as Comment;
      }
    }

    if (transaction) {
      transaction.set(newRef, { ...comment, createdAt: now, updatedAt: now });
      return {
        id: newRef.id,
        ...comment,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Comment;
    } else {
      await newRef.set({ ...comment, createdAt: now, updatedAt: now });
      const doc = await newRef.get();
      return this.mapDoc(doc) as Comment;
    }
  }

  async update(
    id: string,
    updateData: Partial<Comment>,
    transaction?: FirebaseFirestore.Transaction | FirebaseFirestore.WriteBatch,
  ): Promise<void> {
    const docRef = this.collection.doc(id);
    const data = {
      ...updateData,
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (transaction) {
      (transaction as any).update(docRef, data);
    } else {
      await docRef.update(data);
    }
  }

  async softDelete(
    id: string,
    transaction?: FirebaseFirestore.Transaction | FirebaseFirestore.WriteBatch,
  ): Promise<void> {
    const docRef = this.collection.doc(id);
    const data = {
      isDeleted: true,
      content: '[Comment deleted]',
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (transaction) {
      (transaction as any).update(docRef, data);
    } else {
      await docRef.update(data);
    }
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

  async delete(
    id: string,
    parentId?: string | null,
    transaction?: FirebaseFirestore.Transaction,
  ): Promise<void> {
    const docRef = this.collection.doc(id);
    if (parentId) {
      if (transaction) {
        transaction.delete(docRef);
        transaction.update(this.collection.doc(parentId), {
          replyCount: FieldValue.increment(-1),
        });
      } else {
        const batch = admin.firestore().batch();
        batch.delete(docRef);
        batch.update(this.collection.doc(parentId), {
          replyCount: FieldValue.increment(-1),
        });
        await batch.commit();
      }
    } else {
      if (transaction) {
        transaction.delete(docRef);
      } else {
        await docRef.delete();
      }
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
