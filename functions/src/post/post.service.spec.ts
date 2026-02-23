import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { PostRepository } from './repositories/post.repository';
import { UserRepository } from '../user/repositories/user.repository';
import { ReactionRepository } from '../reaction/repositories/reaction.repository';
import { CommentRepository } from '../comment/repositories/comment.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { Post } from './entities/post.entity';

describe('PostService', () => {
  let service: PostService;
  let postRepository: jest.Mocked<PostRepository>;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const mockPostRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAllByUserId: jest.fn(),
    };
    const mockUserRepository = { findOne: jest.fn() };
    const mockReactionRepository = {
      findByUserAndPostIds: jest.fn(),
      findOne: jest.fn(),
      deleteByPostId: jest.fn(),
    };
    const mockCommentRepository = { deleteByPostId: jest.fn() };
    const mockEventEmitter = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        { provide: PostRepository, useValue: mockPostRepository },
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: ReactionRepository, useValue: mockReactionRepository },
        { provide: CommentRepository, useValue: mockCommentRepository },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    postRepository = module.get(PostRepository);
    userRepository = module.get(UserRepository);
  });

  describe('create', () => {
    it('should create a post with user details', async () => {
      userRepository.findOne.mockResolvedValue({
        name: 'Marian',
        surname: 'Kvit',
        photo: 'img.jpg',
      } as User);
      postRepository.create.mockResolvedValue({
        id: 'p1',
        title: 'Test Title',
        text: 'T',
      } as Post);

      const result = await service.create(
        { title: 'Test Title', text: 'T' },
        'user1',
      );
      expect(result.id).toBe('p1');
      expect(postRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user1',
          text: 'T',
          title: 'Test Title',
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should fetch a post correctly', async () => {
      postRepository.findOne.mockResolvedValue({ id: 'p1' } as Post);
      const result = await service.findOne('p1', 'user1');
      expect(result.id).toBe('p1');
    });

    it('should error when a post is missing', async () => {
      postRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('missing-post')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update text when the user is the owner', async () => {
      postRepository.findOne
        .mockResolvedValue({ id: 'p1', userId: 'owner' } as Post)
        .mockResolvedValue({
          id: 'p1',
          userId: 'owner',
          text: 'New content',
        } as Post);

      await service.update('p1', { text: 'New content' }, 'owner');
      expect(postRepository.update).toHaveBeenCalledWith(
        'p1',
        expect.objectContaining({ text: 'New content' }),
      );
    });

    it('should block non-owners from updating', async () => {
      postRepository.findOne.mockResolvedValue({
        id: 'p1',
        userId: 'owner',
      } as Post);
      await expect(
        service.update('p1', { text: 'Hacked' }, 'not-owner'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should let the owner delete their post', async () => {
      postRepository.findOne.mockResolvedValue({
        id: 'p1',
        userId: 'owner',
      } as Post);
      await service.remove('p1', 'owner');
      expect(postRepository.delete).toHaveBeenCalledWith('p1');
    });

    it('should block non-owners from deleting', async () => {
      postRepository.findOne.mockResolvedValue({
        id: 'p1',
        userId: 'owner',
      } as Post);
      await expect(service.remove('p1', 'not-owner')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
