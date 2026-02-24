import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ReactionRepository } from './repositories/reaction.repository';
import { ReactionType } from './entities/reaction.entity';

@Injectable()
export class ReactionService {
  constructor(private readonly reactionRepository: ReactionRepository) {}

  async react(
    userId: string,
    postId: string,
    type: ReactionType,
  ): Promise<void> {
    await admin.firestore().runTransaction(async (transaction) => {
      const existing = await this.reactionRepository.findOne(
        userId,
        postId,
        transaction,
      );

      if (existing?.type === type) {
        await this.reactionRepository.delete(userId, postId, transaction);
        return;
      }

      await this.reactionRepository.upsert(
        { userId, postId, type },
        transaction,
      );
    });
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
