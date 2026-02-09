import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    // Cấu hình Cloudinary khi module khởi động
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
    });
  }

  /**
   * @author Tony Vu
   * @param file 
   * @returns 
   */
  async uploadFoodImage(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: 'calo-food-scans',
          resource_type: 'auto',
          // Tối ưu cực hạn cho AI: Rộng 800px là đủ để Gemini nhận diện chính xác
          transformation: [
            { width: 800, crop: "limit", quality: "auto:best" },
            { fetch_format: "jpg" } // Chuyển về JPG để đồng bộ dữ liệu gửi AI
          ]
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      
      upload.end(file.buffer);
    });
  }

  /**
   * @author Tony Vu
   * Tạo dynamic URL với transformations
   * @param publicId - Public ID của image trên Cloudinary
   * @param options - Options cho transformations
   * @returns URL string
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

    // Crop và size
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

    // Radius (bo góc)
    if (options?.radius === 'max') {
      transformations.push({ radius: 'max' });
    } else if (options?.radius) {
      transformations.push({ radius: options.radius });
    }

    // Format
    if (options?.format || options?.fetchFormat) {
      transformations.push({ fetch_format: options.format || options.fetchFormat || 'auto' });
    }

    // Quality
    if (options?.quality) {
      transformations.push({ quality: options.quality });
    }

    return cloudinary.url(publicId, {
      transformation: transformations,
      secure: true,
    });
  }

  /**
   * @author Tony Vu
   * Tạo thumbnail URL với face detection (giống ví dụ)
   * @param publicId - Public ID của image
   * @param size - Kích thước (mặc định 200x200)
   * @returns URL string
   */
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

  /**
   * @author Tony Vu
   * Tạo square image URL
   * @param publicId - Public ID của image
   * @param size - Kích thước (mặc định 400x400)
   * @returns URL string
   */
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

  /**
   * @author Tony Vu
   * Tạo optimized URL cho web (tự động format và quality)
   * @param publicId - Public ID của image
   * @param maxWidth - Chiều rộng tối đa
   * @returns URL string
   */
  getOptimizedUrl(publicId: string, maxWidth?: number): string {
    return this.getImageUrl(publicId, {
      width: maxWidth,
      crop: 'limit',
      format: 'auto',
      quality: 'auto:best',
    });
  }
}
