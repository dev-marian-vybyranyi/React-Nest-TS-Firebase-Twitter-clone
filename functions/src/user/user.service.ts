import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  async getUserById(id: string) {
    try {
      const userDoc = await admin.firestore().collection('users').doc(id).get();
      if (!userDoc.exists) {
        throw new NotFoundException('User not found');
      }
      return userDoc.data();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    try {
      const updateData: { [key: string]: any } = { ...updateUserDto };

      await admin.firestore().collection('users').doc(id).update(updateData);
      return { message: 'User updated successfully', user: updateData };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
