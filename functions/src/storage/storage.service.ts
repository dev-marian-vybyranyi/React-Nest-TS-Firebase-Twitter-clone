import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private get bucket() {
    return admin.storage().bucket();
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await this.bucket.file(filePath).delete();
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Failed to delete file: ${filePath}`, error.stack);
      throw new InternalServerErrorException(
        'An unexpected error occurred while deleting the file',
      );
    }
  }

  extractFilePathFromUrl(url: string): string | null {
    const match = url.match(/\/o\/([^?]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }
}
