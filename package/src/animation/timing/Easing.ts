export enum EasingType {
  Step0 = 0,
  Step1 = 1,
  Linear = 2,
  Ease = 3,
  Quad = 4,
  Cubic = 5,
  Poly = 6,
  Sin = 7,
  Circle = 8,
  Exp = 9,
  Elastic = 10,
  Back = 11,
  Bounce = 12,

  Out = 20,
  InOut = 21,
  Bezier = 22,
}

export type EasingConfig = {
  type: EasingType;
  parameters?: {};
  child?: EasingConfig;
};

export class Easing {
  static step0 = { type: EasingType.Step0 };
  static step1 = { type: EasingType.Step1 };
  static linear = { type: EasingType.Linear };
  static quad = { type: EasingType.Quad };
  static cubic = { type: EasingType.Cubic };
  static sin = { type: EasingType.Sin };
  static circle = { type: EasingType.Circle };
  static exp = { type: EasingType.Exp };
  static bounce = { type: EasingType.Bounce };
  static poly = (n: number): EasingConfig => ({
    type: EasingType.Poly,
    parameters: { n },
  });

  static in = (easing: EasingConfig): EasingConfig => easing;

  static out = (easing: EasingConfig): EasingConfig => ({
    type: EasingType.Out,
    child: easing,
  });

  static inOut(easing: EasingConfig): EasingConfig {
    return { type: EasingType.InOut, child: easing };
  }

  static elastic(bounciness = 1): EasingConfig {
    return { type: EasingType.Elastic, parameters: { bounciness } };
  }

  static back(s = 1.70158): EasingConfig {
    return { type: EasingType.Back, parameters: { s } };
  }

  static bezier = (
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): EasingConfig => ({
    type: EasingType.Bezier,
    parameters: { bezier: [x1, y1, x2, y2] },
  });

  static ease = Easing.bezier(0.42, 0, 1, 1);
}
