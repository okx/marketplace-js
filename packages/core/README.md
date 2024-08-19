<h1>@okxweb3/marketplace-core</h1>
  <p>
    @okxweb3/marketplace-core is an SDK that offers essential foundational capabilities, enabling developers to create reliable and efficient applications.
  </p>


## Installation

```js
npm i @okxweb3/marketplace-core
```

## Usage

### logger

includes a robust logging system designed to support code debugging and monitoring. This system provides multiple log levels and is tailored for development environments:

```js
import { logger } from '@okxweb3/marketplace-core'
logger.debug('debug')
logger.info('info', true, 2)
logger.warn('warn', {})
logger.error('error', new Error('error'))
```

### Middleware

A sophisticated middleware system that utilizes an onion model architecture. This approach enhances flexibility and control over data processing and application logic:

```js
import { mixinMiddleware, Middleware, logger } from '@okxweb3/marketplace-core'

class Demo extends Middleware {
  // Passed as context of middleware
  public ctx = {
    type: '', // The name of the method called
    commonProperty: '0x', // Custom properties 
    request: {
      commonProperty1: 'commonProperty1', // Custom properties
      params: [] // Called method input parameters
    },
    response: {
      commonProperty2: true, // Custom properties
      result: '' // The method called returns the result
    }
  }

  constructor () {
    super()
  }

  // Used to identify whether to execute middleware when a certain method is executed.
  @mixinMiddleware
  async buy (options: { psbt: string }): Promise<string> {
    return Promise.resolve('buy')
  }
}

const demo = new Demo()

// Register middleware
demo.use(async (ctx, next) => {
  // before
  logger.info(`call ${ctx.type} params: `, ctx.request.params)
  // execute
  await next()
  // after
  logger.info(`call ${ctx.type} result: `, ctx.response.result)
})

// When calling the buy method, the registered middleware will be executed.
await demo.buy({ psbt: 'psbt' });
```


