import { Hono } from 'hono';
import notFound from '@/middlewares/not-found';

const app = new Hono().basePath("/api")

app.notFound(notFound)

export default app