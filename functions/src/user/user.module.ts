import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PostModule } from '../post/post.module';
import { UserRepository } from './repositories/user.repository';
import { CommentModule } from '../comment/comment.module';

@Module({
  imports: [forwardRef(() => PostModule), CommentModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
