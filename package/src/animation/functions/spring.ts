/**
 * @description Returns a cached jsContext function for a spring with duration
 * @param mass The mass of the spring
 * @param stiffness The stiffness of the spring
 * @param damping Spring damping
 * @param velocity The initial velocity
 */
export const createSpringEasing = (
  params: Partial<{
    mass: number;
    stiffness: number;
    damping: number;
    velocity: number;
  }>
) => {
  const {
    mass,
    stiffness,
    damping,
    velocity = 0,
  } = {
    mass: 1,
    stiffness: 100,
    damping: 10,
    ...params,
  };
  // TODO: Find correct velcoity
  return getSpringEasing(mass, stiffness, damping, velocity / 100);
};

const getSpringEasing = (
  mass: number,
  stiffness: number,
  damping: number,
  initialVelocity = 0
): { solver: (t: number) => number; duration: number } => {
  // Setup spring state
  const state = {
    w0: Math.sqrt(stiffness / mass),
    zeta: 0,
    wd: 0,
    a: 1,
    b: 0,
  };
  state.zeta = damping / (2 * Math.sqrt(stiffness * mass));
  state.wd =
    state.zeta < 1 ? state.w0 * Math.sqrt(1 - state.zeta * state.zeta) : 0;
  state.a = 1;
  state.b =
    state.zeta < 1
      ? (state.zeta * state.w0 + -initialVelocity) / state.wd
      : -initialVelocity + state.w0;

  const solver = (t: number, duration?: number) => {
    let progress = duration ? (duration * t) / 1000 : t;
    if (state.zeta < 1) {
      progress =
        Math.exp(-progress * state.zeta * state.w0) *
        (state.a * Math.cos(state.wd * progress) +
          state.b * Math.sin(state.wd * progress));
    } else {
      progress =
        (state.a + state.b * progress) * Math.exp(-progress * state.w0);
    }
    if (t === 0 || t === 1) {
      return t;
    }
    return 1 - progress;
  };

  const getDurationMs = () => {
    var frame = 1 / 6;
    var elapsed = 0;
    var rest = 0;
    while (true) {
      elapsed += frame;
      if (solver(elapsed) === 1) {
        rest++;
        if (rest >= 6) {
          break;
        }
      } else {
        rest = 0;
      }
    }
    var durationMs = elapsed * frame * 1000;
    return durationMs + 1000;
  };

  const durationMs = getDurationMs();

  // Calculate duration
  return {
    solver: (t) => solver(t, durationMs),
    duration: durationMs,
  };
};
