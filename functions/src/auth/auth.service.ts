import { BadRequestException, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { CreateAuthDto } from './dto/create-auth.dto';
import { GoogleLoginDto } from './dto/google-login.dto';

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
      const { email, uid } = decodedToken;

      const userRef = admin.firestore().collection('users').doc(uid);
      const userSnap = await userRef.get();

      if (!userSnap.exists) {
        await userRef.set({
          email,
          createdAt: new Date().toISOString(),
        });
        console.log(`Created new user profile for ${email}`);
      } else {
        console.log(`User ${email} already exists. Logging in...`);
      }

      return {
        message: 'Google auth successful',
        user: { email, uid },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
