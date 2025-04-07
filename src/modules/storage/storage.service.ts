import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Injectable()
export class StorageService {
  private s3: AWS.S3;
  private region: string;
  private bucket: string;

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

  async uploadFile(file: { originalname: string; buffer: Buffer; mimetype: string }, path: string): Promise<string> {
    const decodedName = decodeURIComponent(file.originalname);
    const uniqueFileName = `${Date.now()}-${encodeURIComponent(decodedName)}`;

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
}
