export interface BaseSkJSIInstance {
  dispose: () => void;
}

export interface SkJSIInstance<T extends string> extends BaseSkJSIInstance {
  __typename__: T;
}
