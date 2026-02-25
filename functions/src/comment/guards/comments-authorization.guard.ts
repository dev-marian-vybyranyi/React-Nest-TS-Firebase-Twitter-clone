import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CommentRepository } from '../repositories/comment.repository';

@Injectable()
export class CommentsAuthorizationGuard implements CanActivate {
  constructor(private readonly commentRepository: CommentRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const commentId = request.params.id;
    const userId = request.user?.uid;

    if (!userId) {
      throw new ForbiddenException('User is not authenticated');
    }

    if (!commentId) {
      throw new NotFoundException('Comment ID is missing');
    }

    const comment = await this.commentRepository.findOne(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException(
        'You can only edit or delete your own comments',
      );
    }

    return true;
  }
}
