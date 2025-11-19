import { HttpException, HttpStatus, LogLevel } from '@nestjs/common';
import { isNumber } from 'lodash';

export type ErrorCode = string;

export class ApplicationException<
  T extends {
    level?: LogLevel;
    message: string;
    internalError?: Error | HttpException;
    statusCode?: HttpStatus;
  },
> extends HttpException {
  public readonly errorCode: ErrorCode;
  public readonly level?: LogLevel;
  public readonly internalError = null;

  constructor(errorCode: ErrorCode | HttpStatus, error: T) {
    const httpCode = isNumber(errorCode) ? errorCode : (error?.statusCode ?? HttpStatus.BAD_REQUEST);

    super(error, Number(httpCode));

    this.level = error.level ?? 'error';
    this.errorCode = isNumber(errorCode) ? '' : (errorCode as string);
  }
}
