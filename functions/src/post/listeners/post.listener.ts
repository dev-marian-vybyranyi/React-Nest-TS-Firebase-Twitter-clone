import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PostDeletedEvent } from '../events/post-deleted.event';
import { PostUpdatedEvent } from '../events/post-updated.event';
import { StorageService } from '../../storage/storage.service';

@Injectable()
export class PostEventListener {
  constructor(private readonly storageService: StorageService) {}

  @OnEvent('post.deleted')
  async handlePostDeletedEvent(event: PostDeletedEvent) {
    if (event.photoUrl) {
      const filePath = this.storageService.extractFilePathFromUrl(
        event.photoUrl,
      );
      if (filePath) {
        await this.storageService.deleteFile(filePath);
      }
    }
  }

  @OnEvent('post.updated')
  async handlePostUpdatedEvent(event: PostUpdatedEvent) {
    if (event.oldPhotoUrl) {
      const filePath = this.storageService.extractFilePathFromUrl(
        event.oldPhotoUrl,
      );
      if (filePath) {
        await this.storageService.deleteFile(filePath);
      }
    }
  }
}
