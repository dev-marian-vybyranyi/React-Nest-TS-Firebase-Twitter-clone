import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { CommentRepository } from './repositories/comment.repository';
import * as admin from 'firebase-admin';

jest.mock('firebase-admin', () => ({
  firestore: jest.fn(),
}));
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

describe('CommentService', () => {
  let service: CommentService;
  let repository: jest.Mocked<CommentRepository>;

  beforeEach(async () => {
    const mockCommentRepository = {
      findOne: jest.fn(),
      findAll: jest.fn(),
      findReplies: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      softDelete: jest.fn(),
      updateUserInComments: jest.fn(),
      deleteByUserId: jest.fn(),
    };

    const mockTransaction = {
      get: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    (admin.firestore as unknown as jest.Mock).mockReturnValue({
      runTransaction: jest.fn().mockImplementation((cb) => cb(mockTransaction)),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: CommentRepository,
          useValue: mockCommentRepository,
        },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
    repository = module.get(CommentRepository);
  });

  describe('findOne', () => {
    it('should return a comment by id', async () => {
      repository.findOne.mockResolvedValue({
        id: '1',
        content: 'test comment',
      } as any);
      const result = await service.findOne('1');
      expect(result).toEqual({ id: '1', content: 'test comment' });
      expect(repository.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('create', () => {
    it('should create a new comment', async () => {
      repository.create.mockResolvedValue({
        id: '1',
        content: 'new comment',
      } as any);
      const result = await service.create(
        'post1',
        'user1',
        'Username',
        null,
        'new comment',
      );

      expect(result).toEqual({ id: '1', content: 'new comment' });
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          postId: 'post1',
          authorId: 'user1',
          content: 'new comment',
        }),
        expect.anything(),
      );
    });

    it('should throw an error if parent comment is not found', async () => {
      repository.findOne.mockResolvedValue(null);
      await expect(
        service.create('p1', 'u1', 'Name', null, 'text', 'badParentId'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update comment content if the user is the author', async () => {
      repository.findOne.mockResolvedValue({
        id: '1',
        authorId: 'user1',
        isDeleted: false,
      } as any);
      await service.update('1', 'user1', 'updated text');

      expect(repository.update).toHaveBeenCalledWith('1', {
        content: 'updated text',
      });
    });

    it('should throw ForbiddenException if another user tries to edit', async () => {
      repository.findOne.mockResolvedValue({
        id: '1',
        authorId: 'other-user',
        isDeleted: false,
      } as any);
      await expect(
        service.update('1', 'user1', 'updated text'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete a comment completely if it has no replies', async () => {
      repository.findOne.mockResolvedValue({
        id: '1',
        authorId: 'user1',
        replyCount: 0,
        parentId: null,
      } as any);
      await service.remove('1', 'user1');

      expect(repository.delete).toHaveBeenCalledWith(
        '1',
        null,
        expect.anything(),
      );
    });

    it('should soft delete a comment if it has replies', async () => {
      repository.findOne.mockResolvedValue({
        id: '1',
        authorId: 'user1',
        replyCount: 5,
      } as any);
      await service.remove('1', 'user1');

      expect(repository.softDelete).toHaveBeenCalledWith(
        '1',
        expect.anything(),
      );
    });
  });
});
