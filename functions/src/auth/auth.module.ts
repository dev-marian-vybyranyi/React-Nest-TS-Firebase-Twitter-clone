import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PostModule } from '../post/post.module';

@Module({
  imports: [PostModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
