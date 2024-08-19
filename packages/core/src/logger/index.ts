import { LoggerLevelEnum } from '../constants/logger'

class Logger {
  private isDev = process.env.NODE_ENV === 'development'

  private log (level: LoggerLevelEnum, message: string, ...args: unknown[]) {
    if (this.isDev) {
      switch (level) {
        case LoggerLevelEnum.INFO:
          console.log(`INFO: ${message}`, ...args)
          break
        case LoggerLevelEnum.WARN:
          console.warn(`WARN: ${message}`, ...args)
          break
        case LoggerLevelEnum.ERROR:
          console.error(`ERROR: ${message}`, ...args)
          break
        default:
          console.log(`DEBUG: ${message}`, ...args)
      }
    }
  }

  debug (message: string, ...args: unknown[]) {
    this.log(LoggerLevelEnum.DEBUG, message, ...args)
  }

  info (message: string, ...args: unknown[]) {
    this.log(LoggerLevelEnum.INFO, message, ...args)
  }

  warn (message: string, ...args: unknown[]) {
    this.log(LoggerLevelEnum.WARN, message, ...args)
  }

  error (message: string, ...args: unknown[]) {
    this.log(LoggerLevelEnum.ERROR, message, ...args)
  }
}

export const logger = new Logger()
