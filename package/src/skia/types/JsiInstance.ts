export interface SkJSIInstance<T extends string> {
  __typename__: T;
}

export interface JsiDisposable {
  dispose: () => void;
}
