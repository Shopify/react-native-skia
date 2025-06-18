import type { SkRuntimeEffect } from "./RuntimeEffect";
export interface RuntimeEffectFactory {
    /**
     * Compiles a RuntimeEffect from the given shader code.
     * @param sksl - Source code for a shader written in SkSL
     * @param callback - will be called with any compilation error. If not provided, errors will
     *                   be printed to console.log().
     */
    Make: (sksl: string) => SkRuntimeEffect | null;
}
