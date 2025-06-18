export const __esModule: boolean;
/**
 * Create a lazily-imported module proxy.
 * This is useful for lazily requiring optional dependencies.
 */
export function createModuleProxy(getModule: any): {
    module: undefined;
};
export class OptionalDependencyNotInstalledError extends Error {
    constructor(name: any);
}
