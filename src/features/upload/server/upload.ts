import { Hono } from 'hono';
import { handleRequest, route, type Router } from 'better-upload/server';
import { s3Client } from '@/lib/better-upload-handler';
import { env } from '@/env';

const app = new Hono()
  .post('/workspace-image', async (c) => {
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
          onBeforeUpload: async ({ file }) => {
            // You can add authentication checks here

            // Extract the file extension from the original filename
            const originalName = file.name;
            const extension = originalName.split('.').pop() || '';

            return {
              // Generate a unique key for the file with the original extension
              objectKey: `workspace-images/${Date.now()}-${fileName}${extension ? '.' + extension : ''}`,
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
  })
  .post('/project-image', async (c) => {
    // generate a random file name using crypto
    const fileName = crypto.randomUUID();

    // Router Configuration
    const uploadProjectImageRouter: Router = {
      client: s3Client,
      bucketName: env.CLOUDFLARE_R2_BUCKET_NAME,
      routes: {
        projectImage: route({
          fileTypes: ['image/*'],
          maxFileSize: 1024 * 1024, // 1MB
          onBeforeUpload: async ({ file }) => {
            // You can add authentication checks here

            // Extract the file extension from the original filename
            const originalName = file.name;
            const extension = originalName.split('.').pop() || '';

            return {
              // Generate a unique key for the file with the original extension
              objectKey: `project-images/${Date.now()}-${fileName}${extension ? '.' + extension : ''}`,
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

    return handleRequest(c.req.raw, uploadProjectImageRouter);
  });

export default app;
