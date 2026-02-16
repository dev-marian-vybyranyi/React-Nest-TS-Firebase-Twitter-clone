import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  private readonly postsCollection = admin.firestore().collection('posts');
  private readonly usersCollection = admin.firestore().collection('users');

  async create(createPostDto: CreatePostDto, userId: string) {
    try {
      const postData = {
        ...createPostDto,
        userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const postRef = await this.postsCollection.add(postData);
      const postDoc = await postRef.get();

      return {
        id: postRef.id,
        ...postDoc.data(),
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll() {
    try {
      const postsSnapshot = await this.postsCollection
        .orderBy('createdAt', 'desc')
        .get();

      const posts = await Promise.all(
        postsSnapshot.docs.map(async (doc) => {
          const postData = doc.data();
          const userDoc = await this.usersCollection.doc(postData.userId).get();

          return {
            id: doc.id,
            ...postData,
            user: userDoc.exists ? userDoc.data() : null,
          };
        }),
      );

      return posts;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      const postDoc = await this.postsCollection.doc(id).get();

      if (!postDoc.exists) {
        throw new NotFoundException('Post not found');
      }

      const postData = postDoc.data();

      if (!postData) {
        throw new NotFoundException('Post data not found');
      }

      const userDoc = await this.usersCollection.doc(postData.userId).get();

      return {
        id: postDoc.id,
        ...postData,
        user: userDoc.exists ? userDoc.data() : null,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async findByUserId(userId: string) {
    try {
      const postsSnapshot = await this.postsCollection
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      const posts = await Promise.all(
        postsSnapshot.docs.map(async (doc) => {
          const postData = doc.data();
          const userDoc = await this.usersCollection.doc(postData.userId).get();

          return {
            id: doc.id,
            ...postData,
            user: userDoc.exists ? userDoc.data() : null,
          };
        }),
      );

      return posts;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(id: string, updatePostDto: UpdatePostDto, userId: string) {
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

      return {
        id,
        ...postData,
        ...updateData,
      };
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
