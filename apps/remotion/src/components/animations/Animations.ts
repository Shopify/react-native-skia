import { Easing, interpolate, useCurrentFrame } from "remotion";

export class Value<T = number> {
  constructor(public value: T) {}
}

type EasingFunction = (value: number) => number;

type Input = (() => Generator) | Generator;
type Inputs = Input[];

const materializeGenerator = (input: Input) => {
  "worklet";
  return typeof input === "function" ? input() : input;
};

interface TimingConfig {
  to?: number;
  easing?: EasingFunction;
  duration?: number;
}

const defaultTimingConfig: Required<TimingConfig> = {
  to: 1,
  easing: Easing.inOut(Easing.ease),
  duration: 30,
};

export function* currentFrame() {
  "worklet";
  const time: number = yield;
  return time;
}

export function* timing(value: Value, rawConfig?: TimingConfig) {
  const from = value.value;
  const { to, easing, duration } = { ...defaultTimingConfig, ...rawConfig };
  for (let i = 0; i < duration; i++) {
    const progress = easing(i / duration);
    const val = interpolate(progress, [0, 1], [from, to]);
    value.value = val;
    yield* currentFrame();
  }
  value.value = to;
}

export function* wait(duration = 30) {
  for (let i = 0; i < duration; i++) {
    yield* currentFrame();
  }
}

export function* waitUntil(value: number) {
  let frame = yield* currentFrame();
  while (frame < value) {
    frame = yield* currentFrame();
  }
}

export function* parallel(...inputs: Inputs) {
  "worklet";
  const iterators = inputs.map((input) => materializeGenerator(input));
  let isDone = false;
  let frame = yield* currentFrame();
  while (!isDone) {
    const done = [];
    for (const iterator of iterators) {
      const val = iterator.next(frame);
      done.push(val.done);
    }
    isDone = done.every((d) => d);
    if (!isDone) {
      frame = yield* currentFrame();
    }
  }
}

export function* stagger(delay: number, ...inputs: Inputs) {
  "worklet";
  const iterators = inputs.map((input, index) => {
    return (function* () {
      yield* wait(delay * index);
      yield* materializeGenerator(input);
    })();
  });

  yield* parallel(...iterators);
}

type AnimationValues<S> = {
  [K in keyof S]: Value<S[K]>;
};

const dematerialize = <T>(state: T) => {
  const result: Record<string, unknown> = {};
  for (const key in state) {
    result[key] = new Value(state[key]);
  }
  return result as AnimationValues<T>;
};

const materialize = <T>(state: AnimationValues<T>) => {
  const result: Record<string, unknown> = {};
  for (const key in state) {
    result[key] = state[key].value;
  }
  return result as T;
};

const copy = <T>(state: T) => JSON.parse(JSON.stringify(state));

class AnimationState<T> {
  private frames: T[] = [];

  constructor(anim: (state: AnimationValues<T>) => Generator, initialState: T) {
    const values = dematerialize(initialState);
    const it = anim(values);
    let frame = 0;
    while (true) {
      const result = it.next(frame);
      this.frames.push(copy(materialize(values)));
      if (result.done) {
        break;
      }
      frame++;
    }
  }

  at(frame: number) {
    const lastFrame = this.frames.length - 1;
    return this.frames[Math.min(lastFrame, frame)];
  }

  get duration() {
    return this.frames.length;
  }
}

export const makeAnimation = <S>(
  animation: (state: AnimationValues<S>) => Generator,
  state: S
) => {
  return new AnimationState(animation, state);
};

export const useAnimation = <T>(state: AnimationState<T>) => {
  const frame = useCurrentFrame();
  return state.at(frame);
};
