import { Hono } from 'hono';
import { pinoLogger } from '@/middlewares/pino-logger';

import notFound from '@/middlewares/not-found';
import onError from '@/middlewares/on-error';
import { requestId } from 'hono/request-id';
import { AppBindings } from '@/lib/types';

export default function createApp() {
  const app = new Hono<AppBindings>({strict: false}).basePath('/api');
  app.use('*', requestId());
  app.use(pinoLogger());
  app.notFound(notFound);
  app.onError(onError);
  return app;
}

