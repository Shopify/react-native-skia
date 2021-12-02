import type { SpringAnimationState } from "./types";

export const spring = (timestamp: number, state: SpringAnimationState) => {
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
  } = state;
  if (state.done) {
    return to;
  }

  const deltaTime = Math.min(now - lastTimestamp, 64);
  state.lastTimestamp = now;

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
      return value < to ? state.value > to : state.value < to;
    } else {
      return false;
    }
  };

  const isVelocity = Math.abs(velocity) < restSpeedThreshold;
  const isDisplacement =
    stiffness === 0 || Math.abs(to - value) < restDisplacementThreshold;

  if (zeta < 1) {
    state.value = underDampedPosition;
    state.config.velocity = underDampedVelocity;
  } else {
    state.value = criticallyDampedPosition;
    state.config.velocity = criticallyDampedVelocity;
  }

  if (isOvershooting() || (isVelocity && isDisplacement)) {
    if (stiffness !== 0) {
      state.config.velocity = 0;
      state.value = to;
    }
    state.lastTimestamp = 0;
    state.done = true;
  }
  return state.value;
};
