export type BaseContext<T extends string = string, Req = any[], Res = any> = {
  type: T;
  address: string;
  publicKey: string;
  request: {
    params: Req;
  };
  response: {
    result: Res;
  };
}

export type MiddlewareType = (context: BaseContext, next: () => Promise<void>) => Promise<void>;
