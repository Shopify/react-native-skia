export interface SkJSIInstance<T extends string> extends Disposable {
  __typename__: T;
  dispose(): void;
}
