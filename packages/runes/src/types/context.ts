import { OkxRunesSDK } from '../index'
import { BaseContext } from './middleware'

export type IContext<T extends keyof OkxRunesSDK> =
  OkxRunesSDK[T] extends (...args: infer P) => Promise<infer R> | infer R ?
    BaseContext<T, P, R> : never;
