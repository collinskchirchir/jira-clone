import createApp from '@/app/api/[[...route]]/create-app';

const app =createApp()

app.get("/error", (c) => {
  c.status(422)
  c.var.logger.debug("Only visible when debug level enabled!")
  throw new Error("Oh No, Error!!")
})

export default app