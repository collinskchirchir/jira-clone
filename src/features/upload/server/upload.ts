import { Hono } from 'hono';
import { handleRequest, route, type Router } from 'better-upload/server';
import { s3Client } from '@/lib/better-upload-handler';
import { env } from '@/env';

const app = new Hono();

app.post('/workspace-image', async (c) => {
  // generate a random file name using crypto
  const fileName = crypto.randomUUID();

  // Router Configuration
  const uploadWorkspaceImageRouter: Router = {
    client: s3Client,
    bucketName: env.CLOUDFLARE_R2_BUCKET_NAME,
    routes: {
      workspaceImage: route({
        fileTypes: ['image/*'],
        maxFileSize: 1024 * 1024, // 1MB
        onBeforeUpload: async () => {
          // You can add authentication checks here
          return {
            // Generate a unique key for the file
            objectKey: `workspace-images/${Date.now()}-${fileName}`,
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
  return handleRequest(c.req.raw, uploadWorkspaceImageRouter);
});

export default app;
