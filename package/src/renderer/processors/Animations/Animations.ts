export type SharedValueType<T = number> = {
  value: T;
};

export type AnimatedProp<T> = T | SharedValueType<T>;

export type AnimatedProps<T, O extends keyof T | never = never> = {
  [K in keyof T]: K extends "children"
    ? T[K]
    : K extends O
    ? T[K]
    : AnimatedProp<T[K]>;
};

export type SkiaProps<
  P = object,
  O extends keyof P | never = never
> = AnimatedProps<P, O>;

type WithOptional<T extends object, N extends keyof T> = Omit<T, N> & {
  [K in N]?: T[K];
};

export type SkiaDefaultProps<
  T extends object,
  N extends keyof T
> = WithOptional<SkiaProps<T>, N>;
