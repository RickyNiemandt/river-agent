/** In-memory KV stand-in for temporary / local deploys without a real namespace. */
export class MemoryKV {
  private store = new Map<string, { value: string; expiresAt?: number }>();

  async get(key: string): Promise<string | null> {
    const row = this.store.get(key);
    if (!row) return null;
    if (row.expiresAt && Date.now() > row.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return row.value;
  }

  async put(
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ): Promise<void> {
    const expiresAt =
      options?.expirationTtl && options.expirationTtl > 0
        ? Date.now() + options.expirationTtl * 1000
        : undefined;
    this.store.set(key, { value, expiresAt });
  }
}

const globalMemory = new MemoryKV();

export interface KvLike {
  get(key: string): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ): Promise<void>;
}

export function getKv(env: { RIVER_KV?: KVNamespace }): KvLike {
  if (env.RIVER_KV) {
    return {
      get: (key) => env.RIVER_KV!.get(key),
      put: (key, value, options) => env.RIVER_KV!.put(key, value, options),
    };
  }
  return globalMemory;
}
