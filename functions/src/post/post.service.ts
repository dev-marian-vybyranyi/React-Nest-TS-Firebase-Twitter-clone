import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';

@Injectable()
export class PostService {
  private readonly postsCollection = admin.firestore().collection('posts');

  async create(createPostDto: CreatePostDto, userId: string): Promise<Post> {
    try {
      const postData = {
        ...createPostDto,
        userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const postRef = await this.postsCollection.add(postData);
      const postDoc = await postRef.get();

      const newPostData = postDoc.data();

      if (!newPostData) {
        throw new InternalServerErrorException('Failed to create post');
      }

      return {
        id: postRef.id,
        ...newPostData,
        createdAt: (
          newPostData.createdAt as admin.firestore.Timestamp
        ).toDate(),
        updatedAt: (
          newPostData.updatedAt as admin.firestore.Timestamp
        ).toDate(),
      } as Post;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll(): Promise<Post[]> {
    try {
      const postsSnapshot = await this.postsCollection
        .orderBy('createdAt', 'desc')
        .get();

      return postsSnapshot.docs.map((doc) => {
        const postData = doc.data();
        return {
          id: doc.id,
          ...postData,
          createdAt: (postData.createdAt as admin.firestore.Timestamp).toDate(),
          updatedAt: (postData.updatedAt as admin.firestore.Timestamp).toDate(),
        } as Post;
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOne(id: string): Promise<Post> {
    try {
      const postDoc = await this.postsCollection.doc(id).get();

      if (!postDoc.exists) {
        throw new NotFoundException('Post not found');
      }

      const postData = postDoc.data();

      if (!postData) {
        throw new NotFoundException('Post data not found');
      }

      return {
        id: postDoc.id,
        ...postData,
        createdAt: (postData.createdAt as admin.firestore.Timestamp).toDate(),
        updatedAt: (postData.updatedAt as admin.firestore.Timestamp).toDate(),
      } as Post;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async findByUserId(userId: string): Promise<Post[]> {
    try {
      const postsSnapshot = await this.postsCollection
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      return postsSnapshot.docs.map((doc) => {
        const postData = doc.data();
        return {
          id: doc.id,
          ...postData,
          createdAt: (postData.createdAt as admin.firestore.Timestamp).toDate(),
          updatedAt: (postData.updatedAt as admin.firestore.Timestamp).toDate(),
        } as Post;
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    userId: string,
  ): Promise<Post> {
    try {
      const postDoc = await this.postsCollection.doc(id).get();

      if (!postDoc.exists) {
        throw new NotFoundException('Post not found');
      }

      const postData = postDoc.data();

      if (!postData) {
        throw new NotFoundException('Post data not found');
      }

      if (postData.userId !== userId) {
        throw new ForbiddenException('You can only update your own posts');
      }

      const updateData = {
        ...updatePostDto,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await this.postsCollection.doc(id).update(updateData);
      const updatedPostDoc = await this.postsCollection.doc(id).get();
      const updatedPostData = updatedPostDoc.data();

      if (!updatedPostData) {
        throw new InternalServerErrorException(
          'Failed to retrieve updated post',
        );
      }

      return {
        id,
        ...updatedPostData,
        createdAt: (
          updatedPostData.createdAt as admin.firestore.Timestamp
        ).toDate(),
        updatedAt: (
          updatedPostData.updatedAt as admin.firestore.Timestamp
        ).toDate(),
      } as Post;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async remove(id: string, userId: string) {
    try {
      const postDoc = await this.postsCollection.doc(id).get();

      if (!postDoc.exists) {
        throw new NotFoundException('Post not found');
      }

      const postData = postDoc.data();

      if (!postData) {
        throw new NotFoundException('Post data not found');
      }

      if (postData.userId !== userId) {
        throw new ForbiddenException('You can only delete your own posts');
      }

      await this.postsCollection.doc(id).delete();

      return { message: 'Post deleted successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
