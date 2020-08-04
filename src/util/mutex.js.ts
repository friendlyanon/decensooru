import { sleep } from "./sleep";

export interface MutexOptions {
  interval?: number;
  timeout?: number;
}

const defaultOptions = {
  interval: 250,
  timeout: 5000,
};

export class Mutex {
  private readonly interval: number;

  private readonly timeout: number;

  private readonly storage: Storage;

  constructor(
    storage: Storage,
    private readonly key: string,
    options: MutexOptions = {},
  ) {
    if (key === "") {
      throw new TypeError("Key must not be an empty string");
    }

    this.storage = storage;
    this.interval = options.interval ?? defaultOptions.interval;
    this.timeout = options.timeout ?? defaultOptions.timeout;
  }

  isLocked(): boolean {
    return Date.now() < this.getTime();
  }

  getTime(): number {
    const time = this.storage.getItem(this.key);

    return time == null ? 0 : parseInt(time, 10);
  }

  lock(): Mutex {
    this.storage.setItem(this.key, String(Date.now() + this.timeout));

    return this;
  }

  unlock(): Mutex {
    this.storage.removeItem(this.key);

    return this;
  }

  /**
   * @throws {Error} if the lock couldn't be acquired in a reasonable amount of
   * time
   */
  async promise(): Promise<Mutex> {
    for (; ; await sleep(this.interval)) {
      if (!this.isLocked()) {
        return this.unlock();
      }
    }
  }
}
