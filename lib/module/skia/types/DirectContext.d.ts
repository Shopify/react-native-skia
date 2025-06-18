import type { SkJSIInstance } from "./JsiInstance";

export interface GrDirectContext extends SkJSIInstance<"DirectContext"> {
    /**
     * Return the current GPU resource cache limit in bytes.
     */
    getResourceCacheLimit(): number;

    /**
     * Gets the number of resources that are held in cache
     */
    getResourceCacheUsageCount(): number;

    /**
     * returns the total number of bytes of video memory held
     *                          in the cache.
     */
    getResourceCacheUsageBytes(): number;

    /**
     * Gets the number of bytes in the cache consumed by purgeable (e.g. unlocked) resources.
     */
    getResourceCachePurgableBytes(): number;

    /**
    *  Specify the GPU resource cache limit. If the cache currently exceeds this limit,
    *  it will be purged (LRU) to keep the cache within the limit.
    *
    *  @param maxResourceBytes The maximum number of bytes of video memory
    *                          that can be held in the cache.
    */
    setResourceCacheLimit(maxResourceBytes: number): number;

    /**
    * Frees GPU created by the context. Can be called to reduce GPU memory
    * pressure.
    */
    freeGpuResources(): null;
}