import { ConsoleLogger, ConsoleLoggerOptions, Global, Provider } from '@nestjs/common';
import { LoggerModule, Params as PinoParams } from 'nestjs-pino';

import { PinoLog } from './pino-log';

export const LOG = Symbol('LOG');
export const LOG_CONFIG_TOKEN = Symbol('LOG_CONFIG_TOKEN');

@Global()
export class LogModule {
  static forRoot(config: ILogConfig) {
    const logConfigProvider: Provider<ILogConfig> = {
      provide: LOG_CONFIG_TOKEN,
      useValue: config || {},
    };

    return {
      module: LogModule,
      imports: [
        LoggerModule.forRoot({
          ...config.pinoOptions,
        }),
      ],
      providers: [
        logConfigProvider,
        {
          provide: LOG,
          useValue: config.usePino ? new PinoLog(config) : new ConsoleLogger(config),
        },
      ],
      exports: [LOG],
    };
  }
}

export interface ILogConfig extends ConsoleLoggerOptions {
  level?: string;
  pretty?: boolean;
  colors?: boolean;
  json?: boolean;
  usePino?: boolean;
  pinoOptions?: PinoParams;
}
