import type { CanvasKit, EmbindEnumEntity, EmbindEnum } from "canvaskit-wasm";

import type { SkJSIInstance } from "../types";

const isRunningInJest = () => {
  return (
    typeof jest !== "undefined" ||
    (typeof process !== "undefined" &&
      process.env &&
      process.env.NODE_ENV === "test")
  );
};

export const throwNotImplementedOnRNWeb = <T>(): T => {
  if (!isRunningInJest()) {
    throw new Error("Not implemented on React Native Web");
  }
  return null as unknown as T;
};

export abstract class Host {
  readonly CanvasKit: CanvasKit;

  constructor(CanvasKit: CanvasKit) {
    this.CanvasKit = CanvasKit;
  }
}

export abstract class BaseHostObject<T, N extends string>
  extends Host
  implements SkJSIInstance<N>
{
  readonly __typename__: N;
  ref: T;

  constructor(CanvasKit: CanvasKit, ref: T, typename: N) {
    super(CanvasKit);
    this.ref = ref;
    this.__typename__ = typename;
  }

  abstract dispose(): void;
}

export abstract class HostObject<T, N extends string> extends BaseHostObject<
  T,
  N
> {
  static fromValue<T>(value: SkJSIInstance<string>) {
    return (value as HostObject<T, string>).ref;
  }
}

export const getEnum = (e: EmbindEnum, v: number): EmbindEnumEntity =>
  Object.values(e).find(({ value }) => value === v);

export const optEnum = (
  e: EmbindEnum,
  value: number | undefined
): EmbindEnumEntity | undefined =>
  value === undefined ? undefined : getEnum(e, value);
