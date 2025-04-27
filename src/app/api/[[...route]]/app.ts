import { Hono } from 'hono';
import { pinoLogger } from '@/middlewares/pino-logger';

import notFound from '@/middlewares/not-found';
import onError from '@/middlewares/on-error';
import { requestId } from 'hono/request-id';
import { AppBindings } from '@/lib/types';

const app = new Hono<AppBindings>().basePath("/api")
app.use('*', requestId())
app.use(pinoLogger())

app.get("/error", (c) => {
  c.status(422)
  c.var.logger.debug("Only visible when debug level enabled!")
  throw new Error("Oh No, Error!!")
})

app.notFound(notFound)
app.onError(onError)

export default app