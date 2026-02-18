import { Injectable } from '@nestjs/common';
import { ReactionRepository } from './repositories/reaction.repository';
import { ReactionEntity, ReactionType } from './entities/reaction.entity';

@Injectable()
export class ReactionService {
  constructor(private readonly reactionRepository: ReactionRepository) {}

  async react(
    userId: string,
    postId: string,
    type: ReactionType,
  ): Promise<void> {
    const existing = await this.reactionRepository.findOne(userId, postId);

    if (existing?.type === type) {
      await this.reactionRepository.delete(userId, postId);
      return;
    }

    await this.reactionRepository.upsert({ userId, postId, type });
  }

  async remove(userId: string, postId: string): Promise<void> {
    await this.reactionRepository.delete(userId, postId);
  }

  async getPostStats(
    postId: string,
    userId: string,
  ): Promise<{
    likes: number;
    dislikes: number;
    userReaction: ReactionType | null;
  }> {
    const likes = await this.reactionRepository.countByPostAndType(
      postId,
      'like',
    );
    const dislikes = await this.reactionRepository.countByPostAndType(
      postId,
      'dislike',
    );

    const reaction = await this.reactionRepository.findOne(userId, postId);
    const userReaction = reaction?.type ?? null;

    return { likes, dislikes, userReaction };
  }
}
