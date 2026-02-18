import { Controller, Delete, Param, Put, Request } from '@nestjs/common';
import { ReactionService } from './reaction.service';

@Controller('reaction')
export class ReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  @Put('like')
  like(@Param('postId') postId: string, @Request() req) {
    return this.reactionService.react(req.user.uid, postId, 'like');
  }

  @Put('dislike')
  dislike(@Param('postId') postId: string, @Request() req) {
    return this.reactionService.react(req.user.uid, postId, 'dislike');
  }

  @Delete()
  remove(@Param('postId') postId: string, @Request() req) {
    return this.reactionService.remove(req.user.uid, postId);
  }
}
