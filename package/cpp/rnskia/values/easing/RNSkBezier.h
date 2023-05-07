#pragma once

#include <memory>

namespace RNSkia {

// eslint-disable-next-line max-len
// Taken from
// https://github.com/facebook/react-native/blob/0b9ea60b4fee8cacc36e7160e31b91fc114dbc0d/Libraries/Animated/src/bezier.js

const size_t NEWTON_ITERATIONS = 4;
const double NEWTON_MIN_SLOPE = 0.001;
const double SUBDIVISION_PRECISION = 0.0000001;
const double SUBDIVISION_MAX_ITERATIONS = 10;

const size_t kSplineTableSize = 11;
const double kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

double a(double aA1, double aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }

double b(double aA1, double aA2) { return 3.0 * aA2 - 6.0 * aA1; }

double c(double aA1) { return 3.0 * aA1; }

// Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
double calcBezier(double aT, double aA1, double aA2) {
  return ((a(aA1, aA2) * aT + b(aA1, aA2)) * aT + c(aA1)) * aT;
}

// Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
double getSlope(double aT, double aA1, double aA2) {
  return 3.0 * a(aA1, aA2) * aT * aT + 2.0 * b(aA1, aA2) * aT + c(aA1);
}

double binarySubdivide(double aX, double _aA, double _aB, double mX1,
                       double mX2) {
  double currentX;
  double currentT;
  double i = 0;
  double aA = _aA;
  double aB = _aB;
  do {
    currentT = aA + (aB - aA) / 2.0;
    currentX = calcBezier(currentT, mX1, mX2) - aX;
    if (currentX > 0.0) {
      aB = currentT;
    } else {
      aA = currentT;
    }
  } while (std::abs(currentX) > SUBDIVISION_PRECISION &&
           ++i < SUBDIVISION_MAX_ITERATIONS);

  return currentT;
}

double newtonRaphsonIterate(double aX, double _aGuessT, double mX1,
                            double mX2) {
  double aGuessT = _aGuessT;
  for (size_t i = 0; i < NEWTON_ITERATIONS; ++i) {
    auto currentSlope = getSlope(aGuessT, mX1, mX2);
    if (currentSlope == 0.0) {
      return aGuessT;
    }

    auto currentX = calcBezier(aGuessT, mX1, mX2) - aX;
    aGuessT -= currentX / currentSlope;
  }

  return aGuessT;
}

class RNSkBezier {
public:
  static std::function<double(double)> bezier(double mX1, double mY1,
                                              double mX2, double mY2) {
    if (!(mX1 >= 0 && mX1 <= 1 && mX2 >= 0 && mX2 <= 1)) {
      throw std::invalid_argument("bezier x values must be in [0, 1] range");
    }

    // Precompute samples table
    std::vector<double> sampleValues(kSplineTableSize);

    if (mX1 != mY1 || mX2 != mY2) {
      for (size_t i = 0; i < kSplineTableSize; ++i) {
        sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
      }
    }

    auto getTForX = [sampleValues = std::move(sampleValues), mX1,
                     mX2](double aX) -> double {
      double intervalStart = 0.0;
      size_t currentSample = 1;
      auto lastSample = kSplineTableSize - 1;

      for (; currentSample != lastSample && sampleValues[currentSample] <= aX;
           ++currentSample) {
        intervalStart += kSampleStepSize;
      }

      --currentSample;

      // Interpolate to provide an initial guess for t
      auto dist =
          (aX - sampleValues[currentSample]) /
          (sampleValues[currentSample + 1] - sampleValues[currentSample]);
      auto guessForT = intervalStart + dist * kSampleStepSize;

      auto initialSlope = getSlope(guessForT, mX1, mX2);
      if (initialSlope >= NEWTON_MIN_SLOPE) {
        return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
      }

      if (initialSlope == 0.0) {
        return guessForT;
      }

      return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize,
                             mX1, mX2);
    };

    return [getTForX = std::move(getTForX), mX1, mY1, mX2,
            mY2](double x) -> double {
      if (mX1 == mY1 && mX2 == mY2) {
        return x; // linear
      }

      // Because JavaScript number are imprecise, we should guarantee the
      // extremes are right.
      if (x == 0) {
        return 0;
      }

      if (x == 1) {
        return 1;
      }

      return calcBezier(getTForX(x), mY1, mY2);
    };
  }
};

} // namespace RNSkia
