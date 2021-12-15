export interface AnimationState {
  duration: number;
  startTime: number | null;
  easing: EasingFunction;
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

export interface SpringConfig {
  mass?: number;
  stiffness?: number;
  velocity?: number;
  damping?: number;
}
