export type EasingFunction = (value: number) => number;

export interface TimingConfig {
  from?: number;
  to?: number;
  duration?: number;
  easing?: EasingFunction;
}
