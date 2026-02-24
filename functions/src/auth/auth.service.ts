import {
  BadRequestException,
  ConflictException,
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
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly postService: PostService,
    private readonly reactionRepository: ReactionRepository,
    private readonly userRepository: UserRepository,
    private readonly commentService: CommentService,
    private readonly emailService: EmailService,
  ) {}
  async signup(createAuthDto: CreateAuthDto) {
    const { email, password, name, surname, photo } = createAuthDto;

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: `${name} ${surname}`,
      photoURL: photo && photo.trim() !== '' ? photo : undefined,
    });

    try {
      await this.userRepository.create({
        id: userRecord.uid,
        email: userRecord.email || '',
        name,
        surname,
        photo: photo || null,
        emailVerified: false,
        createdAt: new Date(),
      } as User);

      try {
        await this.emailService.sendVerificationLink(email, name);
      } catch (emailError) {
        this.logger.warn(
          `Failed to send verification email to ${email}`,
          (emailError as Error).message,
        );
      }

      return {
        uid: userRecord.uid,
        email: userRecord.email,
        message: 'User created successfully',
      };
    } catch (e) {
      await admin.auth().deleteUser(userRecord.uid);

      const error = e as Error & { code?: string };
      if (error.code === 'auth/email-already-exists') {
        throw new ConflictException('User with this email already exists');
      }
      throw e;
    }
  }

  async googleLogin(googleLoginDto: GoogleLoginDto) {
    return admin.firestore().runTransaction(async (transaction) => {
      const decodedToken = await admin
        .auth()
        .verifyIdToken(googleLoginDto.token);
      const { email, uid } = decodedToken;
      const googleName = String(decodedToken.name || '');
      const photo = String(decodedToken.picture || '');

      const user = await this.userRepository.findOne(uid, transaction);

      let userData: Partial<User>;

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
          emailVerified: true,
          createdAt: new Date(),
        } as User;
        await this.userRepository.create(userData as User, transaction);
        this.logger.log(`Created new user profile for ${email}`);
      } else {
        userData = { emailVerified: true };
        await this.userRepository.updateUser(uid, userData, transaction);
        this.logger.log(`User ${email} already exists. Logging in...`);
      }

      const finalUser = user || userData;

      return {
        message: 'Google auth successful',
        user: {
          email,
          uid,
          name: finalUser?.name,
          surname: finalUser?.surname,
          photo: finalUser?.photo,
        } as Auth,
      };
    });
  }

  async signIn(signInDto: SignInDto) {
    return admin.firestore().runTransaction(async (transaction) => {
      const decodedToken = await admin.auth().verifyIdToken(signInDto.token);
      const { email, uid } = decodedToken;
      const googleName = String(decodedToken.name || '');
      const photo = String(decodedToken.picture || '');
      const emailVerified = decodedToken.email_verified ?? false;

      const user = await this.userRepository.findOne(uid, transaction);

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
          emailVerified,
          createdAt: new Date(),
        } as User;

        await this.userRepository.create(userData, transaction);
      } else {
        userData = user;
        if (emailVerified && !user.emailVerified) {
          await this.userRepository.updateUser(
            uid,
            { emailVerified: true },
            transaction,
          );
          userData = { ...user, emailVerified: true };
        }
      }

      return {
        message: 'Sign in successful',
        user: {
          email,
          uid,
          name: userData?.name,
          surname: userData?.surname,
          photo: userData?.photo,
          emailVerified: userData?.emailVerified ?? emailVerified,
        } as Auth,
      };
    });
  }

  async forgotPassword(email: string) {
    await this.emailService.sendPasswordResetLink(email);
    return { message: 'Password reset email sent' };
  }

  async deleteUser(uid: string) {
    const userData = await this.userRepository.findOne(uid);

    if (!userData) {
      throw new ConflictException('User not found');
    }

    if (userData.photo) {
      try {
        const match = userData.photo.match(/\/o\/([^?]+)/);
        if (match) {
          const filePath = decodeURIComponent(match[1]);
          await admin.storage().bucket().file(filePath).delete();
          this.logger.log(`Deleted user profile photo: ${filePath}`);
        }
      } catch (error) {
        this.logger.warn(
          `Failed to delete user profile photo: ${userData.photo}`,
          (error as Error).message,
        );
      }
    }

    await this.postService.deleteAllPostsByUserId(uid);
    await this.commentService.deleteByUserId(uid);
    await this.reactionRepository.deleteByUserId(uid);

    await this.userRepository.delete(uid);

    await admin.auth().deleteUser(uid);

    this.logger.log(`User ${uid} deleted successfully`);
    return { message: 'User deleted successfully' };
  }
}
