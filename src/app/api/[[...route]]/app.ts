import { Hono } from 'hono';
import notFound from '@/middlewares/not-found';
import onError from '@/middlewares/on-error';

const app = new Hono().basePath("/api")

app.get("/error", (c) => {
  throw new Error("Oh No, Error!!")
})

app.notFound(notFound)
app.onError(onError)

export default app