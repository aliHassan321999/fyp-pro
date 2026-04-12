import dotenv from 'dotenv';
dotenv.config();

import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

console.log('================ CLOUDINARY DEBUG ================');
// Standard secure configuration via environment variables
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('[Cloudinary] Missing configuration environment variables.');
}
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Cloudinary Config Loaded:', cloudinary.config());

export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  folder: string = 'complaints'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log('[UPLOAD] Starting Cloudinary Upload...');
    console.log('[UPLOAD] Buffer Size:', buffer.length);
    console.log('[UPLOAD] Folder:', folder);

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary] Stream Upload Error:', error);
          reject(error);
          return;
        }

        console.log('[Cloudinary] Upload Success');
        console.log('[Cloudinary] URL:', result?.secure_url);

        resolve(result!.secure_url);
      }
    );

    const readable = new Readable({
      read() {
        this.push(buffer);
        this.push(null);
      }
    });

    readable.pipe(stream);
  });
};