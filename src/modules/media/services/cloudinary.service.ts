import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as sharp from 'sharp';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_SECRET'),
    });
  }

  /**
   * @author Tony Vu - Optimized with Sharp
   * Nén ảnh ngay tại NestJS trước khi gửi lên Cloudinary
   */
  async uploadFoodImage(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse> {
    
    // TỐI ƯU TẠI SERVER: Nén ảnh trước khi đẩy lên Cloud
    // Việc này giúp giảm băng thông từ Server của bạn đi lên Cloudinary
    const optimizedBuffer = await sharp(file.buffer)
      .resize(1200, 1200, { // Resize về 1200px (đủ nét cho Gemini/AI)
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ quality: 80, progressive: true }) // Nén chất lượng xuống 80%
      .toBuffer();

    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: 'calo-food-scans',
          resource_type: 'image',
          // Cloudinary vẫn có thể xử lý thêm nếu cần
          transformation: [
            { quality: "auto" },
            { fetch_format: "auto" }
          ]
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      
      // Sử dụng streamifier để đẩy buffer đã nén vào upload stream
      streamifier.createReadStream(optimizedBuffer).pipe(upload);
    });
  }

  /**
   * Tạo dynamic URL với transformations (Giữ nguyên logic của bạn)
   */
  getImageUrl(
    publicId: string,
    options?: {
      width?: number;
      height?: number;
      crop?: 'thumb' | 'fill' | 'scale' | 'fit' | 'limit' | 'pad';
      gravity?: 'face' | 'auto' | 'center' | 'north' | 'south' | 'east' | 'west';
      radius?: 'max' | number;
      format?: 'auto' | 'jpg' | 'png' | 'webp';
      quality?: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | number;
      fetchFormat?: 'auto' | 'jpg' | 'png' | 'webp';
    }
  ): string {
    const transformations: any[] = [];
    if (options?.crop === 'thumb' && options?.width && options?.height) {
      transformations.push({
        crop: 'thumb',
        width: options.width,
        height: options.height,
        gravity: options.gravity || 'auto',
      });
    } else {
      if (options?.width) transformations.push({ width: options.width });
      if (options?.height) transformations.push({ height: options.height });
      if (options?.crop) transformations.push({ crop: options.crop });
      if (options?.gravity) transformations.push({ gravity: options.gravity });
    }
    if (options?.radius === 'max') transformations.push({ radius: 'max' });
    else if (options?.radius) transformations.push({ radius: options.radius });
    
    if (options?.format || options?.fetchFormat) {
      transformations.push({ fetch_format: options.format || options.fetchFormat || 'auto' });
    }
    if (options?.quality) transformations.push({ quality: options.quality });

    return cloudinary.url(publicId, {
      transformation: transformations,
      secure: true,
    });
  }

  getThumbnailUrl(publicId: string, size: number = 200): string {
    return this.getImageUrl(publicId, {
      crop: 'thumb',
      width: size,
      height: size,
      gravity: 'face',
      radius: 'max',
      format: 'auto',
    });
  }

  getSquareUrl(publicId: string, size: number = 400): string {
    return this.getImageUrl(publicId, {
      crop: 'fill',
      width: size,
      height: size,
      gravity: 'auto',
      format: 'auto',
      quality: 'auto:best',
    });
  }

  getOptimizedUrl(publicId: string, maxWidth?: number): string {
    return this.getImageUrl(publicId, {
      width: maxWidth,
      crop: 'limit',
      format: 'auto',
      quality: 'auto:best',
    });
  }
}