import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { CommentService } from '../comment/comment.service';
import { PostService } from '../post/post.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly postService: PostService,
    private readonly userRepository: UserRepository,
    private readonly commentService: CommentService,
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
      this.logger.error(`Failed to get user by id ${id}`, error.stack);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching the user',
      );
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
        const fullUser = await this.userRepository.findOne(id);
        if (fullUser) {
          await this.postService.updateUserInPosts(id, {
            name: fullUser.name,
            surname: fullUser.surname,
            photo: fullUser.photo,
          });
          await this.commentService.updateUserInComments(id, {
            name: fullUser.name,
            surname: fullUser.surname,
            photo: fullUser.photo,
          });
        }
      }

      return { message: 'User updated successfully', user: updateData };
    } catch (error) {
      this.logger.error(`Failed to update user with id ${id}`, error.stack);
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating the user',
      );
    }
  }
}
