import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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

// Generate a pre-signed URL for uploading a file
export async function getUploadSignedUrl(
  fileKey: string,
  contentType: string,
  expiresIn = 3600
) {
  const command = new PutObjectCommand({
    Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
    Key: fileKey,
    ContentType: contentType
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });

  if (!signedUrl) {
    throw new Error('Failed to generate upload signed URL');
  }

  return signedUrl;
}

// Get Public URL helper - for files stored in Cloudflare R2
export function getPublicFileUrl(fileId: string): string {
  // Use the Cloudflare R2 endpoint to construct a URL for the file
  // Remove any trailing slashes from the endpoint
  const cleanBaseUrl = env.CLOUDFLARE_R2_PUBLIC_URL.endsWith('/') 
    ? env.CLOUDFLARE_R2_PUBLIC_URL.slice(0, -1) 
    : env.CLOUDFLARE_R2_PUBLIC_URL;
  
  // Construct the full URL with bucket name
  return `${cleanBaseUrl}/${fileId}`;
}
