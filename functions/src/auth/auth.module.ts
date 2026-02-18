import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PostModule } from '../post/post.module';
import { ReactionModule } from '../reaction/reaction.module';

@Module({
  imports: [PostModule, ReactionModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
