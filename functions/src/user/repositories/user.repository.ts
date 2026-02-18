import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  private collection = admin.firestore().collection('users');

  async findOne(id: string): Promise<User | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as User;
  }

  async updateUser(id: string, data: Partial<User>): Promise<void> {
    await this.collection.doc(id).update(data);
  }
}
