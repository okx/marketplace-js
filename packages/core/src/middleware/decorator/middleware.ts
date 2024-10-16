import { deepClone } from '../../utils'

export function mixinMiddleware (
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const originalValue = descriptor.value

  if (typeof originalValue === 'function') {
    descriptor.value = async function (...args: any[]) {
      const _this: any = this
      // create current transaction context
      const ctx = deepClone(_this.ctx)
      ctx.type = propertyKey
      if (!ctx.request) {
        ctx.request = {}
      }
      ctx.request.params = args
      let result
      await _this.execute(ctx, async (ctx: Record<string, any>, next: () => Promise<void>) => {
        if (!ctx.response) {
          ctx.response = {}
        }
        // while using middleware, the results can be returned normally
        ctx.response.result = result = await originalValue.apply(
          this,
          args
        )
        await next()
      })
      return result
    }
  }

  return descriptor
}
