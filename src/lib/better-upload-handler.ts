import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { route, type Router } from 'better-upload/server';
import { env } from '@/env';

// Configure your S3 client for Cloudflare R2
export const s3Client = new S3Client({
  region: 'auto', // For R2, use 'auto'
  endpoint: env.CLOUDFLARE_R2_ENDPOINT, // Your Cloudflare R2 endpoint
  credentials: {
    accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

// Upload Router Configuration
export const uploadRouter: Router = {
  client: s3Client,
  bucketName: env.CLOUDFLARE_R2_BUCKET_NAME,
  routes: {
    workspaceImage: route({
      fileTypes: ['image/*'],
      maxFileSize: 1024 * 1024, // 1MB
      onBeforeUpload: async ({ file }) => {
        // You can add authentication checks here
        return {
          // Generate a unique key for the file
          objectKey: `workspace-images/${Date.now()}-${file.name}`,
        };
      },
      onAfterSignedUrl: async ({ file }) => {
        return {
          metadata: {
            fileId: file.objectKey,
          },
        };
      },
    }),
  },
};

// Helper function to get file as data URL - good for smaller files
export async function getFileAsDataUrl(fileId: string): Promise<string> {
  try {
    // Get the file from S3/R2
    const command = new GetObjectCommand({
      Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: fileId,
    });

    const response = await s3Client.send(command);

    // Convert the file to a Buffer
    const arrayBuffer = await response.Body?.transformToByteArray();
    if (!arrayBuffer) {
      throw new Error('Failed to read file');
    }

    // Determine the content type
    const contentType = response.ContentType || 'image/png';

    // Create a base64 data URL
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error('Error getting file as data URL:', error);
    throw error;
  }
}

// Get a temporary signed URL for a file - better for larger files
export async function getFileSignedUrl(fileId: string, expiresIn = 3600): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: fileId,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error('Error getting signed URL:', error);
    throw error;
  }
}

// Get Public URL helper - if your bucket has public access configured
// export function getPublicFileUrl(fileId: string): string {
//   return `${env.CLOUDFLARE_R2_PUBLIC_URL}/${fileId}`;
// }
