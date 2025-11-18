import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { Type, TypeHelpOptions } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  registerDecorator,
  ValidateNested,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

interface IStringFieldOptions {
  maxLength?: number;
  minLength?: number;
  swagger?: boolean;
}

interface INumberFieldOptions {
  int?: boolean;
  maximum?: number;
  minimum?: number;
  isPositive?: boolean;
  swagger?: boolean;
}

interface IObjectFieldOptions {
  swagger?: boolean;
  validation?: boolean;
}

interface IFieldOptions {
  swagger?: boolean;
  validation?: boolean;
}

type ApiOptions = Omit<ApiPropertyOptions, 'type'> & { required?: boolean };

export function StringField(
  options: ApiOptions & IStringFieldOptions & { each?: boolean; notEmpty?: boolean } = {}
): PropertyDecorator {
  const { swagger, each, required, isArray, ...swaggerOptions } = options;

  const decorators: PropertyDecorator[] = [];
  if (swagger !== false) {
    decorators.push(
      ApiProperty({
        type: String,
        isArray,
        required,
        ...swaggerOptions,
      } as ApiPropertyOptions)
    );
  }

  if (isArray) {
    decorators.push(IsArray());
  }
  if (required !== false) {
    decorators.push(IsNotEmpty());
  }
  if (isArray && options.notEmpty !== false) {
    decorators.push(ArrayNotEmpty());
  }
  decorators.push(IsString({ each: options.each || each }));
  if (options.maxLength) {
    decorators.push(MaxLength(options.maxLength, { each }));
  }

  if (options.minLength) {
    decorators.push(MinLength(options.minLength, { each }));
  }

  return applyDecorators(...decorators);
}

export function StringFieldOptional(
  options: Omit<ApiOptions, 'required'> & IStringFieldOptions & { each?: boolean; notEmpty?: boolean } = {}
): PropertyDecorator {
  return applyDecorators(
    IsOptional(),
    StringField({
      required: false,
      ...options,
    })
  );
}

export function NumberField(
  options: ApiOptions & INumberFieldOptions & { each?: boolean; notEmpty?: boolean; unique?: boolean } = {}
): PropertyDecorator {
  const { swagger, required, isArray, each, int, maximum, minimum, isPositive, ...swaggerOptions } = options;

  const decorators: PropertyDecorator[] = [Type(() => Number)];

  if (swagger !== false) {
    decorators.push(
      ApiProperty({
        type: Number,
        maximum,
        minimum,
        isArray,
        required,
        ...swaggerOptions,
      } as ApiPropertyOptions)
    );
  }

  if (each) {
    decorators.push(IsArray());
  }

  if (required !== false) {
    decorators.push(IsNotEmpty());
  }

  if (isArray && options.notEmpty !== false) {
    decorators.push(ArrayNotEmpty());
  }

  if (options.unique && isArray) {
    decorators.push(ArrayUnique());
  }

  if (int) {
    decorators.push(IsInt({ each }));
  } else {
    decorators.push(IsNumber({}, { each }));
  }

  if (isPositive) {
    decorators.push(IsPositive({ each }));
  }

  if (maximum !== undefined) {
    decorators.push(Max(maximum, { each }));
  }

  if (minimum !== undefined) {
    decorators.push(Min(minimum, { each }));
  }

  return applyDecorators(...decorators);
}

export function NumberFieldOptional(
  options: Omit<ApiOptions, 'required'> &
    INumberFieldOptions & { each?: boolean; notEmpty?: boolean; unique?: boolean } = {}
): PropertyDecorator {
  return applyDecorators(
    IsOptional(),
    NumberField({
      required: false,
      ...options,
    })
  );
}

export function PasswordField(options: ApiOptions & IStringFieldOptions = {}): PropertyDecorator {
  return applyDecorators(
    StringField({
      format: `Password must be at least 8 characters long, include at least one letter, one number, and one special character (@, $, !, %, *, #, ?, &).`,
      ...options,
    }),
    IsPassword()
  );
}

export function PasswordFieldOptional(
  options: Omit<ApiOptions, 'required'> & IStringFieldOptions = {}
): PropertyDecorator {
  return applyDecorators(
    IsOptional(),
    PasswordField({
      required: false,
      ...options,
    })
  );
}

export function EmailField(options: ApiOptions & IStringFieldOptions = {}): PropertyDecorator {
  return applyDecorators(IsEmail(), StringField(options));
}

export function EmailFieldOptional(
  options: Omit<ApiOptions, 'required'> & IStringFieldOptions = {}
): PropertyDecorator {
  return applyDecorators(
    IsOptional(),
    EmailField({
      required: false,
      ...options,
    })
  );
}

export function EnumField<T>(
  getEnum: () => T,
  options: Omit<ApiOptions, 'enum' | 'enumName'> & {
    each?: boolean;
    swagger?: boolean;
    notEmpty?: boolean;
  } = {}
): PropertyDecorator {
  const enumValue = getEnum();

  const decorators = [IsEnum(enumValue as object, { each: options.each })];

  if (options.required !== false) {
    decorators.push(IsNotEmpty());
  }

  if (options.isArray) {
    decorators.push(IsArray());
  }

  if (options.isArray && options.notEmpty !== false) {
    decorators.push(ArrayNotEmpty());
  }

  if (options.swagger !== false) {
    decorators.push(ApiEnumProperty(getEnum, options));
  }
  return applyDecorators(...decorators);
}

export function EnumFieldOptional<T>(
  getEnum: () => T,
  options: Omit<ApiOptions, 'enum' | 'enumName' | 'required'> & {
    each?: boolean;
    swagger?: boolean;
    notEmpty?: boolean;
  } = {}
): PropertyDecorator {
  return applyDecorators(
    IsOptional(),
    EnumField(getEnum, {
      required: false,
      ...options,
    })
  );
}

export function ObjectField(
  fieldType: (type?: TypeHelpOptions) => new (...args: any[]) => object,
  options: ApiOptions & IObjectFieldOptions & { each?: boolean } = {}
): PropertyDecorator {
  const decorators = [Type(fieldType)];
  const { swagger, validation, required, isArray, each, ...swaggerOptions } = options;
  if (swagger !== false) {
    decorators.push(
      ApiProperty({
        type: () => fieldType(),
        required,
        isArray,
        ...swaggerOptions,
      } as ApiPropertyOptions)
    );
  }

  if (required !== false && !isArray) {
    decorators.push(IsNotEmptyObject());
  }

  if (isArray) {
    decorators.push(IsArray());
  }

  if (validation !== false) {
    decorators.push(ValidateNested({ each }));
  }

  return applyDecorators(...decorators);
}

export function ObjectFieldOptional(
  fieldType: (type?: TypeHelpOptions) => new (...args: any[]) => object,
  options: Omit<ApiOptions, 'required'> & IObjectFieldOptions & { each?: boolean } = {}
): PropertyDecorator {
  return applyDecorators(
    IsOptional(),
    ObjectField(fieldType, {
      required: false,
      ...options,
    })
  );
}

export function DateField(options: ApiOptions & { swagger?: boolean } = {}): PropertyDecorator {
  const decorators = [Type(() => Date), IsDate()];
  const { swagger, required, ...swaggerOptions } = options;

  if (swagger !== false) {
    decorators.push(
      ApiProperty({
        type: Date,
        required,
        ...swaggerOptions,
      } as ApiPropertyOptions)
    );
  }

  return applyDecorators(...decorators);
}

export function DateFieldOptional(
  options: Omit<ApiOptions, 'required'> & IObjectFieldOptions = {}
): PropertyDecorator {
  return applyDecorators(
    IsOptional(),
    DateField({
      required: false,
      ...options,
    })
  );
}

export function BooleanField(options: ApiOptions & { swagger?: boolean } = {}): PropertyDecorator {
  const decorators = [IsBoolean()];
  const { swagger, required, ...swaggerOptions } = options;

  if (swagger !== false) {
    decorators.push(
      ApiProperty({
        type: Boolean,
        required,
        ...swaggerOptions,
      } as ApiPropertyOptions)
    );
  }

  return applyDecorators(...decorators);
}

export function BooleanFieldOptional(
  options: Omit<ApiOptions, 'required'> & { swagger?: boolean } = {}
): PropertyDecorator {
  return applyDecorators(
    IsOptional(),
    BooleanField({
      required: false,
      ...options,
    })
  );
}

export function IsPassword(validationOptions?: ValidationOptions): PropertyDecorator {
  return (object, propertyName: string) => {
    registerDecorator({
      propertyName,
      name: 'isPassword',
      target: object.constructor,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;

          if (value.length < 8) return false;
          if (!/[A-Za-z]/.test(value)) return false;
          if (!/\d/.test(value)) return false;
          if (!/[@$!%*#?&]/.test(value)) return false;

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const value = args.value as string;
          if (typeof value !== 'string') return 'Password must be a string';

          const errors: string[] = [];
          if (value.length < 8) errors.push('at least 8 characters');
          if (!/[A-Za-z]/.test(value)) errors.push('at least one letter');
          if (!/\d/.test(value)) errors.push('at least one number');
          if (!/[@$!%*#?&]/.test(value))
            errors.push('at least one special character (@, $, !, %, *, #, ?, &)');

          return `Password must contain ${errors.join(', ')}`;
        },
      },
    });
  };
}

export function ApiEnumProperty<T>(getEnum: () => T, options: ApiOptions = {}): PropertyDecorator {
  const { required, isArray, ...swaggerOptions } = options;
  const enumValue = getEnum();
  return ApiProperty({
    type: enumValue,
    enum: enumValue,
    enumName: getVariableName(getEnum),
    isArray,
    required,
    ...swaggerOptions,
  } as ApiPropertyOptions);
}

export function getVariableName<TResult>(getVar: () => TResult): string {
  const m = /\(\)=>(.*)/.exec(getVar.toString().replace(/(\r\n|\n|\r|\s)/gm, ''));

  if (!m) {
    throw new Error("The function does not contain a statement matching 'return variableName;'");
  }

  const fullMemberName = m[1];
  const memberParts = fullMemberName.split('.');
  return memberParts[memberParts.length - 1];
}
export function FileField(
  options: Omit<ApiOptions, 'type' | 'format' | 'required' | 'enum' | 'enumName'> &
    IFieldOptions & { required?: boolean } = {}
): PropertyDecorator {
  const decorators: PropertyDecorator[] = [];
  const { swagger, required, ...rest } = options;

  if (swagger !== false) {
    decorators.push(
      ApiProperty({
        type: String,
        format: 'binary',
        required,
        ...rest,
      } as ApiPropertyOptions)
    );
  }

  return applyDecorators(...decorators);
}

export function FileFieldOptional(options: Omit<ApiOptions, 'type'> = {}): PropertyDecorator {
  return applyDecorators(IsOptional(), FileField({ ...options, required: false }));
}
