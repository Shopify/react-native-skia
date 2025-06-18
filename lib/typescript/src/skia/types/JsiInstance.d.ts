export interface SkJSIInstance<T extends string> {
    __typename__: T;
    dispose(): void;
}
