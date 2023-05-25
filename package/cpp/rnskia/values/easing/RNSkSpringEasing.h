#pragma once

#include <chrono>
#include <memory>
#include <string>
#include <unordered_map>
#include <utility>

#include "RNSkBaseEasing.h"

namespace RNSkia {

struct RNSkSpringConfig {
  double mass;
  double stiffness;
  double velocity;
  double damping;
};

struct RNSkSpringState {
  double w0;
  double zeta;
  double wd;
  double a;
  double b;
};

/**
 Type for the cached spring
 */
struct CachedSpring {
  CachedSpring(double d, std::function<double(double)> s)
      : durationMs(d), solver(std::move(s)) {}
  double durationMs;
  std::function<double(double)> solver;
};

static std::unordered_map<size_t, CachedSpring> _springCache;

/**
 Implements a Spring based easing that precalculates and caches solver functions
 for different spring configurations. The input for the spring is a numeric
 value between 0 and 1.
 */
class RNSkSpringEasing : public RNSkFixedDurationEasing {
public:
  /**
   Constructs a spring easing from spring configuration
   */
  explicit RNSkSpringEasing(
      std::shared_ptr<RNSkPlatformContext> platformContext,
      jsi::Runtime &runtime, const jsi::Value &config)
      : RNSkFixedDurationEasing(platformContext) {

    auto configObject = config.asObject(runtime);
    double mass = configObject.getProperty(runtime, "mass").asNumber();
    double stiffness =
        configObject.getProperty(runtime, "stiffness").asNumber();
    double damping = configObject.getProperty(runtime, "damping").asNumber();

    auto velocityProp = configObject.getProperty(runtime, "velocity");
    double velocity = 0.0;
    if (!velocityProp.isUndefined() && !velocityProp.isNull()) {
      velocity = velocityProp.asNumber() / 100.0;
    }

    RNSkSpringConfig springConfig = {mass, stiffness, velocity, damping};

    // Calc new spring
    auto key = getKeyFromConfig(springConfig);
    if (_springCache.count(key) == 0) {
      // Solve the spring
      solveSpring(key, springConfig);
    }

    // Use cached spring solver with duration
    _spring = &(_springCache.at(key));
  }

  /**
   Returns the calculated duration from the spring.
   */
  double getDurationMs() override {
    if (_spring != nullptr) {
      return _spring->durationMs;
    }
    return 0;
  }

protected:
  double easing(double t) override {
    if (_spring != nullptr) {
      return _spring->solver(t);
    }
    return t;
  }

private:
  /**
   Calculates a key for the given configuration
   */
  static size_t getKeyFromConfig(const RNSkSpringConfig &config) {
    std::hash<std::string> hasher;
    return hasher(
        std::to_string(config.mass) + std::to_string(config.stiffness) +
        std::to_string(config.damping) + std::to_string(config.velocity));
  }

  /**
   Spring solver - calculates the spring duration and creates a solver function
   that will be cached and ready for reuse given the same configuration.
   */
  void solveSpring(size_t key, const RNSkSpringConfig &config) {

    double stiffness = config.stiffness;
    double mass = config.mass;
    double damping = config.damping;
    double initialVelocity = config.velocity;

    // Setup spring state
    RNSkSpringState state = {std::sqrt(stiffness / mass), 0, 0, 1, 0};

    state.zeta = damping / (2 * std::sqrt(stiffness * mass));
    state.wd =
        state.zeta < 1 ? state.w0 * std::sqrt(1 - state.zeta * state.zeta) : 0;
    state.a = 1;
    state.b = state.zeta < 1
                  ? (state.zeta * state.w0 + -initialVelocity) / state.wd
                  : -initialVelocity + state.w0;

    double durationMs = getDurationMs(state);
    std::function<double(double)> solver = [this, durationMs, state](double t) {
      return update(t, durationMs, state);
    };

    _springCache.try_emplace(key, durationMs, std::move(solver));
  }

  /**
   Calculates the estimated duration for the spring by running through the
   spring in time slots and seeing when the spring will rest.
   */
  double getDurationMs(const RNSkSpringState &state) {
    double frame = 1.0 / 6.0;
    double elapsed = 0.0;
    double rest = 0.0;
    while (true) {
      elapsed += frame;
      if (update(elapsed, -1.0, state) == 1.0) {
        rest++;
        if (rest >= 6.0) {
          break;
        }
      } else {
        rest = 0.0;
      }
    }
    double durationMs = elapsed * frame * 1000.0;
    return durationMs + 1000.0;
  }

  /**
   Returns the current position based on incoming time and previous state
   */
  double update(double t, double duration, const RNSkSpringState &state) {
    double progress = duration > -1.0 ? (duration * t) / 1000.0 : t;
    if (state.zeta < 1.0) {
      progress = std::exp(-progress * state.zeta * state.w0) *
                 (state.a * std::cos(state.wd * progress) +
                  state.b * std::sin(state.wd * progress));
    } else {
      progress =
          (state.a + state.b * progress) * std::exp(-progress * state.w0);
    }
    if (t == 0.0 || t == 1.0) {
      return t;
    }
    return 1.0 - progress;
  }

  CachedSpring *_spring;
};
} // namespace RNSkia
