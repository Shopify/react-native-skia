export interface SpringConfig {
  mass: number;
  stiffness: number;
  damping: number;
  velocity: number;
}

export interface TimingConfig {
  duration: number;
  easing?: (t: number) => number;
}

export interface TimingParams {
  from?: number;
  to?: number;
  loop?: boolean;
  yoyo?: boolean;
}

export type RequiredAnimationParams = Required<Omit<TimingParams, "from">> &
  Pick<TimingParams, "from">;

export type AnimationCallback = (current: number) => void;
