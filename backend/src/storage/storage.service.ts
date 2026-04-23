import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  private s3: S3Client;
  private bucket: string;

  constructor(private configService: ConfigService) {
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET') || '';
    this.s3 = new S3Client({ 
      region: this.configService.get<string>('AWS_REGION') || 'ap-south-1', 
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  async uploadFile(buffer: Buffer, key: string, contentType: string): Promise<string> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ACL: 'public-read',
      }),
    );
    return `https://${this.bucket}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    // If key is a full URL, extract the key
    const actualKey = key.includes('amazonaws.com/') 
      ? key.split('amazonaws.com/')[1] 
      : key;
      
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: actualKey,
      }),
    );
  }
}
