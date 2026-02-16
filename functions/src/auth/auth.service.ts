import { BadRequestException, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { CreateAuthDto } from './dto/create-auth.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { SignInDto } from './dto/signIn.dto';
import { Auth } from './entities/auth.entity';

@Injectable()
export class AuthService {
  async signup(createAuthDto: CreateAuthDto) {
    const { email, password, name, surname, photo } = createAuthDto;

    try {
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: `${name} ${surname}`,
        photoURL: photo && photo.trim() !== '' ? photo : undefined,
      });

      await admin
        .firestore()
        .collection('users')
        .doc(userRecord.uid)
        .set({
          email: userRecord.email,
          name,
          surname,
          photo: photo || null,
          createdAt: new Date().toISOString(),
        });

      return {
        uid: userRecord.uid,
        email: userRecord.email,
        message: 'User created successfully',
      };
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        throw new BadRequestException('User with this email already exists');
      }
      throw new BadRequestException(error.message);
    }
  }

  async googleLogin(googleLoginDto: GoogleLoginDto) {
    try {
      const decodedToken = await admin
        .auth()
        .verifyIdToken(googleLoginDto.token);
      const { email, uid, name: googleName, picture: photo } = decodedToken;

      const name = googleName ? googleName.split(' ')[0] : '';
      const surname =
        googleName && googleName.split(' ').length > 1
          ? googleName.split(' ')[1]
          : '';

      const userRef = admin.firestore().collection('users').doc(uid);
      const userSnap = await userRef.get();

      if (!userSnap.exists) {
        await userRef.set({
          email,
          name,
          surname,
          photo: photo || null,
          createdAt: new Date().toISOString(),
        });
        console.log(`Created new user profile for ${email}`);
      } else {
        console.log(`User ${email} already exists. Logging in...`);
      }

      const userData = userSnap.exists
        ? userSnap.data()
        : { name, surname, photo };

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
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async signIn(signInDto: SignInDto) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(signInDto.token);
      const { email, uid, name: googleName, picture: photo } = decodedToken;

      const userRef = admin.firestore().collection('users').doc(uid);
      const userSnap = await userRef.get();

      let userData;

      if (!userSnap.exists) {
        const name = googleName ? googleName.split(' ')[0] : '';
        const surname =
          googleName && googleName.split(' ').length > 1
            ? googleName.split(' ')[1]
            : '';

        userData = {
          email,
          name,
          surname,
          photo: photo || null,
          createdAt: new Date().toISOString(),
        };

        await userRef.set(userData);
      } else {
        userData = userSnap.data();
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
    } catch (error) {
      throw new BadRequestException('Invalid token');
    }
  }

  async deleteUser(uid: string) {
    try {
      await admin.auth().deleteUser(uid);
      await admin.firestore().collection('users').doc(uid).delete();
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
