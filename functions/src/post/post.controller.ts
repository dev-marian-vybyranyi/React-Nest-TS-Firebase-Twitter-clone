import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { PostsAuthorizationGuard } from './guards/posts-authorization.guard';
import { sortOptions } from './repositories/post.repository';
import { Request as ExpressRequest } from 'express';

interface RequestWithUser extends ExpressRequest {
  user: {
    uid: string;
  };
}

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Body() createPostDto: CreatePostDto,
    @Request() req: RequestWithUser,
  ) {
    return this.postService.create(createPostDto, req.user.uid);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(
    @Query('limit') limit?: string,
    @Query('lastDocId') lastDocId?: string,
    @Query('sortBy') sortBy?: sortOptions,
    @Request() req?: RequestWithUser,
  ) {
    const pageSize = limit ? parseInt(limit) : 10;
    return this.postService.findAll(pageSize, lastDocId, req?.user.uid, sortBy);
  }

  @Get('user/:userId')
  @UseGuards(AuthGuard)
  findByUserId(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
    @Query('lastDocId') lastDocId?: string,
    @Query('sortBy') sortBy?: sortOptions,
    @Request() req?: RequestWithUser,
  ) {
    const pageSize = limit ? parseInt(limit) : 10;
    return this.postService.findByUserId(
      userId,
      pageSize,
      lastDocId,
      req?.user.uid,
      sortBy,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string, @Request() req?: RequestWithUser) {
    return this.postService.findOne(id, req?.user.uid);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, PostsAuthorizationGuard)
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, PostsAuthorizationGuard)
  remove(@Param('id') id: string) {
    return this.postService.remove(id);
  }
}
