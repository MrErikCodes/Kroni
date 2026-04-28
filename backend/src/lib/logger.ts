import pino from 'pino';
import { getConfig } from '../config.js';

const cfg = getConfig();

export const logger = pino({
  level: cfg.LOG_LEVEL,
  ...(cfg.NODE_ENV === 'development'
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'HH:MM:ss.l' },
        },
      }
    : {}),
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.pin', '*.token'],
    censor: '[redacted]',
  },
});
