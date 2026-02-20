import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Post } from '../entities/post.entity';

export type sortOptions = 'latest' | 'most_liked' | 'most_commented';

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

  async findAll(limit: number, lastDocId?: string, sortBy?: sortOptions) {
    let query: admin.firestore.Query = this.collection;

    if (sortBy === 'most_liked') {
      query = query.orderBy('likesCount', 'desc').orderBy('createdAt', 'desc');
    } else if (sortBy === 'most_commented') {
      query = query
        .orderBy('commentsCount', 'desc')
        .orderBy('createdAt', 'desc');
    } else {
      query = query.orderBy('createdAt', 'desc');
    }

    query = query.limit(limit + 1);

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

  async findByUserId(
    userId: string,
    limit: number,
    lastDocId?: string,
    sortBy?: sortOptions,
  ) {
    let query = this.collection.where('userId', '==', userId);

    if (sortBy === 'most_liked') {
      query = query.orderBy('likesCount', 'desc').orderBy('createdAt', 'desc');
    } else if (sortBy === 'most_commented') {
      query = query
        .orderBy('commentsCount', 'desc')
        .orderBy('createdAt', 'desc');
    } else {
      query = query.orderBy('createdAt', 'desc');
    }

    query = query.limit(limit + 1);

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

  async findAllByUserId(userId: string): Promise<Post[]> {
    const snapshot = await this.collection.where('userId', '==', userId).get();
    return snapshot.docs.map((doc) => this.mapDoc(doc) as Post);
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
    if (snapshot.empty) return;

    const db = admin.firestore();
    let batch = db.batch();
    let count = 0;
    const batches: Promise<any>[] = [];

    snapshot.docs.forEach((doc) => {
      const updates: Record<string, any> = {};
      if (user.name) updates['user.name'] = user.name;
      if (user.surname) updates['user.surname'] = user.surname;
      if (user.photo) updates['user.photo'] = user.photo;

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
}
