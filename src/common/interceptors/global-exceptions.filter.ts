import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { isString } from 'lodash';
import { EntityNotFoundError } from 'typeorm';

import { ApplicationException } from '../exceptions/application.exception';

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    public readonly config: {
      appEnv: 'development' | 'staging' | 'local' | 'ci' | 'preview' | 'test' | 'uat' | 'production';
    } = {
      appEnv: 'development',
    }
  ) {}

  catch(error: unknown, host: ArgumentsHost): void {
    if (host.getType() !== 'http') {
      // todo, add support for other type of adapters too.
      Logger.error({ error }, GlobalExceptionsFilter.name);
      throw error;
    }

    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const isDev =
      this.config.appEnv === 'development' ||
      this.config.appEnv === 'local' ||
      this.config.appEnv === 'ci' ||
      this.config.appEnv === 'preview' ||
      this.config.appEnv === 'staging';

    // Exceptions to skip logging
    const isApplicationException = error instanceof ApplicationException;

    if (
      error instanceof ForbiddenException ||
      error instanceof UnauthorizedException ||
      error instanceof NotFoundException
    ) {
      if (isDev) {
        Logger.debug({ message: error.message }, GlobalExceptionsFilter.name);
      }
    } else if (error instanceof ConflictException) {
      Logger.warn({ error }, GlobalExceptionsFilter.name);
    } else if (error instanceof UnprocessableEntityException) {
      Logger.warn({ error }, GlobalExceptionsFilter.name);
    } else if (isApplicationException) {
      Logger.error({ error }, GlobalExceptionsFilter.name);
    } else {
      Logger.error({ error }, GlobalExceptionsFilter.name);
    }

    let statusCode = 500;
    let response: { key: string; args: Record<string, unknown> } | Record<string, unknown>;
    let _exception: unknown = null;

    if (error instanceof HttpException || isApplicationException) {
      const res = error.getResponse() ?? {};

      response = (isString(res) ? { message: res } : res) as {
        key: string;
        args: Record<string, unknown>;
      };

      response['errorCode'] = (error as ApplicationException<any>).errorCode;

      statusCode = error.getStatus();
    } else if (error instanceof EntityNotFoundError) {
      response = {
        error: (error as any).statusCode ?? 'Not found',
        message: `${error.name} entity is not found.`,
      };

      _exception = null;
      statusCode = (error as any).statusCode ?? HttpStatus.NOT_FOUND;
    } else {
      response = {
        error: (error as any).statusCode ?? 'Internal server error',
        message: (error as any).message,
      };

      _exception = error;
      statusCode = (error as any).statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR;
    }

    if (response['error'] == null) {
      response['error'] = isString(response['message']) ? response['message'] : (error as Error).message;
    }

    httpAdapter.reply(
      ctx.getResponse(),
      {
        statusCode,
        error: 'Internal server error',
        message: (error as Error).message,
        ...response,
        _exception: isDev ? _exception : undefined,
      },
      statusCode
    );
  }
}
