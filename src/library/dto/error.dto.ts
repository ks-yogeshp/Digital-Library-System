import { ApiProperty } from '@nestjs/swagger';

export class ErrorDto {
  @ApiProperty({
    description: 'Error message',
    example: 'Invalid link',
    oneOf: [
      { type: 'string' },
      { type: 'object' },
      { type: 'array', items: { oneOf: [{ type: 'string' }, { type: 'object' }] } },
    ],
    required: false,
  })
  message?: string | object | Array<string | object>;

  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  error: string;

  @ApiProperty({
    description: 'Error code',
    example: 'INVALID_LINK',
    type: String,
    required: false,
  })
  errorCode?: string;

  constructor(error = 'Internal server error', statusCode = 500, message?: any) {
    this.message = message;
    this.statusCode = statusCode;
    this.error = error;
  }
}
