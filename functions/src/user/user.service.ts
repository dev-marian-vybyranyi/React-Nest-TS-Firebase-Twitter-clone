import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { PostService } from '../post/post.service';

@Injectable()
export class UserService {
  private readonly usersCollection = admin.firestore().collection('users');

  constructor(private readonly postService: PostService) {}

  async getUserById(id: string): Promise<User> {
    try {
      const userDoc = await this.usersCollection.doc(id).get();
      if (!userDoc.exists) {
        throw new NotFoundException('User not found');
      }
      return { id: userDoc.id, ...userDoc.data() } as User;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<{ message: string; user: Partial<User> }> {
    try {
      const updateData: Partial<User> = { ...updateUserDto };

      await this.usersCollection.doc(id).update(updateData);

      if (updateUserDto.name || updateUserDto.surname || updateUserDto.photo) {
        await this.postService.updateUserInPosts(id, {
          name: updateUserDto.name,
          surname: updateUserDto.surname,
          photo: updateUserDto.photo,
        });
      }

      return { message: 'User updated successfully', user: updateData };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
