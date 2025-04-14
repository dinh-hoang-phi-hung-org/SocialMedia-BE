import { FileType } from '@/shared/enum/file-type';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

export interface MediaFile {
  url: string;
  type: FileType;
}

@Injectable()
export class StorageService {
  private s3: AWS.S3;
  private region: string;
  private bucket: string;

  private readonly allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
  private readonly allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-ms-wmv', 'video/webm'];

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.get('SPACES_REGION') || 'nyc3';
    this.bucket = this.configService.get('SPACES_BUCKET') || '';

    this.s3 = new AWS.S3({
      endpoint: this.configService.get('SPACES_ENDPOINT'),
      accessKeyId: this.configService.get('SPACES_KEY'),
      secretAccessKey: this.configService.get('SPACES_SECRET'),
      region: this.region,
    });
  }

  /**
   * Get the media type based on mimetype
   */
  getMediaType(mimetype: string): FileType {
    if (this.allowedImageTypes.includes(mimetype)) {
      return FileType.IMAGE;
    } else if (this.allowedVideoTypes.includes(mimetype)) {
      return FileType.VIDEO;
    }
    return FileType.UNKNOWN;
  }

  /**
   * Upload a single file to DigitalOcean Spaces
   */
  async uploadFile(
    file: { originalname: string; buffer: Buffer; mimetype: string },
    path: string,
    name?: string,
  ): Promise<string> {
    let uniqueFileName: string;

    if (name) {
      uniqueFileName = `${name}`;
    } else {
      const decodedName = decodeURIComponent(file.originalname);
      uniqueFileName = `${Date.now()}-${encodeURIComponent(decodedName)}`;
    }

    const params = {
      Bucket: this.bucket,
      Key: `${path}/${uniqueFileName}`,
      Body: file.buffer,
      ACL: 'public-read',
      ContentType: file.mimetype,
    };

    try {
      const result = await this.s3.upload(params).promise();
      return result.Location;
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Upload multiple files and categorize them by type
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async uploadMultipleFiles(files: Array<any>, path: string): Promise<MediaFile[]> {
    if (!files || files.length === 0) {
      return [];
    }

    const uploadPromises: Promise<MediaFile>[] = files.map(async (file, index) => {
      try {
        const url = await this.uploadFile(file, path, `${index}`);
        const type = this.getMediaType(file.mimetype);

        return {
          url,
          type,
        };
      } catch (error) {
        throw new Error(`Failed to upload file ${file.originalname}: ${error.message}`);
      }
    });

    return Promise.all(uploadPromises);
  }

  async deleteFile(key: string): Promise<void> {
    const params = {
      Bucket: this.bucket,
      Key: key,
    };

    try {
      await this.s3.deleteObject(params).promise();
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async deleteFolder(path: string): Promise<void> {
    try {
      const listParams = {
        Bucket: this.bucket,
        Prefix: path,
      };

      const listedObjects = await this.s3.listObjectsV2(listParams).promise();

      if (!listedObjects.Contents || listedObjects.Contents.length === 0) return;

      const deleteParams = {
        Bucket: this.bucket,
        Delete: {
          Objects: listedObjects.Contents.filter((item) => item.Key !== undefined).map((item) => ({
            Key: item.Key as string,
          })),
          Quiet: false,
        },
      };

      await this.s3.deleteObjects(deleteParams).promise();

      if (listedObjects.IsTruncated) {
        await this.deleteFolder(path);
      }
    } catch (error) {
      throw new Error(`Failed to delete folder: ${error.message}`);
    }
  }
}
