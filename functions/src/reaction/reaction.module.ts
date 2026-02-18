import { Module } from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { ReactionController } from './reaction.controller';
import { ReactionRepository } from './repositories/reaction.repository';

@Module({
  controllers: [ReactionController],
  providers: [ReactionService, ReactionRepository],
  exports: [ReactionRepository],
})
export class ReactionModule {}
