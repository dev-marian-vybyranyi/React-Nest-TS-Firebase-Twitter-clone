import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ReactionRepository } from '../reaction/repositories/reaction.repository';
import { UserRepository } from '../user/repositories/user.repository';
import { PostService } from '../post/post.service';
import { CommentService } from '../comment/comment.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { SignInDto } from './dto/signIn.dto';
import { Auth } from './entities/auth.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly postService: PostService,
    private readonly reactionRepository: ReactionRepository,
    private readonly userRepository: UserRepository,
    private readonly commentService: CommentService,
  ) {}
  async signup(createAuthDto: CreateAuthDto) {
    const { email, password, name, surname, photo } = createAuthDto;

    try {
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: `${name} ${surname}`,
        photoURL: photo && photo.trim() !== '' ? photo : undefined,
      });

      await this.userRepository.create({
        id: userRecord.uid,
        email: userRecord.email || '',
        name,
        surname,
        photo: photo || null,
        createdAt: new Date(),
      } as User);

      return {
        uid: userRecord.uid,
        email: userRecord.email,
        message: 'User created successfully',
      };
    } catch (e) {
      const error = e as Error & { code?: string };
      if (error.code === 'auth/email-already-exists') {
        throw new BadRequestException('User with this email already exists');
      }
      this.logger.error('Error during signup', error.stack);
      throw new InternalServerErrorException(
        'An unexpected error occurred during signup',
      );
    }
  }

  async googleLogin(googleLoginDto: GoogleLoginDto) {
    try {
      const decodedToken = await admin
        .auth()
        .verifyIdToken(googleLoginDto.token);
      const { email, uid } = decodedToken;
      const googleName = String(decodedToken.name || '');
      const photo = String(decodedToken.picture || '');

      const name = googleName ? googleName.split(' ')[0] : '';
      const surname =
        googleName && googleName.split(' ').length > 1
          ? googleName.split(' ')[1]
          : '';

      const user = await this.userRepository.findOne(uid);

      if (!user) {
        await this.userRepository.create({
          id: uid,
          email,
          name,
          surname,
          photo: photo || null,
          createdAt: new Date(),
        } as User);
        console.log(`Created new user profile for ${email}`);
      } else {
        console.log(`User ${email} already exists. Logging in...`);
      }

      const userData = user || { name, surname, photo };

      return {
        message: 'Google auth successful',
        user: {
          email,
          uid,
          name: userData?.name,
          surname: userData?.surname,
          photo: userData?.photo,
        } as Auth,
      };
    } catch (e) {
      const error = e as Error;
      this.logger.error('Error during Google login', error.stack);
      throw new InternalServerErrorException(
        'An unexpected error occurred during Google login',
      );
    }
  }

  async signIn(signInDto: SignInDto) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(signInDto.token);
      const { email, uid } = decodedToken;
      const googleName = String(decodedToken.name || '');
      const photo = String(decodedToken.picture || '');

      const user = await this.userRepository.findOne(uid);

      let userData: User;

      if (!user) {
        const name = googleName ? googleName.split(' ')[0] : '';
        const surname =
          googleName && googleName.split(' ').length > 1
            ? googleName.split(' ')[1]
            : '';

        userData = {
          id: uid,
          email,
          name,
          surname,
          photo: photo || null,
          createdAt: new Date(),
        } as User;

        await this.userRepository.create(userData);
      } else {
        userData = user;
      }

      return {
        message: 'Sign in successful',
        user: {
          email,
          uid,
          name: userData?.name,
          surname: userData?.surname,
          photo: userData?.photo,
        } as Auth,
      };
    } catch {
      throw new BadRequestException('Invalid token');
    }
  }

  async deleteUser(uid: string) {
    try {
      const userData = await this.userRepository.findOne(uid);

      if (userData?.photo) {
        try {
          const match = userData.photo.match(/\/o\/([^?]+)/);
          if (match) {
            const filePath = decodeURIComponent(match[1]);
            await admin.storage().bucket().file(filePath).delete();
            console.log(`Deleted user profile photo: ${filePath}`);
          }
        } catch (error) {
          console.error('Error deleting user profile photo:', error);
        }
      }

      await this.postService.deleteAllPostsByUserId(uid);
      await this.commentService.deleteByUserId(uid);

      await this.userRepository.delete(uid);
      await this.reactionRepository.deleteByUserId(uid);
      await admin.auth().deleteUser(uid);

      return { message: 'User deleted successfully' };
    } catch {
      throw new InternalServerErrorException(
        'An unexpected error occurred while deleting user account',
      );
    }
  }
}
