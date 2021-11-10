import type { IShader } from "./Shader";

export enum RuntimeEffectType {
  Shader,
  ColorFilter,
}

export interface IRuntimeEffect {
  makeShader: (value?: number[], children?: IShader[]) => IShader;
}
