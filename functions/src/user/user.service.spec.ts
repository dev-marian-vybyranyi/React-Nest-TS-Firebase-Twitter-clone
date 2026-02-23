import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from '../comment/comment.service';
import { PostService } from '../post/post.service';
import { UserRepository } from './repositories/user.repository';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<UserRepository>;
  let postService: jest.Mocked<PostService>;
  let commentService: jest.Mocked<CommentService>;

  beforeEach(async () => {
    const mockUserRepository = {
      findOne: jest.fn(),
      updateUser: jest.fn(),
    };
    const mockPostService = { updateUserInPosts: jest.fn() };
    const mockCommentService = { updateUserInComments: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: PostService, useValue: mockPostService },
        { provide: CommentService, useValue: mockCommentService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(UserRepository);
    postService = module.get(PostService);
    commentService = module.get(CommentService);
  });

  describe('getUserById', () => {
    it('should return a user if the user exists', async () => {
      userRepository.findOne.mockResolvedValue({
        id: '1',
        name: 'Test',
      } as any);
      const user = await service.getUserById('1');
      expect(user).toEqual({ id: '1', name: 'Test' });
      expect(userRepository.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when user is missing', async () => {
      userRepository.findOne.mockResolvedValue(null);
      await expect(service.getUserById('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateUser', () => {
    it('should update user profile and notify related services', async () => {
      const existingUser = {
        id: 'u1',
        name: 'Old',
        surname: 'User',
        photo: 'p1.jpg',
      };
      userRepository.findOne.mockResolvedValue(existingUser as any);
      userRepository.updateUser.mockResolvedValue(undefined as any);

      await service.updateUser('u1', { name: 'New' });

      expect(userRepository.updateUser).toHaveBeenCalledWith('u1', {
        name: 'New',
      });
      expect(postService.updateUserInPosts).toHaveBeenCalledWith(
        'u1',
        expect.any(Object),
      );
      expect(commentService.updateUserInComments).toHaveBeenCalledWith(
        'u1',
        expect.any(Object),
      );
    });

    it('should not notify related services if name, surname, and photo are missing', async () => {
      userRepository.findOne.mockResolvedValue({ id: 'u1' } as any);

      const result = await service.updateUser('u1', {});

      expect(postService.updateUserInPosts).not.toHaveBeenCalled();
      expect(commentService.updateUserInComments).not.toHaveBeenCalled();
      expect(result.message).toBe('User updated successfully');
    });
  });
});
