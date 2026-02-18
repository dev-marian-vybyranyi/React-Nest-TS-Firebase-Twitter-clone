import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class StorageService {
  private get bucket() {
    return admin.storage().bucket();
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await this.bucket.file(filePath).delete();
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete file: ${filePath}`,
      );
    }
  }

  extractFilePathFromUrl(url: string): string | null {
    const match = url.match(/\/o\/([^?]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }
}
