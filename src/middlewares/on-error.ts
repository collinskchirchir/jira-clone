import type { ErrorHandler } from 'hono';
import { env } from '@/env';

import type { StatusCode } from 'hono/utils/http-status';
import { INTERNAL_SERVER_ERROR, OK } from '@/lib/http-status-codes';

const onError: ErrorHandler = (err, c) => {
  const currentStatus = "status" in err
    ? err.status
    : c.newResponse(null).status;
  const statusCode = currentStatus !== OK
    ? (currentStatus as StatusCode)
    : INTERNAL_SERVER_ERROR;
  

  const environment = env.NODE_ENV
  return c.json(
    {
      message: err.message,

      stack: environment === "production"
        ? undefined
        : err.stack,
    },
    statusCode,
  );
};

export default onError;