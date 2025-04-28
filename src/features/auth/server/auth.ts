import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { loginSchema, registerSchema } from '@/features/auth/auth-schemas';

const app = new Hono()
  .post('/login',
    zValidator('json', loginSchema),
    (c) => {
      const { email, password } = c.req.valid('json');
      console.log('Api Login console', { email, password });
      return c.json({ email, password });
    })
  .post('/register',
    zValidator('json', registerSchema),
    (c) => {
      const { name, email, password } = c.req.valid('json');
      console.log('Api Register console', { name, email, password });
      return c.json({ name, email, password });
    });

export default app;
