import type { DataSourceParam, SkImage } from "../types";
/**
 * Returns a Skia Image object
 * */
export declare const useImage: (source: DataSourceParam, onError?: (err: Error) => void) => SkImage | null;
/**
 * Creates an image from a given view reference. NOTE: This method has different implementations
 * on web/native. On web, the callback is called with the view ref and the callback is expected to
 * return a promise that resolves to a Skia Image object. On native, the view ref is used to
 * find the view tag and the Skia Image object is created from the view tag. This means that on web
 * you will need to implement the logic to create the image from the view ref yourself.
 * @param viewRef Ref to the view we're creating an image from
 * @returns A promise that resolves to a Skia Image object or rejects
 * with an error id the view tag is invalid.
 */
export declare const makeImageFromView: <T extends number | React.Component<unknown, unknown> | React.ComponentClass<unknown>>(viewRef: React.RefObject<T>, callback?: null | ((viewRef: React.RefObject<T>) => Promise<SkImage | null>)) => Promise<SkImage | null>;
