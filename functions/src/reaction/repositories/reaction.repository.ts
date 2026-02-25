import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ReactionEntity, ReactionType } from '../entities/reaction.entity';

@Injectable()
export class ReactionRepository {
  private collection = admin.firestore().collection('reactions');

  private getDocId(userId: string, postId: string) {
    return `${userId}_${postId}`;
  }

  async upsert(
    reaction: Omit<ReactionEntity, 'id' | 'createdAt'>,
    transaction?: FirebaseFirestore.Transaction | FirebaseFirestore.WriteBatch,
  ): Promise<void> {
    const docId = this.getDocId(reaction.userId, reaction.postId);
    const docRef = this.collection.doc(docId);
    const data = {
      ...reaction,
      createdAt: new Date(),
    };
    if (transaction) {
      (transaction as any).set(docRef, data);
    } else {
      await docRef.set(data);
    }
  }

  async delete(
    userId: string,
    postId: string,
    transaction?: FirebaseFirestore.Transaction | FirebaseFirestore.WriteBatch,
  ): Promise<void> {
    const docId = this.getDocId(userId, postId);
    const docRef = this.collection.doc(docId);
    if (transaction) {
      (transaction as any).delete(docRef);
    } else {
      await docRef.delete();
    }
  }

  async deleteByPostId(postId: string): Promise<void> {
    const batchSize = 500;
    const query = this.collection
      .where('postId', '==', postId)
      .limit(batchSize);

    while (true) {
      const snapshot = await query.get();

      if (snapshot.empty) {
        break;
      }

      const batch = admin.firestore().batch();
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    }
  }

  async deleteByUserId(userId: string): Promise<void> {
    const batchSize = 500;
    const query = this.collection
      .where('userId', '==', userId)
      .limit(batchSize);

    while (true) {
      const snapshot = await query.get();

      if (snapshot.empty) {
        break;
      }

      const batch = admin.firestore().batch();
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    }
  }

  async findOne(
    userId: string,
    postId: string,
    transaction?: FirebaseFirestore.Transaction,
  ): Promise<ReactionEntity | null> {
    const docId = this.getDocId(userId, postId);
    const doc = transaction
      ? await transaction.get(this.collection.doc(docId))
      : await this.collection.doc(docId).get();

    if (!doc.exists) return null;
    const data = doc.data();
    return data ? (data as ReactionEntity) : null;
  }

  async countByPostAndType(
    postId: string,
    type: ReactionType,
  ): Promise<number> {
    const query = this.collection
      .where('postId', '==', postId)
      .where('type', '==', type);
    const snapshot = await query.get();
    return snapshot.size;
  }

  async findByUserAndPostIds(
    userId: string,
    postIds: string[],
  ): Promise<ReactionEntity[]> {
    if (postIds.length === 0) return [];

    const query = this.collection
      .where('userId', '==', userId)
      .where('postId', 'in', postIds);

    const snapshot = await query.get();
    return snapshot.docs
      .map((doc) => doc.data() as ReactionEntity | undefined)
      .filter((reaction): reaction is ReactionEntity => reaction !== undefined);
  }
}
