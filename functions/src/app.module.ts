import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { StorageModule } from './storage/storage.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ReactionModule } from './reaction/reaction.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    PostModule,
    StorageModule,
    EventEmitterModule.forRoot(),
    ReactionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
