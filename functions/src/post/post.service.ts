import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as admin from 'firebase-admin';
import { CommentRepository } from '../comment/repositories/comment.repository';
import { ReactionType } from '../reaction/entities/reaction.entity';
import { ReactionRepository } from '../reaction/repositories/reaction.repository';
import { UserRepository } from '../user/repositories/user.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { PostDeletedEvent } from './events/post-deleted.event';
import { PostUpdatedEvent } from './events/post-updated.event';
import { PostRepository, sortOptions } from './repositories/post.repository';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(
    private readonly postRepository: PostRepository,
    private readonly userRepository: UserRepository,
    private readonly reactionRepository: ReactionRepository,
    private readonly commentRepository: CommentRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createPostDto: CreatePostDto, userId: string): Promise<Post> {
    try {
      const userData = await this.userRepository.findOne(userId);

      const user = userData
        ? {
            name: userData.name || '',
            surname: userData.surname || '',
            photo: userData.photo,
          }
        : undefined;

      const now = new Date();
      const postData = {
        ...createPostDto,
        userId,
        user,
        createdAt: now,
        updatedAt: now,
        likesCount: 0,
        dislikesCount: 0,
        commentsCount: 0,
      };

      const newPostData = await this.postRepository.create(postData);

      return newPostData;
    } catch (e) {
      const error = e as Error;
      this.logger.error('Error creating post', error.stack);
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the post',
      );
    }
  }

  async findAll(
    limit: number,
    lastDocId?: string,
    currentUserId?: string,
    sortBy?: sortOptions,
  ): Promise<{ posts: any[]; lastDocId: string | null; hasMore: boolean }> {
    try {
      const { docs } = await this.postRepository.findAll(
        limit,
        lastDocId,
        sortBy,
      );

      const hasMore = docs.length > limit;
      const posts = docs.slice(0, limit);
      const postIds = posts.map((post) => post.id);

      let userReactions: any[] = [];
      if (currentUserId && postIds.length > 0) {
        userReactions = await this.reactionRepository.findByUserAndPostIds(
          currentUserId,
          postIds,
        );
      }

      const postsWithStats = posts.map((post) => {
        const reaction = userReactions.find((r) => r.postId === post.id);
        return {
          ...post,
          likes: post.likesCount || 0,
          dislikes: post.dislikesCount || 0,
          userReaction: reaction ? reaction.type : null,
        };
      });

      const lastDocIdResult =
        posts.length > 0 ? posts[posts.length - 1].id : null;

      return { posts: postsWithStats, lastDocId: lastDocIdResult, hasMore };
    } catch (e) {
      const error = e as Error;
      this.logger.error('Error fetching posts', error.stack);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching posts',
      );
    }
  }

  async findOne(id: string, currentUserId?: string): Promise<any> {
    try {
      const post = await this.postRepository.findOne(id);

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      let userReaction: ReactionType | null = null;
      if (currentUserId) {
        const reaction = await this.reactionRepository.findOne(
          currentUserId,
          post.id,
        );
        userReaction = reaction ? reaction.type : null;
      }

      return {
        ...post,
        likes: post.likesCount || 0,
        dislikes: post.dislikesCount || 0,
        userReaction,
      };
    } catch (e) {
      const error = e as Error;
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching post with id ${id}`, error.stack);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching the post',
      );
    }
  }

  async findByUserId(
    userId: string,
    limit: number,
    lastDocId?: string,
    currentUserId?: string,
    sortBy?: sortOptions,
  ): Promise<{ posts: any[]; lastDocId: string | null; hasMore: boolean }> {
    try {
      const { docs } = await this.postRepository.findByUserId(
        userId,
        limit,
        lastDocId,
        sortBy,
      );

      const hasMore = docs.length > limit;
      const posts = docs.slice(0, limit);
      const postIds = posts.map((post) => post.id);

      let userReactions: any[] = [];
      if (currentUserId && postIds.length > 0) {
        userReactions = await this.reactionRepository.findByUserAndPostIds(
          currentUserId,
          postIds,
        );
      }

      const postsWithStats = posts.map((post) => {
        const reaction = userReactions.find((r) => r.postId === post.id);
        return {
          ...post,
          likes: post.likesCount || 0,
          dislikes: post.dislikesCount || 0,
          userReaction: reaction ? reaction.type : null,
        };
      });

      const lastDocIdResult =
        posts.length > 0 ? posts[posts.length - 1].id : null;

      return { posts: postsWithStats, lastDocId: lastDocIdResult, hasMore };
    } catch (e) {
      const error = e as Error;
      this.logger.error(`Error fetching posts for user ${userId}`, error.stack);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching user posts',
      );
    }
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    userId: string,
  ): Promise<Post> {
    try {
      const post = await this.postRepository.findOne(id);

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      if (post.userId !== userId) {
        throw new ForbiddenException('You can only update your own posts');
      }

      const updateData = {
        ...updatePostDto,
        updatedAt: new Date(),
      };

      if (
        post.photo &&
        updatePostDto.photo !== undefined &&
        post.photo !== updatePostDto.photo
      ) {
        this.eventEmitter.emit(
          'post.updated',
          new PostUpdatedEvent(post.photo),
        );
      }

      await this.postRepository.update(id, updateData);
      const updatedPost = await this.postRepository.findOne(id);

      if (!updatedPost) {
        throw new InternalServerErrorException(
          'Failed to retrieve updated post',
        );
      }

      return updatedPost;
    } catch (e) {
      const error = e as Error;
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error(`Error updating post with id ${id}`, error.stack);
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating the post',
      );
    }
  }

  async remove(id: string, userId: string) {
    try {
      const post = await this.postRepository.findOne(id);

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      if (post.userId !== userId) {
        throw new ForbiddenException('You can only delete your own posts');
      }

      if (post.photo) {
        this.eventEmitter.emit(
          'post.deleted',
          new PostDeletedEvent(post.photo),
        );
      }

      await this.postRepository.delete(id);
      await this.reactionRepository.deleteByPostId(id);
      await this.commentRepository.deleteByPostId(id);

      return { message: 'Post deleted successfully' };
    } catch (e) {
      const error = e as Error;
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error(`Error deleting post with id ${id}`, error.stack);
      throw new InternalServerErrorException(
        'An unexpected error occurred while deleting the post',
      );
    }
  }

  async updateUserInPosts(
    userId: string,
    userData: { name?: string; surname?: string; photo?: string },
  ): Promise<void> {
    try {
      await this.postRepository.updateUserInPosts(userId, userData);
    } catch {
      this.logger.error(
        `Error updating user in posts for user with id ${userId}`,
      );
    }
  }

  async deleteAllPostsByUserId(userId: string): Promise<void> {
    const posts = await this.postRepository.findAllByUserId(userId);
    if (!posts.length) return;

    const db = admin.firestore();
    let batch = db.batch();
    let count = 0;
    const batches: Promise<any>[] = [];

    for (const post of posts) {
      const postRef = db.collection('posts').doc(post.id);
      batch.delete(postRef);
      count++;

      if (count === 500) {
        batches.push(batch.commit());
        batch = db.batch();
        count = 0;
      }

      if (post.photo) {
        this.eventEmitter.emit(
          'post.deleted',
          new PostDeletedEvent(post.photo),
        );
      }
    }

    if (count > 0) {
      batches.push(batch.commit());
    }

    await Promise.all(batches);
  }
}
