import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PostRepository } from '../repositories/post.repository';

@Injectable()
export class PostsAuthorizationGuard implements CanActivate {
  constructor(private readonly postRepository: PostRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const postId = request.params.id;
    const userId = request.user?.uid;

    if (!userId) {
      throw new ForbiddenException('User is not authenticated');
    }

    if (!postId) {
      throw new NotFoundException('Post ID is missing');
    }

    const post = await this.postRepository.findOne(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException(
        'You can only update or delete your own posts',
      );
    }

    return true;
  }
}
