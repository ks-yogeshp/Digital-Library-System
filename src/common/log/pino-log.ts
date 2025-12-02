import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { AxiosError } from 'axios';
import { PinoLogger } from 'nestjs-pino';
import { Level } from 'pino';

import * as logModule from './log.module';

@Injectable()
export class PinoLog implements LoggerService {
  private readonly contextName: string;
  protected readonly logger: PinoLogger;

  constructor(@Inject(logModule.LOG_CONFIG_TOKEN) config: logModule.ILogConfig) {
    this.contextName = config.pinoOptions?.renameContext || 'context';
    this.logger = new PinoLogger({
      assignResponse: false,
      ...(config.pinoOptions || {}),
      pinoHttp: {
        ...(config.pinoOptions?.pinoHttp || {}),
        level: PinoLog.toPinoLevel(config.level || 'info'),
      },
    });
  }

  verbose(obj: unknown, msg?: string, ...args: any[]): void;
  verbose(message: any, ...optionalParams: any[]) {
    this.call('trace', message, ...optionalParams);
  }

  debug(obj: unknown, msg?: string, ...args: any[]): void;
  debug(message: any, ...optionalParams: any[]) {
    this.call('debug', message, ...optionalParams);
  }

  log(obj: unknown, msg?: string, ...args: any[]): void;
  log(message: any, ...optionalParams: any[]) {
    this.call('info', message, ...optionalParams);
  }

  warn(obj: unknown, msg?: string, ...args: any[]): void;
  warn(message: any, ...optionalParams: any[]) {
    this.call('warn', message, ...optionalParams);
  }

  error(obj: unknown, msg?: string, ...args: any[]): void;
  error(message: any, ...optionalParams: any[]) {
    this.call('error', message, ...optionalParams);
  }

  fatal(obj: unknown, msg?: string, ...args: any[]): void;
  fatal(message: any, ...optionalParams: any[]) {
    this.call('fatal', message, ...optionalParams);
  }

  private call(level: Level, message: any, ...optionalParams: any[]) {
    const objArg: Record<string, any> = {};

    // optionalParams contains extra params passed to logger
    // context name is the last item
    let params: any[] = [];
    if (optionalParams.length !== 0) {
      objArg[this.contextName] = optionalParams[optionalParams.length - 1];
      params = optionalParams.slice(0, -1);
    }

    if (typeof message === 'object') {
      if (
        message instanceof AxiosError ||
        (message instanceof Error &&
          typeof message === 'object' &&
          message !== null &&
          'cause' in message &&
          message.cause)
      ) {
        Object.assign(
          objArg,
          PinoLog.transformHttpError(
            message as AxiosError | (Error & { cause?: { config?: any; response?: Response } })
          )
        );
      } else if (message instanceof Error) {
        objArg.err = message;
      } else {
        Object.assign(objArg, message);
      }
      this.logger[level](objArg, ...params);
    } else if (this.isWrongExceptionsHandlerContract(level, message, params)) {
      objArg.err = new Error(message);
      objArg.err.stack = params[0];
      this.logger[level](objArg);
    } else {
      this.logger[level](objArg, message, ...params);
    }
  }

  static transformHttpError(error: AxiosError | (Error & { cause?: { config?: any; response?: Response } })) {
    // Handle Axios Error
    if ('isAxiosError' in error) {
      const { config, response } = error as unknown as AxiosError;
      return {
        axios: {
          url: config?.url,
          method: config?.method?.toUpperCase(),
          headers: this.sanitizeHeaders(config?.headers),
          data: config?.data,
          response: response && {
            status: response.status,
            statusText: response.statusText,
            headers: this.sanitizeHeaders(response.headers),
            data: response?.data,
          },
        },
        err: {
          name: error.name,
          message: error.message,
          code: (error as unknown as AxiosError).code,
        },
        msg: `${config?.method?.toUpperCase()} ${config?.url} - ${error.message}`,
      };
    }

    // Handle Fetch Error
    const fetchConfig = error.cause?.config;
    const fetchResponse = error.cause?.response;

    return {
      fetch: {
        url: fetchConfig?.url || fetchResponse?.url,
        method: fetchConfig?.method?.toUpperCase(),
        headers: this.sanitizeHeaders(fetchConfig?.headers),
        data: fetchConfig?.body,
        response: fetchResponse && {
          status: fetchResponse.status,
          statusText: fetchResponse.statusText,
          headers: this.sanitizeHeaders(Object.fromEntries(fetchResponse.headers)),
          // Note: Fetch Response body can only be read once, so we assume it's already been read
          // and stored in the error object somewhere if needed
        },
      },
      err: {
        name: error.name,
        message: error.message,
        cause: error.cause,
      },
      msg: `${fetchConfig?.method?.toUpperCase() || 'FETCH'} ${fetchConfig?.url || fetchResponse?.url} - ${error.message}`,
    };
  }

  private static sanitizeHeaders(headers: any) {
    if (!headers) return undefined;

    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'set-cookie', 'x-api-key', 'api-key', 'token'];

    sensitiveHeaders.forEach((header) => {
      if (sanitized[header]) sanitized[header] = '[REDACTED]';
    });

    return sanitized;
  }

  private static sanitizeData(data: any) {
    if (!data) return undefined;

    try {
      // If data is a string, try to parse it as JSON
      const objData = typeof data === 'string' ? JSON.parse(data) : data;

      // Remove sensitive fields
      const sensitiveFields = [
        'password',
        'token',
        'secret',
        'apiKey',
        'api_key',
        'key',
        'authorization',
        'credentials',
      ];

      const sanitized = JSON.parse(
        JSON.stringify(objData, (key, value) => {
          if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
            return '[REDACTED]';
          }
          // Handle circular references and functions
          if (typeof value === 'function') return '[Function]';
          if (typeof value === 'object' && value !== null) {
            // Remove large binary data
            if (value instanceof Buffer || value instanceof Uint8Array) {
              return '[Binary Data]';
            }
          }
          return value;
        })
      );

      return sanitized;
    } catch (e) {
      // If parsing fails, return a safe string representation
      return typeof data === 'string' ? data : '[Unparseable Data]';
    }
  }

  /**
   * Unfortunately built-in (not only) `^.*Exception(s?)Handler$` classes call `.error`
   * method with not supported contract:
   *
   * - ExceptionsHandler
   * @see https://github.com/nestjs/nest/blob/35baf7a077bb972469097c5fea2f184b7babadfc/packages/core/exceptions/base-exception-filter.ts#L60-L63
   *
   * - ExceptionHandler
   * @see https://github.com/nestjs/nest/blob/99ee3fd99341bcddfa408d1604050a9571b19bc9/packages/core/errors/exception-handler.ts#L9
   *
   * - WsExceptionsHandler
   * @see https://github.com/nestjs/nest/blob/9d0551ff25c5085703bcebfa7ff3b6952869e794/packages/websockets/exceptions/base-ws-exception-filter.ts#L47-L50
   *
   * - RpcExceptionsHandler @see https://github.com/nestjs/nest/blob/9d0551ff25c5085703bcebfa7ff3b6952869e794/packages/microservices/exceptions/base-rpc-exception-filter.ts#L26-L30
   *
   * - all of them
   * @see https://github.com/search?l=TypeScript&q=org%3Anestjs+logger+error+stack&type=Code
   */
  private isWrongExceptionsHandlerContract(level: Level, message: any, params: any[]): params is [string] {
    return (
      level === 'error' &&
      typeof message === 'string' &&
      params.length === 1 &&
      typeof params[0] === 'string' &&
      /\n\s*at /.test(params[0])
    );
  }

  static toPinoLevel(level: string) {
    switch (level) {
      case 'verbose':
        return 'trace';
      case 'debug':
        return 'debug';
      case 'log':
        return 'info';
      case 'warn':
        return 'warn';
      case 'error':
        return 'error';
      case 'fatal':
        return 'fatal';
      default:
        return 'info';
    }
  }
}
