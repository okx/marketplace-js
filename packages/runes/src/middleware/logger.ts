import { logger } from '@okxweb3/marketplace-core'
import { MiddlewareType } from '../types/middleware'

export const loggerMiddleware: MiddlewareType = async (ctx, next) => {
  // before
  logger.info(`call ${ctx.type} params: `, ctx.request.params)
  // execute
  await next()
  // after
  logger.info(`call ${ctx.type} result: `, ctx.response.result)
}
