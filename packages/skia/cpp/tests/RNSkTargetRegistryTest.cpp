#include <memory>
#include <utility>

#include <gtest/gtest.h>

#include "RNSkTargetRegistry.h"

namespace RNSkia {
namespace {

struct Context {};

struct Target {
  explicit Target(std::shared_ptr<Context> context)
      : context(std::move(context)) {}
  std::shared_ptr<Context> context;
};

class RNSkTargetRegistryTest : public ::testing::Test {
protected:
  RNSkTargetRegistry<Target, Context> registry;
  std::shared_ptr<Context> context = std::make_shared<Context>();
};

TEST_F(RNSkTargetRegistryTest, BindsTheTargetMadeForAContext) {
  auto target = registry.getOrCreate(1, context);
  EXPECT_EQ(registry.bind(1, context), target);
}

TEST_F(RNSkTargetRegistryTest, GivesAContextTheTargetOfABoundView) {
  auto target = registry.bind(1, context);
  EXPECT_EQ(registry.getOrCreate(1, context), target);
}

TEST_F(RNSkTargetRegistryTest, KeepsTheTargetOfAnUnboundIdNothingElseHolds) {
  std::weak_ptr<Target> target = registry.getOrCreate(1, context);
  EXPECT_FALSE(target.expired());
  EXPECT_EQ(registry.bind(1, context), target.lock());
}

TEST_F(RNSkTargetRegistryTest, KeepsTheTargetsOfOtherIdsApart) {
  auto first = registry.getOrCreate(1, context);
  auto second = registry.getOrCreate(2, context);
  EXPECT_NE(first, second);
  EXPECT_EQ(registry.bind(2, context), second);
}

TEST_F(RNSkTargetRegistryTest, ReleasesTheTargetOfARemovedView) {
  std::weak_ptr<Target> target = registry.bind(1, context);
  registry.remove(1);
  EXPECT_TRUE(target.expired());
}

TEST_F(RNSkTargetRegistryTest, LeavesABoundTargetToItsViewWhenJsRetiresIt) {
  auto target = registry.bind(1, context);
  registry.removeIfUnbound(1);
  EXPECT_EQ(registry.getOrCreate(1, context), target);
}

TEST_F(RNSkTargetRegistryTest, ReleasesARetiredTargetNothingHolds) {
  std::weak_ptr<Target> target = registry.getOrCreate(1, context);
  registry.removeIfUnbound(1);
  EXPECT_TRUE(target.expired());
}

// StrictMode's simulated unmount retires the id before its view may exist,
// while the caller keeps the context it made on the first effect run.
TEST_F(RNSkTargetRegistryTest, BindsARetiredTargetAContextStillHolds) {
  auto held = registry.getOrCreate(1, context);
  registry.removeIfUnbound(1);
  EXPECT_EQ(registry.bind(1, context), held);
}

TEST_F(RNSkTargetRegistryTest, GivesAContextARetiredTargetAContextStillHolds) {
  auto held = registry.getOrCreate(1, context);
  registry.removeIfUnbound(1);
  EXPECT_EQ(registry.getOrCreate(1, context), held);
}

TEST_F(RNSkTargetRegistryTest, MakesANewTargetOnceARetiredOneIsReleased) {
  std::weak_ptr<Target> released;
  {
    auto held = registry.getOrCreate(1, context);
    released = held;
    registry.removeIfUnbound(1);
  }
  EXPECT_TRUE(released.expired());
  EXPECT_NE(registry.bind(1, context), nullptr);
}

TEST_F(RNSkTargetRegistryTest, KeepsARetiredTargetOnlyWhileItIsHeld) {
  auto held = registry.getOrCreate(1, context);
  registry.removeIfUnbound(1);
  std::weak_ptr<Target> target = held;
  held.reset();
  EXPECT_TRUE(target.expired());
}

TEST_F(RNSkTargetRegistryTest, ReleasesEveryTargetOnClear) {
  std::weak_ptr<Target> bound = registry.bind(1, context);
  std::weak_ptr<Target> unbound = registry.getOrCreate(2, context);
  registry.clear();
  EXPECT_TRUE(bound.expired());
  EXPECT_TRUE(unbound.expired());
}

} // namespace
} // namespace RNSkia
