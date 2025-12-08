import { IncomingMessage } from 'http';
import { RequestMethod } from '@nestjs/common';
import { AxiosError } from 'axios';
import dotenv from 'dotenv';
import { bool, cleanEnv, str } from 'envalid';
import { stdSerializers } from 'pino';

import { ILogConfig } from 'src/common/log';

dotenv.config();

const env = cleanEnv(process.env, {
  APP_ENV: str({
    default: 'unknown',
    devDefault: 'local',
    choices: ['local', 'development', 'staging', 'test', 'production', 'preview', 'uat', 'unknown', 'ci'],
  }),
  APP_URL: str({ default: 'http://localhost:3000', devDefault: 'http://localhost:3000' }),

  DATABASE_MONGO_URL: str(),

  MAIL_HOST: str(),
  SMTP_USERNAME: str(),
  SMTP_PASSWORD: str(),
  MAIL_FROM: str(),

  LOG_LEVEL: str({
    default: 'debug',
    devDefault: 'verbose',
    // 'log', 'fatal', 'error', 'warn', 'debug', and 'verbose' -- log is info level
    choices: ['log', 'fatal', 'error', 'warn', 'debug', 'verbose'],
  }),
  LOG_JSON: bool({ default: true, devDefault: true }),
  LOG_COLORS: bool({ default: false, devDefault: true }),
  LOG_PRETTY: bool({ default: false, devDefault: true }),
  LOG_TIMESTAMP: bool({ default: true, devDefault: false }),
  LOG_HTTP_REQUESTS: bool({ default: false, devDefault: false }),
  LOG_PROVIDERS_REQUESTS: bool({ default: true, devDefault: false }),

  SECRET_KEY: str(),

  CLIENT_ID: str(),
  CLIENT_SECRET: str(),
  CALLBACK_URL: str(),

  REDIS_URL: str(),
});

const AppConfig = () => ({ ...env }) as const;

export const CONFIG = AppConfig();

export const logConfig: ILogConfig = {
  level: CONFIG.LOG_LEVEL,
  json: CONFIG.LOG_JSON,
  colors: CONFIG.LOG_COLORS,
  compact: !CONFIG.LOG_PRETTY,
  timestamp: CONFIG.LOG_TIMESTAMP,
  usePino: CONFIG.LOG_JSON,
  pinoOptions: {
    assignResponse: false,
    pinoHttp: {
      formatters: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        level(label: string, levelNumber: number) {
          return { level: label };
        },
      },
      useLevel: 'verbose' as any,
      transport: CONFIG.LOG_PRETTY
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              ignore: 'pid,hostname',
            },
          }
        : undefined,
      depthLimit: 5,
      timestamp: CONFIG.LOG_TIMESTAMP,
      redact: ['req.headers.authorization', 'axios.request.headers.authorization'],
      // genReqId: (req) => {
      //   return req.headers['cf-ray'];
      // }
      serializers: {
        req: (req) => {
          return {
            method: req.method,
            url: req.url,
            // query: req.query,
            // params: req.params,
            headers: {
              host: req.headers.host,
              'x-real-ip': req.headers['x-real-ip'],
              'cf-connecting-ip': req.headers['cf-connecting-ip'],
              'organization-id': req.headers['organization-id'],
              'app-user-id': req.headers['app-user-id'],
              'app-organization-id': req.headers['app-organization-id'],
              'user-agent': req.headers['user-agent'],
            },
          };
        },
        res: (res) => {
          return {
            statusCode: res.statusCode,
          };
        },
        error: (err) => {
          // If axios error
          if (err && err.isAxiosError && err instanceof AxiosError) {
            return {
              message: err.message,
              stack: err.stack,
              type: err.name,
              response: {
                url: err.request?.url,
                query: err.request?.params,
                status: err.response?.status,
                statusText: err.response?.statusText,
              },
            };
          }

          return stdSerializers.err(err);
        },
      },
      customSuccessMessage: (req: IncomingMessage, res: any, responseTime: number) => {
        return `${req.method} ${req.url} ${res.statusCode} ${responseTime}ms`;
      },
      autoLogging:
        CONFIG.LOG_HTTP_REQUESTS === false
          ? false
          : {
              ignore: (req) => {
                return Boolean(
                  req.method === 'OPTIONS' ||
                    (req.url ?? '').startsWith('/api/health') ||
                    (req.statusCode && req.statusCode < 400)
                );
              },
            },
    },
    exclude: [
      { method: RequestMethod.GET, path: '/*path' },
      { method: RequestMethod.OPTIONS, path: '/*path' },
      { method: RequestMethod.ALL, path: '/health/*path' },
    ],
  },
};
