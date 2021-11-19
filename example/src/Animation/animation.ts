const normalize = (
  value: number,
  params: {
    durationSeconds: number;
  }
) => (value / params.durationSeconds / 1) % 1;

const easingInOut = (t: number) => {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
};

const Easing = {
  inOut: easingInOut,
};

enum Extrapolate {
  EXTEND = 0,
  CLAMP = 1,
  IDENTITY = 2,
}

const interpolateInternal = (
  x: number,
  l: number,
  r: number,
  ll: number,
  rr: number,
  type: Extrapolate
) => {
  if (r - l === 0) {
    return ll;
  }
  const progress = (x - l) / (r - l);
  const val = ll + progress * (rr - ll);
  const coef = rr >= ll ? 1 : -1;

  type = type || Extrapolate.EXTEND;

  if (coef * val < coef * ll || coef * val > coef * rr) {
    switch (type) {
      case Extrapolate.IDENTITY:
        return x;
      case Extrapolate.CLAMP:
        if (coef * val < coef * ll) {
          return ll;
        }
        return rr;
      case Extrapolate.EXTEND:
      default:
        return val;
    }
  }
  return val;
};

const interpolate = (
  v: number,
  inputRange: Array<number>,
  outputRange: Array<number>,
  type: Extrapolate = 0
) => {
  const { length } = inputRange;
  let narrowedInput: Array<number> = [];
  if (v < inputRange[0]) {
    narrowedInput = [
      inputRange[0],
      inputRange[1],
      outputRange[0],
      outputRange[1],
    ];
  } else if (v > inputRange[length - 1]) {
    narrowedInput = [
      inputRange[length - 2],
      inputRange[length - 1],
      outputRange[length - 2],
      outputRange[length - 1],
    ];
  } else {
    for (let i = 1; i < length; ++i) {
      if (v <= inputRange[i]) {
        narrowedInput = [
          inputRange[i - 1],
          inputRange[i],
          outputRange[i - 1],
          outputRange[i],
        ];
        break;
      }
    }
  }
  return interpolateInternal(
    v,
    narrowedInput[0],
    narrowedInput[1],
    narrowedInput[2],
    narrowedInput[3],
    type
  );
};

export const Animation = {
  Easing,
  Extrapolate,
  interpolate,
  normalize,
};
