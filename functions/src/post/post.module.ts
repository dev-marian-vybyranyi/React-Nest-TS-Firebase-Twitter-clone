import { Module, forwardRef } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PostRepository } from './repositories/post.repository';
import { StorageModule } from '../storage/storage.module';
import { PostEventListener } from './listeners/post.listener';
import { UserModule } from '../user/user.module';

@Module({
  imports: [StorageModule, forwardRef(() => UserModule)],
  controllers: [PostController],
  providers: [PostService, PostRepository, PostEventListener],
  exports: [PostService, PostRepository],
})
export class PostModule {}
