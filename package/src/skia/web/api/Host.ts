import type { CanvasKit } from "canvaskit-wasm";

import type { SkJSIInstance } from "../../JsiInstance";

export abstract class Host {
  readonly CanvasKit: CanvasKit;

  constructor(CanvasKit: CanvasKit) {
    this.CanvasKit = CanvasKit;
  }
}

export abstract class HostObject<T, N extends string>
  extends Host
  implements SkJSIInstance<N>
{
  readonly __typename__: N;
  readonly ref: T;

  constructor(CanvasKit: CanvasKit, ref: T, typename: N) {
    super(CanvasKit);
    this.ref = ref;
    this.__typename__ = typename;
  }
}

export const toValue = <T>(value: unknown): T =>
  (value as HostObject<T, string>).ref;

export const ckEnum = (value: number) => ({ value });
