import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  private collection = admin.firestore().collection('users');

  async findOne(id: string): Promise<User | null> {
    const doc = await this.collection.doc(id).get();
    return this.mapDoc(doc);
  }

  async create(user: User): Promise<void> {
    const { id, ...data } = user;
    await this.collection.doc(id).set(data);
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
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

  async updateUser(id: string, data: Partial<User>): Promise<void> {
    await this.collection.doc(id).update(data);
  }
}
