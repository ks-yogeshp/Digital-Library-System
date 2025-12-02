import {
  applyDecorators,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Put,
  Type,
  UnprocessableEntityException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiExcludeEndpoint, ApiOperation, ApiResponse, ApiResponseMetadata } from '@nestjs/swagger';
import { isObject } from 'class-validator';

import { ErrorDto } from 'src/library/dto/error.dto';
import { ApiPaginationOkResponse } from './api-page-ok-response.decorator';

type ResponseTypeOnly = Type<unknown> | (new () => object) | [new () => object] | string;
type ResponseTypeMeta = {
  dtoType?: 'ListDto' | 'PageDto' | 'ArrayDto';
  type: ResponseTypeOnly;
} & ApiResponseMetadata;

type ResponseType = ResponseTypeOnly | ResponseTypeMeta;

export interface IRouteOptions {
  summary?: string;
  description?: string;
  defaultStatus?: HttpStatus;
  excludeFromDocs?: boolean;
  Ok?: ResponseType;
  Created?: ResponseType;
  NoContent?: ResponseType;
  Default?: ResponseType;
  BadRequest?: ResponseType;
  Unauthorized?: ResponseType;
  ValidationError?: ResponseType;
  Forbidden?: ResponseType;
  NotFound?: ResponseType;
  ServerError?: ResponseType;
}
export const DEFAULT_VALIDATION_PIPE = () =>
  new ValidationPipe({
    whitelist: true,
    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    transform: true,
    enableDebugMessages: true,
    dismissDefaultMessages: true,
    validationError: {
      target: false,
      value: false,
    },
    forbidUnknownValues: false,
    stopAtFirstError: false,
    transformOptions: {
      enableImplicitConversion: true,
    },
    exceptionFactory: (errors) => new UnprocessableEntityException(errors, 'Validation failed'),
  });

export function ApiResponseDto(status: number, responseType: ResponseType): MethodDecorator {
  let options: ApiResponseMetadata;
  const response =
    responseType && 'type' in (responseType as object)
      ? (responseType as ResponseTypeMeta)
      : (responseType as ResponseTypeOnly);
  if (response && 'dtoType' in (response as object)) {
    const meta: ResponseTypeMeta = response as ResponseTypeMeta;

    if (meta.dtoType === 'PageDto') {
      return ApiPaginationOkResponse({
        type: meta.type as unknown as any,
        description: meta.description,
      });
    }
  }
  if (response && 'type' in (response as object)) {
    const meta: ResponseTypeMeta = response as ResponseTypeMeta;
    options = {
      status,
      ...meta,
    };
  } else {
    options = {
      status,
      type: response as unknown as any,
    };
  }

  return ApiResponse(options);
}
function routeOptions<T extends IRouteOptions>(options?: T | ResponseType): T {
  if (options == null) {
    return {} as T;
  }
  if (isObject(options)) {
    return options as T;
  }
  return { Ok: options as ResponseType } as T;
}

function defaultOptions<T extends IRouteOptions>(options: T): T {
  return {
    ServerError: ErrorDto,
    ...options,
  };
}

function prepareDecorators(_opts: IRouteOptions): MethodDecorator[] {
  const options = defaultOptions(routeOptions(_opts));
  const {
    summary,
    description,
    Ok,
    Created,
    NoContent,
    Default,
    BadRequest,
    Unauthorized,
    ValidationError,
    Forbidden,
    NotFound,
    ServerError,
  } = options;

  const decorators: MethodDecorator[] = [HttpCode(options.defaultStatus ?? (Created ? 201 : 200))];

  decorators.push(UsePipes(DEFAULT_VALIDATION_PIPE()));

  if (summary || description) {
    decorators.push(ApiOperation({ summary, description }));
  }
  if (options.excludeFromDocs) {
    decorators.push(ApiExcludeEndpoint());
  }
  if (Ok) {
    decorators.push(ApiResponseDto(200, Ok));
  }
  if (Created) {
    decorators.push(ApiResponseDto(201, Created));
  }
  if (NoContent) {
    decorators.push(ApiResponseDto(204, NoContent));
  }
  if (BadRequest) {
    decorators.push(ApiResponseDto(400, BadRequest));
  }
  if (Unauthorized) {
    decorators.push(ApiResponseDto(401, Unauthorized));
  }
  if (ValidationError) {
    decorators.push(ApiResponseDto(422, ValidationError));
  }
  if (Forbidden) {
    decorators.push(ApiResponseDto(403, Forbidden));
  }
  if (NotFound) {
    decorators.push(ApiResponseDto(404, NotFound));
  }
  if (ServerError) {
    decorators.push(ApiResponseDto(500, ServerError));
  }
  if (Default) {
    decorators.push(ApiResponseDto(200, Default));
  }

  return decorators;
}

export function GetRoute(path?: string | string[], options?: IRouteOptions | ResponseType): MethodDecorator {
  const decorators: MethodDecorator[] = [Get(path)];

  return applyDecorators(...decorators, ...prepareDecorators(routeOptions(options)));
}

export function PostRoute(path?: string | string[], options?: IRouteOptions | ResponseType): MethodDecorator {
  const decorators: MethodDecorator[] = [Post(path)];

  return applyDecorators(...decorators, ...prepareDecorators(routeOptions(options)));
}

export function PutRoute(path?: string | string[], options?: IRouteOptions | ResponseType): MethodDecorator {
  const decorators: MethodDecorator[] = [Put(path)];

  return applyDecorators(...decorators, ...prepareDecorators(routeOptions(options)));
}

export function PatchRoute(
  path?: string | string[],
  options?: IRouteOptions | ResponseType
): MethodDecorator {
  const decorators: MethodDecorator[] = [Patch(path)];

  return applyDecorators(...decorators, ...prepareDecorators(routeOptions(options)));
}

export function DeleteRoute(
  path?: string | string[],
  options?: IRouteOptions | ResponseType
): MethodDecorator {
  const decorators: MethodDecorator[] = [Delete(path)];

  return applyDecorators(...decorators, ...prepareDecorators(routeOptions(options)));
}
