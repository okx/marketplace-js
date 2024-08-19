export abstract class Middleware<K = Record<string, any>> {
  abstract ctx: K;

  private middlewares: Array<(context: K, next: () => Promise<void>) => Promise<void>> = []

  use (middleware: (context: K, next: () => Promise<void>) => Promise<void>) {
    if (typeof middleware !== 'function') {
      throw new Error('Middleware must be a function')
    }

    this.middlewares.push(middleware)
  }

  async execute (context: K, next: (context: K, next: () => Promise<void>) => Promise<void>) {
    let startIndex = -1

    const dispatch = async (index: number) => {
      if (index <= startIndex) throw new Error('next() called multiple times')
      startIndex = index
      let middleware = this.middlewares[index]
      // If the middleware execution is completed,
      // then the next middleware is the next function
      if (index === this.middlewares.length) middleware = next
      // When all middleware is executed, it ends
      if (!middleware) return
      // Execute the middleware
      await middleware(context, () => {
        return dispatch(index + 1)
      })
    }

    // default start index is zero
    await dispatch(0)
  }
}

export * from './decorator/middleware'
