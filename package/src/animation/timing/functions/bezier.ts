// eslint-disable-next-line max-len
// Taken from https://github.com/facebook/react-native/blob/0b9ea60b4fee8cacc36e7160e31b91fc114dbc0d/Libraries/Animated/src/bezier.js

const NEWTON_ITERATIONS = 4;
const NEWTON_MIN_SLOPE = 0.001;
const SUBDIVISION_PRECISION = 0.0000001;
const SUBDIVISION_MAX_ITERATIONS = 10;

const kSplineTableSize = 11;
const kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

const float32ArraySupported = typeof Float32Array === "function";

function a(aA1: number, aA2: number): number {
  return 1.0 - 3.0 * aA2 + 3.0 * aA1;
}

function b(aA1: number, aA2: number): number {
  return 3.0 * aA2 - 6.0 * aA1;
}

function c(aA1: number): number {
  return 3.0 * aA1;
}

// Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
function calcBezier(aT: number, aA1: number, aA2: number): number {
  return ((a(aA1, aA2) * aT + b(aA1, aA2)) * aT + c(aA1)) * aT;
}

// Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
function getSlope(aT: number, aA1: number, aA2: number): number {
  return 3.0 * a(aA1, aA2) * aT * aT + 2.0 * b(aA1, aA2) * aT + c(aA1);
}

function binarySubdivide({
  aX,
  _aA,
  _aB,
  mX1,
  mX2,
}: {
  aX: number;
  _aA: number;
  _aB: number;
  mX1: number;
  mX2: number;
}): number {
  let currentX;
  let currentT;
  let i = 0;
  let aA = _aA;
  let aB = _aB;
  do {
    currentT = aA + (aB - aA) / 2.0;
    currentX = calcBezier(currentT, mX1, mX2) - aX;
    if (currentX > 0.0) {
      aB = currentT;
    } else {
      aA = currentT;
    }
  } while (
    Math.abs(currentX) > SUBDIVISION_PRECISION &&
    ++i < SUBDIVISION_MAX_ITERATIONS
  );

  return currentT;
}

function newtonRaphsonIterate(
  aX: number,
  _aGuessT: number,
  mX1: number,
  mX2: number
): number {
  let aGuessT = _aGuessT;
  for (let i = 0; i < NEWTON_ITERATIONS; ++i) {
    const currentSlope = getSlope(aGuessT, mX1, mX2);
    if (currentSlope === 0.0) {
      return aGuessT;
    }

    const currentX = calcBezier(aGuessT, mX1, mX2) - aX;
    aGuessT -= currentX / currentSlope;
  }

  return aGuessT;
}

export function bezier(
  mX1: number,
  mY1: number,
  mX2: number,
  mY2: number
): (x: number) => number {
  if (!(mX1 >= 0 && mX1 <= 1 && mX2 >= 0 && mX2 <= 1)) {
    throw new Error("bezier x values must be in [0, 1] range");
  }

  // Precompute samples table
  const sampleValues = float32ArraySupported
    ? new Float32Array(kSplineTableSize)
    : new Array(kSplineTableSize);
  if (mX1 !== mY1 || mX2 !== mY2) {
    for (let i = 0; i < kSplineTableSize; ++i) {
      sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
    }
  }

  function getTForX(aX: number): number {
    let intervalStart = 0.0;
    let currentSample = 1;
    const lastSample = kSplineTableSize - 1;

    for (
      ;
      currentSample !== lastSample && sampleValues[currentSample] <= aX;
      ++currentSample
    ) {
      intervalStart += kSampleStepSize;
    }

    --currentSample;

    // Interpolate to provide an initial guess for t
    const dist =
      (aX - sampleValues[currentSample]) /
      (sampleValues[currentSample + 1] - sampleValues[currentSample]);
    const guessForT = intervalStart + dist * kSampleStepSize;

    const initialSlope = getSlope(guessForT, mX1, mX2);
    if (initialSlope >= NEWTON_MIN_SLOPE) {
      return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
    }

    if (initialSlope === 0.0) {
      return guessForT;
    }

    return binarySubdivide({
      aX,
      _aA: intervalStart,
      _aB: intervalStart + kSampleStepSize,
      mX1,
      mX2,
    });
  }

  return function (x: number): number {
    if (mX1 === mY1 && mX2 === mY2) {
      return x; // linear
    }

    // Because JavaScript number are imprecise, we should guarantee the extremes are right.
    if (x === 0) {
      return 0;
    }

    if (x === 1) {
      return 1;
    }

    return calcBezier(getTForX(x), mY1, mY2);
  };
}
