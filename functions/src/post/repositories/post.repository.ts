import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Post } from '../entities/post.entity';

@Injectable()
export class PostRepository {
  private collection = admin.firestore().collection('posts');

  async create(post: Omit<Post, 'id'>): Promise<Post> {
    const ref = await this.collection.add(post);
    const doc = await ref.get();
    return this.mapDoc(doc) as Post;
  }

  private mapDoc(doc: FirebaseFirestore.DocumentSnapshot): Post | null {
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
    } as Post;
  }

  async findAll(limit: number, lastDocId?: string) {
    let query = this.collection.orderBy('createdAt', 'desc').limit(limit + 1);

    if (lastDocId) {
      const lastDoc = await this.collection.doc(lastDocId).get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc);
      }
    }

    const snapshot = await query.get();
    return {
      docs: snapshot.docs.map((doc) => this.mapDoc(doc) as Post),
    };
  }

  async findOne(id: string): Promise<Post | null> {
    const doc = await this.collection.doc(id).get();
    return this.mapDoc(doc);
  }

  async findByUserId(userId: string, limit: number, lastDocId?: string) {
    let query = this.collection
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit + 1);

    if (lastDocId) {
      const lastDoc = await this.collection.doc(lastDocId).get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc);
      }
    }

    const snapshot = await query.get();
    return {
      docs: snapshot.docs.map((doc) => this.mapDoc(doc) as Post),
    };
  }

  async update(id: string, updateData: Partial<Post>): Promise<void> {
    await this.collection.doc(id).update(updateData);
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }

  async updateUserInPosts(
    userId: string,
    user: { name?: string; surname?: string; photo?: string },
  ): Promise<void> {
    const snapshot = await this.collection.where('userId', '==', userId).get();
    const batch = admin.firestore().batch();

    snapshot.docs.forEach((doc) => {
      const updates: Record<string, any> = {};
      if (user.name) updates['user.name'] = user.name;
      if (user.surname) updates['user.surname'] = user.surname;
      if (user.photo) updates['user.photo'] = user.photo;

      if (Object.keys(updates).length > 0) {
        batch.update(doc.ref, updates);
      }
    });

    await batch.commit();
  }
}
