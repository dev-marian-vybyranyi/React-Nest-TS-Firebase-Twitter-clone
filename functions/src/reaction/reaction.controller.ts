import {
  Controller,
  Delete,
  Param,
  Put,
  Request,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('posts/:postId/reactions')
export class ReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  @Get()
  getStats(@Param('postId') postId: string) {
    return this.reactionService.getPostStats(postId);
  }

  @Put(':type')
  @UseGuards(AuthGuard)
  react(
    @Param('postId') postId: string,
    @Param('type') type: string,
    @Request() req,
  ) {
    return this.reactionService.react(req.user.uid, postId, type as any);
  }

  @Delete()
  @UseGuards(AuthGuard)
  remove(@Param('postId') postId: string, @Request() req) {
    return this.reactionService.remove(req.user.uid, postId);
  }
}
