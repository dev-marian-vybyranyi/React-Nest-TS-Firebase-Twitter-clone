import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  private collection = admin.firestore().collection('users');

  async findOne(
    id: string,
    transaction?: FirebaseFirestore.Transaction,
  ): Promise<User | null> {
    const doc = transaction
      ? await transaction.get(this.collection.doc(id))
      : await this.collection.doc(id).get();
    return this.mapDoc(doc);
  }

  async create(
    user: User,
    transaction?: FirebaseFirestore.Transaction | FirebaseFirestore.WriteBatch,
  ): Promise<void> {
    const { id, ...data } = user;
    const docRef = this.collection.doc(id);
    if (transaction) {
      (transaction as any).set(docRef, data);
    } else {
      await docRef.set(data);
    }
  }

  async delete(
    id: string,
    transaction?: FirebaseFirestore.Transaction | FirebaseFirestore.WriteBatch,
  ): Promise<void> {
    const docRef = this.collection.doc(id);
    if (transaction) {
      (transaction as any).delete(docRef);
    } else {
      await docRef.delete();
    }
  }

  private mapDoc(doc: FirebaseFirestore.DocumentSnapshot): User | null {
    if (!doc.exists) return null;
    const data = doc.data();
    if (!data) return null;

    return {
      id: doc.id,
      ...data,
      createdAt:
        data.createdAt && typeof data.createdAt.toDate === 'function'
          ? data.createdAt.toDate()
          : new Date(data.createdAt),
    } as User;
  }

  async updateUser(
    id: string,
    data: Partial<User>,
    transaction?: FirebaseFirestore.Transaction | FirebaseFirestore.WriteBatch,
  ): Promise<void> {
    const docRef = this.collection.doc(id);
    if (transaction) {
      (transaction as any).update(docRef, data);
    } else {
      await docRef.update(data);
    }
  }
}
