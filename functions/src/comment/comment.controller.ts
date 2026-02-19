import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentService } from './comment.service';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get(':postId')
  async findAll(
    @Param('postId') postId: string,
    @Query('limit') limit: number = 10,
    @Query('cursor') cursor?: string,
  ) {
    return this.commentService.findAll(postId, limit, cursor);
  }

  @Get(':id/replies')
  async findReplies(
    @Param('id') id: string,
    @Query('limit') limit: number = 5,
    @Query('cursor') cursor?: string,
  ) {
    return this.commentService.findReplies(id, limit, cursor);
  }

  @Post()
  async create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentService.create(
      createCommentDto.postId,
      createCommentDto.authorId,
      createCommentDto.authorUsername,
      createCommentDto.authorPhotoURL || null,
      createCommentDto.content,
      createCommentDto.parentId,
    );
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.update(
      id,
      updateCommentDto.requesterId,
      updateCommentDto.content,
    );
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Body('requesterId') requesterId: string,
  ) {
    return this.commentService.remove(id, requesterId);
  }
}
