import { Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { ListObjectsV2Request } from 'aws-sdk/clients/s3';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Storage')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('test-connection')
  @ApiOperation({ summary: 'Test connection to DigitalOcean Spaces' })
  @ApiResponse({
    status: 200,
    description: 'Connection test results',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        bucket: { type: 'string' },
        objectsCount: { type: 'number' },
        error: { type: 'string', nullable: true },
      },
    },
  })
  async testConnection() {
    try {
      // Try to list objects in the bucket
      const params: ListObjectsV2Request = {
        Bucket: process.env.SPACES_BUCKET || '',
        MaxKeys: 1,
      };

      const result = await this.storageService['s3'].listObjectsV2(params).promise();
      return {
        success: true,
        message: 'Successfully connected to DigitalOcean Spaces',
        bucket: process.env.SPACES_BUCKET,
        objectsCount: result.Contents?.length || 0,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to connect to DigitalOcean Spaces',
        error: error.message,
      };
    }
  }

  @Post('test-upload')
  @ApiOperation({ summary: 'Test file upload to DigitalOcean Spaces' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'File upload results',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        url: { type: 'string', nullable: true },
        error: { type: 'string', nullable: true },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async testUpload(@UploadedFile() file: any) {
    try {
      const fileUrl = await this.storageService.uploadFile(file, 'test');
      return {
        success: true,
        message: 'File uploaded successfully',
        url: fileUrl,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to upload file',
        error: error.message,
      };
    }
  }
}
