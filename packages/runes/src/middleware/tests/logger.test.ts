// loggerMiddleware.test.ts
import { logger } from '@okxweb3/marketplace-core'
import { loggerMiddleware } from '../logger' // 假设文件名为 loggerMiddleware.ts
import { BaseContext } from '../../types/middleware' // 根据你的项目结构导入 BaseContext 类型

// Mock logger
jest.mock('@okxweb3/marketplace-core', () => ({
  logger: {
    info: jest.fn()
  }
}))

describe('loggerMiddleware', () => {
  const mockNext = jest.fn()

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should log the request parameters and response result', async () => {
    const ctx: BaseContext<string, any[], Record<string, any>> = {
      type: 'GET',
      request: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        params: { key1: 'value1', key2: 'value2' } // 这里是对象
      },
      response: {
        result: { success: true }
      },
      address: 'mockAddress', // 添加缺失的属性
      publicKey: 'mockPublicKey' // 添加缺失的属性
    }

    await loggerMiddleware(ctx, mockNext)

    // Check that the logger.info was called with the correct parameters
    expect(logger.info).toHaveBeenCalledWith('call GET params: ', ctx.request.params)
    expect(mockNext).toHaveBeenCalled()
    expect(logger.info).toHaveBeenCalledWith('call GET result: ', ctx.response.result)
  })

  it('should call next function', async () => {
    const ctx: BaseContext<string, any[], Record<string, any>> = {
      type: 'POST',
      request: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        params: { key: 'value' } // 这里是对象
      },
      response: {
        result: { success: false }
      },
      address: 'mockAddress', // 添加缺失的属性
      publicKey: 'mockPublicKey' // 添加缺失的属性
    }

    await loggerMiddleware(ctx, mockNext)

    expect(mockNext).toHaveBeenCalled() // Ensure next is called
  })
})
