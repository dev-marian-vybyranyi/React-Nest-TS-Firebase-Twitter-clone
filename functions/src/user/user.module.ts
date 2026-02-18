import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PostModule } from '../post/post.module';
import { UserRepository } from './repositories/user.repository';

@Module({
  imports: [forwardRef(() => PostModule)],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
