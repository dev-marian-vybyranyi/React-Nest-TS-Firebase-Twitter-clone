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
  ): Promise<void> {
    const docId = this.getDocId(reaction.userId, reaction.postId);
    await this.collection.doc(docId).set({
      ...reaction,
      createdAt: new Date(),
    });
  }

  async delete(userId: string, postId: string): Promise<void> {
    const docId = this.getDocId(userId, postId);
    await this.collection.doc(docId).delete();
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
  ): Promise<ReactionEntity | null> {
    const docId = this.getDocId(userId, postId);
    const doc = await this.collection.doc(docId).get();
    return doc.exists ? (doc.data() as ReactionEntity) : null;
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
}
