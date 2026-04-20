import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Standard secure configuration via environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Streams an in-memory buffer straight to Cloudinary bypassin local disk IO
 */
export const uploadBufferToCloudinary = async (buffer: Buffer, folder: string = 'complaints'): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary] Stream Upload Error:', error);
          reject(error);
        } else {
          resolve(result!.secure_url);
        }
      }
    );

    // Convert Buffer to Readable Stream and pipe to Cloudinary
    const readable = new Readable({
      read() {
        this.push(buffer);
        this.push(null);
      }
    });

    readable.pipe(stream);
  });
};
