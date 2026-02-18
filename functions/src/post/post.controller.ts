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
import * as admin from 'firebase-admin';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createPostDto: CreatePostDto, @Request() req) {
    return this.postService.create(createPostDto, req.user.uid);
  }

  @Get()
  async findAll(
    @Query('limit') limit?: string,
    @Query('lastDocId') lastDocId?: string,
    @Request() req?,
  ) {
    const pageSize = limit ? parseInt(limit) : 10;
    const currentUserId = await this.getUserIdFromRequest(req);
    return this.postService.findAll(pageSize, lastDocId, currentUserId);
  }

  @Get('user/:userId')
  async findByUserId(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
    @Query('lastDocId') lastDocId?: string,
    @Request() req?,
  ) {
    const pageSize = limit ? parseInt(limit) : 10;
    const currentUserId = await this.getUserIdFromRequest(req);
    return this.postService.findByUserId(
      userId,
      pageSize,
      lastDocId,
      currentUserId,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req?) {
    const currentUserId = await this.getUserIdFromRequest(req);
    return this.postService.findOne(id, currentUserId);
  }

  private async getUserIdFromRequest(req: any): Promise<string | undefined> {
    const authHeader = req?.headers?.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return undefined;
    }

    try {
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      return decodedToken.uid;
    } catch (error) {
      return undefined;
    }
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req,
  ) {
    return this.postService.update(id, updatePostDto, req.user.uid);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.postService.remove(id, req.user.uid);
  }
}
