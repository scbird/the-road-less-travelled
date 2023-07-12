import { BaseLogger, LevelWithSilent, LogFn, LoggerOptions, pino } from 'pino'

/**
 * A class that implements the Pino logger interface so that it can be
 * easily injected without needing to use @inject()
 */
export class Logger implements BaseLogger {
  readonly level: LevelWithSilent | string
  fatal: LogFn
  error: LogFn
  warn: LogFn
  info: LogFn
  debug: LogFn
  trace: LogFn
  silent: LogFn

  constructor(options: LoggerOptions) {
    const delegate = pino(options)

    this.level = delegate.level
    this.fatal = delegate.fatal.bind(delegate)
    this.error = delegate.error.bind(delegate)
    this.warn = delegate.warn.bind(delegate)
    this.info = delegate.info.bind(delegate)
    this.debug = delegate.debug.bind(delegate)
    this.trace = delegate.trace.bind(delegate)
    this.silent = delegate.silent.bind(delegate)
  }
}
