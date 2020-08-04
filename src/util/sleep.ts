export const sleep = <T = unknown>(millis: number, value?: T): Promise<T> =>
  new Promise(resolve => setTimeout(resolve, millis, value));
