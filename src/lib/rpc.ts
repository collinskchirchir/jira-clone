import { hc } from 'hono/client';
import env from '@/env';

import { AppType } from '@/app/api/[[...route]]/route';

export const client = hc<AppType>(env.NEXT_PUBLIC_APP_URL);