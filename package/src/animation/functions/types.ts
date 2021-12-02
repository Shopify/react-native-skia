export interface BaseAnimationState {
  done: boolean;
  value: number;
  from: number;
  to: number;
}

export type EasingFunction = (value: number) => number;

export interface TimingConfig {
  from?: number;
  to?: number;
  duration?: number;
  easing?: EasingFunction;
}

export interface TimingAnimationState extends BaseAnimationState {
  duration: number;
  easing: EasingFunction;
  startTime: number | null;
}

export interface SpringConfig {
  mass?: number;
  stiffness?: number;
  overshootClamping?: boolean;
  restDisplacementThreshold?: number;
  restSpeedThreshold?: number;
  velocity?: number;
  damping?: number;
}

export interface SpringAnimationState extends BaseAnimationState {
  config: Required<SpringConfig>;
  lastTimestamp: number;
}
