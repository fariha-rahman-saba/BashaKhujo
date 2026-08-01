import { AsyncLocalStorage } from "node:async_hooks";

const globalWithALS = globalThis as typeof globalThis & {
  AsyncLocalStorage?: typeof AsyncLocalStorage;
};

if (typeof globalWithALS.AsyncLocalStorage !== "function") {
  globalWithALS.AsyncLocalStorage = AsyncLocalStorage;
}
