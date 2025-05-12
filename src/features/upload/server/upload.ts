import { Hono } from 'hono';
import { handleRequest } from 'better-upload/server';
import { uploadRouter } from '@/lib/better-upload-handler';

const app = new Hono();

app.post('/', async (c) => {
  return handleRequest(c.req.raw, uploadRouter);
});

export default app;
