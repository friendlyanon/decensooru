export const sleep = <T = unknown>(millis: number, value?: T) =>
  new Promise(resolve => setTimeout(resolve, millis, value));
