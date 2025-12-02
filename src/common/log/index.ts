/**
 * This module allows to configure and use a custom logger such as pino or winston.
 * This logger is matches interface of nestjs logger.
 *
 * The default logger is pino.
 *
 * To use a custom logger, you can set the `LOG_LEVEL` environment variable to the desired log level.
 *
 */

export * from './log.module';
