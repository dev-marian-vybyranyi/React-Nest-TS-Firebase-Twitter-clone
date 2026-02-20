import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CommentRepository } from './repositories/comment.repository';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(private readonly commentRepository: CommentRepository) {}

  async findOne(id: string): Promise<Comment | null> {
    return this.commentRepository.findOne(id);
  }

  async findAll(
    postId: string,
    limit: number,
    cursor?: string,
  ): Promise<{ docs: Comment[] }> {
    return this.commentRepository.findAll(postId, limit, cursor);
  }

  async findReplies(
    parentId: string,
    limit: number,
    cursor?: string,
  ): Promise<{ docs: Comment[] }> {
    return this.commentRepository.findReplies(parentId, limit, cursor);
  }

  async create(
    postId: string,
    authorId: string,
    authorUsername: string,
    authorPhotoURL: string | null,
    content: string,
    parentId?: string,
  ): Promise<Comment> {
    if (parentId) {
      const parent = await this.commentRepository.findOne(parentId);
      if (!parent) throw new NotFoundException('Parent comment not found');
      if (parent.parentId !== null) {
        throw new BadRequestException(
          'You can only reply to top-level comments',
        );
      }
    }

    return this.commentRepository.create({
      postId,
      authorId,
      authorUsername,
      authorPhotoURL,
      content,
      parentId: parentId ?? null,
      replyCount: 0,
      isDeleted: false,
    });
  }

  async update(
    id: string,
    requesterId: string,
    content: string,
  ): Promise<void> {
    const comment = await this.commentRepository.findOne(id);
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.authorId !== requesterId) {
      throw new ForbiddenException('You can only edit your own comments');
    }
    if (comment.isDeleted) {
      throw new BadRequestException('Cannot edit a deleted comment');
    }

    return this.commentRepository.update(id, { content });
  }

  async remove(id: string, requesterId: string): Promise<void> {
    const comment = await this.commentRepository.findOne(id);
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.authorId !== requesterId) {
      throw new ForbiddenException('You can only delete your own comments');
    }
    if (comment.replyCount > 0) {
      return this.commentRepository.softDelete(id);
    }
    return this.commentRepository.delete(id, comment.parentId);
  }

  async updateUserInComments(
    userId: string,
    userData: { name?: string; surname?: string; photo?: string | null },
  ): Promise<void> {
    try {
      await this.commentRepository.updateUserInComments(userId, userData);
    } catch (error) {}
  }
}
