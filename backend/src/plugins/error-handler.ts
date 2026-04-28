import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyError } from 'fastify';
import { ZodError } from 'zod';
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod';
import { HttpError, ValidationError } from '../lib/errors.js';

interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: Array<{ path: Array<string | number>; message: string }>;
}

export const errorHandler = fp(async (app: FastifyInstance) => {
  app.setErrorHandler((rawErr, req, reply) => {
    const err = rawErr as FastifyError & { statusCode?: number };

    let problem: ProblemDetail;

    if (err instanceof ValidationError) {
      problem = {
        type: 'about:blank',
        title: err.title,
        status: err.status,
        detail: err.message,
        instance: req.url,
        errors: err.issues,
      };
    } else if (err instanceof HttpError) {
      problem = {
        type: err.type,
        title: err.title,
        status: err.status,
        detail: err.message,
        instance: req.url,
      };
    } else if (err instanceof ZodError) {
      problem = {
        type: 'about:blank',
        title: 'Bad Request',
        status: 400,
        detail: 'request validation failed',
        instance: req.url,
        errors: err.issues.map((i) => ({ path: i.path, message: i.message })),
      };
    } else if (hasZodFastifySchemaValidationErrors(err)) {
      problem = {
        type: 'about:blank',
        title: 'Bad Request',
        status: 400,
        detail: 'request validation failed',
        instance: req.url,
        errors: err.validation.map((v) => ({
          path: typeof v.instancePath === 'string' ? v.instancePath.split('/').filter(Boolean) : [],
          message: v.message ?? 'invalid',
        })),
      };
    } else if (err.statusCode && err.statusCode >= 400 && err.statusCode < 500) {
      problem = {
        type: 'about:blank',
        title: err.name || 'Bad Request',
        status: err.statusCode,
        detail: err.message,
        instance: req.url,
      };
    } else {
      // Unknown — log full, return generic.
      req.log.error({ err }, 'unhandled error');
      problem = {
        type: 'about:blank',
        title: 'Internal Server Error',
        status: 500,
        instance: req.url,
      };
    }

    void reply
      .code(problem.status)
      .header('content-type', 'application/problem+json')
      .send(problem);
  });
});
