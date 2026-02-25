import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentService } from './comment.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CommentsAuthorizationGuard } from './guards/comments-authorization.guard';

@Controller()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get('posts/:postId/comments')
  async findAll(
    @Param('postId') postId: string,
    @Query('limit') limit: number = 10,
    @Query('cursor') cursor?: string,
  ) {
    return this.commentService.findAll(postId, +limit, cursor);
  }

  @Get('comments/:id/replies')
  async findReplies(
    @Param('id') id: string,
    @Query('limit') limit: number = 5,
    @Query('cursor') cursor?: string,
  ) {
    return this.commentService.findReplies(id, +limit, cursor);
  }

  @Post('posts/:postId/comments')
  @UseGuards(AuthGuard)
  async create(
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentService.create(postId, createCommentDto);
  }

  @Patch('comments/:id')
  @UseGuards(AuthGuard, CommentsAuthorizationGuard)
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.update(id, updateCommentDto.content);
  }

  @Delete('comments/:id')
  @UseGuards(AuthGuard, CommentsAuthorizationGuard)
  async remove(@Param('id') id: string) {
    return this.commentService.remove(id);
  }
}
