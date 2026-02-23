import { Test, TestingModule } from '@nestjs/testing';
import { ReactionService } from './reaction.service';
import { ReactionRepository } from './repositories/reaction.repository';

describe('ReactionService', () => {
  let service: ReactionService;
  let repository: jest.Mocked<ReactionRepository>;

  beforeEach(async () => {
    const mockReactionRepository = {
      findOne: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
      countByPostAndType: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReactionService,
        { provide: ReactionRepository, useValue: mockReactionRepository },
      ],
    }).compile();

    service = module.get<ReactionService>(ReactionService);
    repository = module.get(ReactionRepository);
  });

  describe('react', () => {
    it('should add a new reaction if none exists', async () => {
      repository.findOne.mockResolvedValue(null);
      await service.react('user1', 'post1', 'like');
      expect(repository.upsert).toHaveBeenCalledWith({
        userId: 'user1',
        postId: 'post1',
        type: 'like',
      });
    });

    it('should remove the reaction if clicking the same type again (toggle)', async () => {
      repository.findOne.mockResolvedValue({ type: 'like' } as any);
      await service.react('user1', 'post1', 'like');
      expect(repository.delete).toHaveBeenCalledWith('user1', 'post1');
    });

    it('should overwrite the reaction if changing from like to dislike', async () => {
      repository.findOne.mockResolvedValue({ type: 'like' } as any);
      await service.react('user1', 'post1', 'dislike');
      expect(repository.upsert).toHaveBeenCalledWith({
        userId: 'user1',
        postId: 'post1',
        type: 'dislike',
      });
    });
  });

  describe('remove', () => {
    it('should delete a reaction based on user and post', async () => {
      await service.remove('user1', 'post1');
      expect(repository.delete).toHaveBeenCalledWith('user1', 'post1');
    });
  });

  describe('getPostStats', () => {
    it('should fetch total likes, dislikes, and current user reaction', async () => {
      repository.countByPostAndType.mockImplementation(async (postId, type) =>
        type === 'like' ? 10 : 2,
      );
      repository.findOne.mockResolvedValue({ type: 'like' } as any);

      const result = await service.getPostStats('post1', 'user1');
      expect(result).toEqual({ likes: 10, dislikes: 2, userReaction: 'like' });
    });

    it('should handle cases where the user has not reacted', async () => {
      repository.countByPostAndType.mockResolvedValue(0);
      repository.findOne.mockResolvedValue(null);

      const result = await service.getPostStats('post1', 'user1');
      expect(result).toEqual({ likes: 0, dislikes: 0, userReaction: null });
    });
  });
});
