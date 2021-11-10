interface ISharedValue<T> {
  get value(): T;
  set value(v: T);
  addListener(listener: () => void): () => void;
}

interface IWorkletNativeApi {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  installWorklet: <T extends (...args: any) => any>(
    worklet: T,
    contextName?: string
  ) => void;
  createSharedValue: <T>(value: T) => ISharedValue<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  runWorklet: <T extends (...args: any) => any>(
    worklet: T,
    contextName?: string
  ) => (...args: Parameters<T>) => Promise<ReturnType<T>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callbackToJavascript: <T extends (...args: any) => any>(worklet: T) => T;
}

declare global {
  var Worklets: IWorkletNativeApi;
}

export {};
