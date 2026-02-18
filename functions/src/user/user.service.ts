import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { PostService } from '../post/post.service';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly postService: PostService,
    private readonly userRepository: UserRepository,
  ) {}

  async getUserById(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user as User;
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

      Object.keys(updateData).forEach(
        (key) => updateData[key] === undefined && delete updateData[key],
      );

      if (Object.keys(updateData).length > 0) {
        await this.userRepository.updateUser(id, updateData);
      }

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
