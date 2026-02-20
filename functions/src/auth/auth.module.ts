import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PostModule } from '../post/post.module';
import { ReactionModule } from '../reaction/reaction.module';
import { UserModule } from '../user/user.module';
import { CommentModule } from '../comment/comment.module';

@Module({
  imports: [PostModule, ReactionModule, UserModule, CommentModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
