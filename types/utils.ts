/**
 * Shared Utility Types
 * @see ARCHITECTURE_RULES.md for usage guidelines
 */

import type { ComponentProps, ReactNode } from 'react'

// Object Manipulation
export type Prettify<T> = { [K in keyof T]: T[K] } & {}
export type StrictOmit<T, K extends keyof T> = Omit<T, K>
export type StrictExtract<T, U extends T> = Extract<T, U>
export type PartialBy<T, K extends keyof T> = Prettify<Omit<T, K> & Partial<Pick<T, K>>>
export type RequiredBy<T, K extends keyof T> = Prettify<Omit<T, K> & Required<Pick<T, K>>>
export type Nullable<T, K extends keyof T = keyof T> = Prettify<Omit<T, K> & { [P in K]: T[P] | null }>
export type Mutable<T> = { -readonly [K in keyof T]: T[K] }
export type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T
export type DeepReadonly<T> = T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T

// Conditional Keys
/** Require at least one of the specified keys */
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> &
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys]

/** Require exactly one of the specified keys (XOR) */
export type RequireExactlyOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> &
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, never>> }[Keys]

// Property Filtering
export type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends (...args: unknown[]) => unknown ? K : never
}[keyof T]
export type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends (...args: unknown[]) => unknown ? never : K
}[keyof T]
export type FunctionProperties<T> = Pick<T, FunctionPropertyNames<T>>
export type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>

// Array & Union
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never
export type ValueOf<T> = T[keyof T]
/** TS 5.4+ - Block inference from this parameter */
export type NoInfer<T> = [T][T extends unknown ? 0 : never]

// Brand/Nominal Types - Use for type-safe IDs
export type Brand<T, B extends string> = T & { __brand: B }

// React Types
export type PropsWithOptionalChildren<P = unknown> = P & { children?: ReactNode }
export type PropsWithRequiredChildren<P = unknown> = P & { children: ReactNode }
export type AsProp<C extends React.ElementType> = { as?: C }
/** For polymorphic "as" prop components */
export type PolymorphicComponentProps<C extends React.ElementType, Props = object> =
  AsProp<C> & Omit<ComponentProps<C>, keyof AsProp<C> | keyof Props> & Props
export type RenderProp<TChildProps> = ReactNode | ((props: TChildProps) => ReactNode)
export type ControllableState<T> = { value?: T; defaultValue?: T; onChange?: (value: T) => void }
export type EventHandler<E extends React.SyntheticEvent> = (event: E) => void

// CSS Types
export type CSSCustomProperty<T extends string> = `--${T}`
