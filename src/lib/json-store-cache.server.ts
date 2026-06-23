import { readFileSync, writeFileSync } from "fs";
import { cache } from "react";
import { revalidateTag, unstable_cache } from "next/cache";

type JsonStoreOptions<T> = {
  path: string;
  cacheKey: string;
  tag: string;
  revalidate?: number;
  fallback: () => T;
  pretty?: boolean;
};

export function createJsonStore<T>(options: JsonStoreOptions<T>) {
  const loadFromDisk = (): T => {
    try {
      return JSON.parse(readFileSync(options.path, "utf-8")) as T;
    } catch {
      return options.fallback();
    }
  };

  const getCached = unstable_cache(
    async () => loadFromDisk(),
    [options.cacheKey],
    { revalidate: options.revalidate ?? 120, tags: [options.tag] },
  );

  const read = cache(async (): Promise<T> => getCached());

  function write(data: T): void {
    const json = JSON.stringify(data, null, options.pretty ? 2 : 0);
    writeFileSync(options.path, options.pretty ? `${json}\n` : json, "utf-8");
    revalidateTag(options.tag);
  }

  function readForWrite(): T {
    return loadFromDisk();
  }

  return { read, write, readForWrite, tag: options.tag };
}
