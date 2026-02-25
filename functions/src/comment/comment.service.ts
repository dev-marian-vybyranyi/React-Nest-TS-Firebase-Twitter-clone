import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { CommentRepository } from './repositories/comment.repository';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

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
  ): Promise<{ docs: Comment[]; nextCursor: string | null; hasMore: boolean }> {
    const { docs } = await this.commentRepository.findAll(
      postId,
      limit,
      cursor,
    );

    const hasMore = docs.length > limit;
    const comments = hasMore ? docs.slice(0, -1) : docs;
    const nextCursor = hasMore ? comments[comments.length - 1].id : null;

    return { docs: comments, nextCursor, hasMore };
  }

  async findReplies(
    parentId: string,
    limit: number,
    cursor?: string,
  ): Promise<{ docs: Comment[]; nextCursor: string | null; hasMore: boolean }> {
    const { docs } = await this.commentRepository.findReplies(
      parentId,
      limit,
      cursor,
    );

    const hasMore = docs.length > limit;
    const replies = hasMore ? docs.slice(0, -1) : docs;
    const nextCursor = hasMore ? replies[replies.length - 1].id : null;

    return { docs: replies, nextCursor, hasMore };
  }

  async create(
    postId: string,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    const { authorId, authorUsername, authorPhotoURL, content, parentId } =
      createCommentDto;
    return admin.firestore().runTransaction(async (transaction) => {
      if (parentId) {
        const parent = await this.commentRepository.findOne(
          parentId,
          transaction,
        );
        if (!parent) throw new NotFoundException('Parent comment not found');
        if (parent.parentId !== null) {
          throw new BadRequestException(
            'You can only reply to top-level comments',
          );
        }
      }

      return this.commentRepository.create(
        {
          postId,
          authorId,
          authorUsername,
          authorPhotoURL: authorPhotoURL || null,
          content,
          parentId: parentId ?? null,
          replyCount: 0,
          isDeleted: false,
        },
        transaction,
      );
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
    return admin.firestore().runTransaction(async (transaction) => {
      const comment = await this.commentRepository.findOne(id, transaction);
      if (!comment) throw new NotFoundException('Comment not found');
      if (comment.authorId !== requesterId) {
        throw new ForbiddenException('You can only delete your own comments');
      }
      if (comment.replyCount > 0) {
        return this.commentRepository.softDelete(id, transaction);
      }
      return this.commentRepository.delete(id, comment.parentId, transaction);
    });
  }

  async updateUserInComments(
    userId: string,
    userData: { name?: string; surname?: string; photo?: string | null },
  ): Promise<void> {
    await this.commentRepository.updateUserInComments(userId, userData);
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.commentRepository.deleteByUserId(userId);
  }
}
