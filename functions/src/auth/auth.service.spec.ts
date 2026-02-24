import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PostService } from '../post/post.service';
import { CommentService } from '../comment/comment.service';
import { ReactionRepository } from '../reaction/repositories/reaction.repository';
import { UserRepository } from '../user/repositories/user.repository';
import { EmailService } from '../email/email.service';
import { User } from '../user/entities/user.entity';
import { ConflictException } from '@nestjs/common';
import * as admin from 'firebase-admin';

jest.mock('firebase-admin', () => ({
  auth: jest.fn(),
  storage: jest.fn(),
  firestore: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<UserRepository>;
  let postService: jest.Mocked<PostService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const mockUserRepository = {
      create: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      updateUser: jest.fn(),
    };
    const mockPostService = { deleteAllPostsByUserId: jest.fn() };
    const mockCommentService = { deleteByUserId: jest.fn() };
    const mockReactionRepository = { deleteByUserId: jest.fn() };
    const mockEmailService = {
      sendVerificationLink: jest.fn().mockResolvedValue(undefined),
      sendPasswordResetLink: jest.fn().mockResolvedValue(undefined),
      sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
      sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: PostService, useValue: mockPostService },
        { provide: CommentService, useValue: mockCommentService },
        { provide: ReactionRepository, useValue: mockReactionRepository },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    (admin.firestore as unknown as jest.Mock).mockReturnValue({
      runTransaction: jest.fn().mockImplementation((cb) =>
        cb({
          get: jest.fn(),
          set: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        }),
      ),
    });

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(UserRepository);
    postService = module.get(PostService);
  });

  describe('signup', () => {
    it('should create a new user in Firebase and Firestore', async () => {
      (admin.auth as unknown as jest.Mock).mockReturnValue({
        createUser: jest
          .fn()
          .mockResolvedValue({ uid: 'test-uid', email: 'test@test.com' }),
        generateEmailVerificationLink: jest
          .fn()
          .mockResolvedValue('https://verify-link.com'),
      });
      userRepository.create.mockResolvedValue(undefined);

      const result = await service.signup({
        email: 'test@test.com',
        password: 'pass',
        name: 'Marian',
        surname: 'Kvit',
      });

      expect(result.uid).toBe('test-uid');
      expect(userRepository.create).toHaveBeenCalled();
    });

    it('should throw an error and rollback Auth user if Firestore fails', async () => {
      const deleteUserMock = jest.fn().mockResolvedValue(undefined);
      (admin.auth as unknown as jest.Mock).mockReturnValue({
        createUser: jest
          .fn()
          .mockResolvedValue({ uid: 'test-uid', email: 'test@test.com' }),
        deleteUser: deleteUserMock,
      });
      userRepository.create.mockRejectedValue(new Error('Firestore failed'));

      await expect(
        service.signup({
          email: 'error@test.com',
          password: 'pass',
          name: 'Marian',
          surname: 'Kvit',
        }),
      ).rejects.toThrow('Firestore failed');

      expect(deleteUserMock).toHaveBeenCalledWith('test-uid');
    });
  });

  describe('googleLogin', () => {
    it('should login an existing user from Firestore using a transaction', async () => {
      const transactionMock = {
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
      };
      (admin.firestore as unknown as jest.Mock).mockReturnValue({
        runTransaction: jest
          .fn()
          .mockImplementation((cb) => cb(transactionMock)),
      });
      (admin.auth as unknown as jest.Mock).mockReturnValue({
        verifyIdToken: jest
          .fn()
          .mockResolvedValue({ uid: 'test-uid', email: 'test@test.com' }),
      });
      userRepository.findOne.mockResolvedValue({
        id: 'test-uid',
        name: 'Marian',
        surname: 'Kvit',
      } as User);

      const result = await service.googleLogin({ token: 'token' });
      expect(result.user.uid).toBe('test-uid');
      expect(userRepository.findOne).toHaveBeenCalledWith(
        'test-uid',
        transactionMock,
      );
    });
  });

  describe('deleteUser', () => {
    it('should remove the user entirely including their avatar, posts, etc.', async () => {
      userRepository.findOne.mockResolvedValue({
        photo: 'http://link-to-photo.jpg',
      } as User);
      (admin.storage as unknown as jest.Mock).mockReturnValue({
        bucket: jest.fn().mockReturnValue({
          file: jest.fn().mockReturnValue({ delete: jest.fn() }),
        }),
      });
      (admin.auth as unknown as jest.Mock).mockReturnValue({
        deleteUser: jest.fn().mockResolvedValue(undefined),
      });

      const result = await service.deleteUser('test-uid');
      expect(result.message).toBe('User deleted successfully');
      expect(userRepository.delete).toHaveBeenCalledWith('test-uid');
      expect(postService.deleteAllPostsByUserId).toHaveBeenCalledWith(
        'test-uid',
      );
    });
  });
});
