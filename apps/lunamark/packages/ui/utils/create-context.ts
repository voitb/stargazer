import {
  createContext as reactCreateContext,
  useContext as reactUseContext,
  type Context,
  type Provider,
} from "react";

export function createContext<T>(
  displayName: string
): [Provider<T | null>, () => T, Context<T | null>] {
  const Context = reactCreateContext<T | null>(null);
  Context.displayName = displayName;

  function useContext(): T {
    const context = reactUseContext(Context);
    if (context === null) {
      throw new Error(
        `use${displayName}Context must be used within a ${displayName}Provider`
      );
    }
    return context;
  }

  return [Context.Provider, useContext, Context];
}
