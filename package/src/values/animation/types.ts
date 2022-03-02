export interface SpringConfig {
  duration: number;
  update: (t: number) => number;
}

export interface TimingConfig {
  duration: number;
  easing?: (t: number) => number;
}

export interface AnimationParams {
  from?: number;
  to?: number;
  loop?: boolean;
  yoyo?: boolean;
  immediate?: boolean;
}
