// import { AppContext, ServerContext } from './context';
// import { AiAdapter } from './adapter/ai';

export function makeMockAdapter<T>(adapterName: string, methodNames: Array<keyof T>): jest.Mocked<T> {
  return methodNames.reduce((acc, methodName) => {
    acc[methodName] = jest.fn(() => {
      throw Error(`
        adapters.${adapterName}.${String(methodName)} was called without being mocked.
        Call adapters.${adapterName}.${String(methodName)}.mockReturnValue(...) in your test
      `);
    });
    return acc;
  }, {} as any);
  // Use of `any` is safe here since the return type is enforced in the return
  // type signature of makeMockAdapter.
}

/*
export const mockServerContext = (): ServerContext => {
  return {
    ai: {
      pub: {}
    }, 
  };
}
*/


