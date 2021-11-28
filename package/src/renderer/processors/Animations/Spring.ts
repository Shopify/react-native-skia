// eslint-disable-next-line max-len
// Taken from https://github.com/software-mansion/react-native-reanimated/blob/master/src/reanimated2/animation/spring.ts
import { useRef } from "react";

import { useFrame } from "./Animations";
import type { BaseAnimationState } from "./AnimationState";

interface SpringConfig {
  mass?: number;
  stiffness?: number;
  overshootClamping?: boolean;
  restDisplacementThreshold?: number;
  restSpeedThreshold?: number;
  velocity?: number;
  damping?: number;
}

interface SpringAnimationState extends BaseAnimationState {
  config: Required<SpringConfig>;
  lastTimestamp: number;
}

interface SpringParams {
  from?: number;
  to?: number;
  config?: SpringConfig;
}

export const useSpring = (
  params?: SpringParams,
  deps?: Parameters<typeof useFrame>[1]
) => {
  const state = useRef<SpringAnimationState>({
    from: params?.from ?? 0,
    to: params?.to ?? 1,
    config: {
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
      damping: 10,
      mass: 1,
      stiffness: 100,
      overshootClamping: false,
      velocity: 0,
      ...params?.config,
    },
    done: false,
    value: 0,
    lastTimestamp: 0,
  });
  return useFrame(({ timestamp }) => {
    const now = timestamp * 1000;
    const {
      to,
      value,
      lastTimestamp,
      config: {
        damping: c,
        mass: m,
        stiffness: k,
        overshootClamping,
        stiffness,
        restSpeedThreshold,
        restDisplacementThreshold,
        velocity,
      },
    } = state.current;
    if (state.current.done) {
      return to;
    }
    const deltaTime = Math.min(now - lastTimestamp, 64);
    state.current.lastTimestamp = now;

    const v0 = -velocity;
    const x0 = to - value;

    const zeta = c / (2 * Math.sqrt(k * m)); // damping ratio
    const omega0 = Math.sqrt(k / m); // undamped angular frequency of the oscillator (rad/ms)
    const omega1 = omega0 * Math.sqrt(1 - zeta ** 2); // exponential decay

    const t = deltaTime / 1000;

    const sin1 = Math.sin(omega1 * t);
    const cos1 = Math.cos(omega1 * t);

    // under damped
    const underDampedEnvelope = Math.exp(-zeta * omega0 * t);
    const underDampedFrag1 =
      underDampedEnvelope *
      (sin1 * ((v0 + zeta * omega0 * x0) / omega1) + x0 * cos1);

    const underDampedPosition = to - underDampedFrag1;
    // This looks crazy -- it's actually just the derivative of the oscillation function
    const underDampedVelocity =
      zeta * omega0 * underDampedFrag1 -
      underDampedEnvelope *
        (cos1 * (v0 + zeta * omega0 * x0) - omega1 * x0 * sin1);

    // critically damped
    const criticallyDampedEnvelope = Math.exp(-omega0 * t);
    const criticallyDampedPosition =
      to - criticallyDampedEnvelope * (x0 + (v0 + omega0 * x0) * t);

    const criticallyDampedVelocity =
      criticallyDampedEnvelope *
      (v0 * (t * omega0 - 1) + t * x0 * omega0 * omega0);

    const isOvershooting = () => {
      if (overshootClamping && stiffness !== 0) {
        return value < to ? state.current.value > to : state.current.value < to;
      } else {
        return false;
      }
    };

    const isVelocity = Math.abs(velocity) < restSpeedThreshold;
    const isDisplacement =
      stiffness === 0 || Math.abs(to - value) < restDisplacementThreshold;

    if (zeta < 1) {
      state.current.value = underDampedPosition;
      state.current.config.velocity = underDampedVelocity;
    } else {
      state.current.value = criticallyDampedPosition;
      state.current.config.velocity = criticallyDampedVelocity;
    }

    if (isOvershooting() || (isVelocity && isDisplacement)) {
      if (stiffness !== 0) {
        state.current.config.velocity = 0;
        state.current.value = to;
      }
      // clear lastTimestamp to avoid using stale value by the next spring animation that starts after this one
      state.current.lastTimestamp = 0;
      state.current.done = true;
    }
    return state.current.value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps ?? []);
};
