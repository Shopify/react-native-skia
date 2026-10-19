#pragma once

#include <algorithm>
#include <atomic>
#include <cmath>
#include <cstdint>
#include <memory>
#include <mutex>
#include <optional>
#include <string>
#include <vector>

#include <jsi/jsi.h>

#include "include/core/SkPictureRecorder.h"

#include "ColorFilters.h"
#include "Command.h"
#include "Convertor.h"
#include "DrawingCtx.h"
#include "Drawings.h"
#include "ImageFilters.h"
#include "Paint.h"
#include "PathEffects.h"
#include "Shaders.h"

namespace RNSkia {

/**
 * The recording of a scene: the commands the JS thread records from the scene
 * graph, and the shared values that drive them (see Variables). A view takes
 * ownership of it and replays it on a render thread; the Reanimated mapper
 * reads the shared values into it meanwhile.
 */
class Recorder {
private:
  using CommandList = std::vector<std::unique_ptr<Command>>;

  static double nextId() {
    static std::atomic<uint64_t> counter{0};
    return static_cast<double>(++counter);
  }

  struct PendingGroup {
    GroupCommand *group;
    float zIndex;
    int order;
  };

  CommandList commands;
  std::vector<CommandList *> commandStack;

  // Once a view owns the recording, the Reanimated mapper reads the shared
  // values into pending writes (readUpdates, UI thread) and whoever replays
  // the commands writes them into the commands first (play, under this
  // lock). Nothing else holds this lock, so it never nests with a view's
  // lock.
  std::mutex _commandsMutex;

  // The pending writes, one slot per conversion function: a value read
  // several times between two replays is written once (the last read wins),
  // and the memory stays bounded whatever the ratio of updates to replays.
  // They are laid out on the first read, once the recording, and thus
  // `variables`, is complete.
  std::mutex _pendingMutex;
  std::vector<PendingWrite> _pendingWrites;
  // The first pending write of each shared value.
  std::vector<size_t> _slotBase;
  bool _hasPendingWrites = false;

  /** Under _pendingMutex. */
  void layoutPendingWritesLocked() {
    if (!_slotBase.empty()) {
      return;
    }
    size_t count = 0;
    _slotBase.reserve(variables.size());
    for (size_t slot = 0; slot < variables.size(); slot++) {
      _slotBase.push_back(count);
      count += variables.conversions(slot).size();
    }
    _pendingWrites.resize(count);
  }

  /** Writes the pending values into the commands. Under _commandsMutex. */
  void flushPendingWritesLocked() {
    std::lock_guard<std::mutex> lock(_pendingMutex);
    if (!_hasPendingWrites) {
      return;
    }
    for (auto &write : _pendingWrites) {
      if (write) {
        write();
        write = nullptr;
      }
    }
    _hasPendingWrites = false;
  }

  CommandList &currentCommands() { return *commandStack.back(); }

  void pushCommand(std::unique_ptr<Command> command) {
    currentCommands().push_back(std::move(command));
  }

  static float sanitizeZIndex(const GroupCommand *group) {
    if (!group || !group->zIndex.has_value()) {
      return 0.0f;
    }
    const auto value = group->zIndex.value();
    if (!std::isfinite(value)) {
      return 0.0f;
    }
    return value;
  }

  void flushPendingGroups(DrawingCtx *ctx,
                          std::vector<PendingGroup> &pendingGroups) {
    if (pendingGroups.empty()) {
      return;
    }
    std::sort(pendingGroups.begin(), pendingGroups.end(),
              [](const PendingGroup &a, const PendingGroup &b) {
                if (a.zIndex == b.zIndex) {
                  return a.order < b.order;
                }
                return a.zIndex < b.zIndex;
              });
    for (const auto &pending : pendingGroups) {
      playGroup(ctx, pending.group);
    }
    pendingGroups.clear();
  }

  void playGroup(DrawingCtx *ctx, GroupCommand *group) {
    if (group == nullptr) {
      return;
    }
    std::vector<PendingGroup> pending;
    for (const auto &child : group->children) {
      if (child->type == CommandType::Group) {
        auto *childGroup = static_cast<GroupCommand *>(child.get());
        pending.push_back({childGroup, sanitizeZIndex(childGroup),
                           static_cast<int>(pending.size())});
      } else {
        flushPendingGroups(ctx, pending);
        playCommand(ctx, child.get());
      }
    }
    flushPendingGroups(ctx, pending);
  }

  void playCommand(DrawingCtx *ctx, Command *cmd) {
    if (cmd->type == CommandType::Group) {
      playGroup(ctx, static_cast<GroupCommand *>(cmd));
      return;
    }
    if (!isDrawingCommand(cmd->type)) {
      cmd->play(ctx);
      return;
    }
    // A drawing is played once per paint declared on the node (its <Paint>
    // children), then with the node's own paint.
    auto paints = ctx->paintDeclarations;
    SkPaint paint(ctx->getPaint());
    paint.setAlphaf(paint.getAlphaf() * ctx->getOpacity());
    paints.push_back(paint);
    ctx->paintDeclarations.clear();
    for (auto &layerPaint : paints) {
      ctx->pushPaint(layerPaint);
      cmd->play(ctx);
      ctx->restorePaint();
    }
  }

public:
  Variables variables;

  // Unique per recording. The Reanimated mapper tags its updates with it so a
  // mapper that outlives its recording (stopMapper() is asynchronous) cannot
  // write into the recording that replaced it.
  const double id = nextId();

  Recorder() { commandStack.push_back(&commands); }

  void savePaint(jsi::Runtime &runtime, const jsi::Object &props,
                 bool standalone) {
    pushCommand(
        std::make_unique<SavePaintCmd>(runtime, props, variables, standalone));
  }

  void pushShader(jsi::Runtime &runtime, const std::string &nodeType,
                  const jsi::Object &props, int children) {
    if (nodeType == "skShader") {
      pushCommand(
          std::make_unique<PushShaderCmd>(runtime, props, variables, children));
    } else if (nodeType == "skImageShader") {
      pushCommand(
          std::make_unique<PushImageShaderCmd>(runtime, props, variables));
    } else if (nodeType == "skColorShader") {
      pushCommand(std::make_unique<ColorShaderCmd>(runtime, props, variables));
    } else if (nodeType == "skTurbulence") {
      pushCommand(std::make_unique<TurbulenceCmd>(runtime, props, variables));
    } else if (nodeType == "skFractalNoise") {
      pushCommand(std::make_unique<FractalNoiseCmd>(runtime, props, variables));
    } else if (nodeType == "skLinearGradient") {
      pushCommand(
          std::make_unique<LinearGradientCmd>(runtime, props, variables));
    } else if (nodeType == "skRadialGradient") {
      pushCommand(
          std::make_unique<RadialGradientCmd>(runtime, props, variables));
    } else if (nodeType == "skSweepGradient") {
      pushCommand(
          std::make_unique<SweepGradientCmd>(runtime, props, variables));
    } else if (nodeType == "skTwoPointConicalGradient") {
      pushCommand(std::make_unique<TwoPointConicalGradientCmd>(runtime, props,
                                                               variables));
    } else if (nodeType == "skBlend") {
      pushCommand(std::make_unique<BlendShaderCmd>(runtime, props, variables));
    } else {
      throw std::runtime_error("Invalid shader type: " + nodeType);
    }
  }

  void pushPathEffect(jsi::Runtime &runtime, const std::string &nodeType,
                      const jsi::Object &props) {
    if (nodeType == "skDiscretePathEffect") {
      pushCommand(
          std::make_unique<DiscretePathEffectCmd>(runtime, props, variables));
    } else if (nodeType == "skDashPathEffect") {
      pushCommand(
          std::make_unique<DashPathEffectCmd>(runtime, props, variables));
    } else if (nodeType == "skPath1DPathEffect") {
      pushCommand(
          std::make_unique<Path1DPathEffectCmd>(runtime, props, variables));
    } else if (nodeType == "skPath2DPathEffect") {
      pushCommand(
          std::make_unique<Path2DPathEffectCmd>(runtime, props, variables));
    } else if (nodeType == "skCornerPathEffect") {
      pushCommand(
          std::make_unique<CornerPathEffectCmd>(runtime, props, variables));
    } else if (nodeType == "skSumPathEffect") {
      pushCommand(
          std::make_unique<SumPathEffectCmd>(runtime, props, variables));
    } else if (nodeType == "skLine2DPathEffect") {
      pushCommand(
          std::make_unique<Line2DPathEffectCmd>(runtime, props, variables));
    } else {
      throw std::runtime_error("Invalid path effect type: " + nodeType);
    }
  }

  void pushColorFilter(jsi::Runtime &runtime, const std::string &nodeType,
                       const jsi::Object &props) {
    if (nodeType == "skMatrixColorFilter") {
      pushCommand(
          std::make_unique<MatrixColorFilterCmd>(runtime, props, variables));
    } else if (nodeType == "skBlendColorFilter") {
      pushCommand(
          std::make_unique<BlendColorFilterCmd>(runtime, props, variables));
    } else if (nodeType == "skLinearToSRGBGammaColorFilter") {
      pushCommand(std::make_unique<LinearToSRGBGammaColorFilterCmd>(
          runtime, props, variables));
    } else if (nodeType == "skSRGBToLinearGammaColorFilter") {
      pushCommand(std::make_unique<SRGBToLinearGammaColorFilterCmd>(
          runtime, props, variables));
    } else if (nodeType == "skLumaColorFilter") {
      pushCommand(
          std::make_unique<LumaColorFilterCmd>(runtime, props, variables));
    } else if (nodeType == "skLerpColorFilter") {
      pushCommand(
          std::make_unique<LerpColorFilterCmd>(runtime, props, variables));
    } else {
      throw std::runtime_error("Invalid color filter type: " + nodeType);
    }
  }

  void pushImageFilter(jsi::Runtime &runtime, const std::string &nodeType,
                       const jsi::Object &props) {
    if (nodeType == "skOffsetImageFilter") {
      pushCommand(
          std::make_unique<OffsetImageFilterCmd>(runtime, props, variables));
    } else if (nodeType == "skDisplacementMapImageFilter") {
      pushCommand(std::make_unique<DisplacementMapImageFilterCmd>(
          runtime, props, variables));
    } else if (nodeType == "skBlurImageFilter") {
      pushCommand(
          std::make_unique<BlurImageFilterCmd>(runtime, props, variables));
    } else if (nodeType == "skDropShadowImageFilter") {
      pushCommand(std::make_unique<DropShadowImageFilterCmd>(runtime, props,
                                                             variables));
    } else if (nodeType == "skMorphologyImageFilter") {
      pushCommand(std::make_unique<MorphologyImageFilterCmd>(runtime, props,
                                                             variables));
    } else if (nodeType == "skBlendImageFilter") {
      pushCommand(
          std::make_unique<BlendImageFilterCmd>(runtime, props, variables));
    } else if (nodeType == "skRuntimeShaderImageFilter") {
      pushCommand(std::make_unique<RuntimeShaderImageFilterCmd>(runtime, props,
                                                                variables));
    } else if (nodeType == "skImageFilter") {
      pushCommand(std::make_unique<ImageFilterCmd>(runtime, props, variables));
    } else {
      throw std::runtime_error("Invalid image filter type: " + nodeType);
    }
  }

  void composePathEffect() {
    pushCommand(std::make_unique<Command>(CommandType::ComposePathEffect));
  }

  void composeImageFilter() {
    pushCommand(std::make_unique<Command>(CommandType::ComposeImageFilter));
  }

  void composeColorFilter() {
    pushCommand(std::make_unique<Command>(CommandType::ComposeColorFilter));
  }

  void pushBlurMaskFilter(jsi::Runtime &runtime, const jsi::Object &props) {
    pushCommand(std::make_unique<BlurMaskFilterCmd>(runtime, props, variables));
  }

  void saveCTM(jsi::Runtime &runtime, const jsi::Object &props) {
    pushCommand(std::make_unique<SaveCTMCmd>(runtime, props, variables));
  }

  void restoreCTM() {
    pushCommand(std::make_unique<Command>(CommandType::RestoreCTM));
  }

  void restorePaint() {
    pushCommand(std::make_unique<Command>(CommandType::RestorePaint));
  }

  void drawRect(jsi::Runtime &runtime, const jsi::Object &props) {
    pushCommand(std::make_unique<RectCmd>(runtime, props, variables));
  }

  void drawCircle(jsi::Runtime &runtime, const jsi::Object &props) {
    pushCommand(std::make_unique<CircleCmd>(runtime, props, variables));
  }

  void drawLine(jsi::Runtime &runtime, const jsi::Object &props) {
    pushCommand(std::make_unique<LineCmd>(runtime, props, variables));
  }

  void drawTextPath(jsi::Runtime &runtime, const jsi::Object &props) {
    pushCommand(std::make_unique<TextPathCmd>(runtime, props, variables));
  }

  void drawText(jsi::Runtime &runtime, const jsi::Object &props) {
    pushCommand(std::make_unique<TextCmd>(runtime, props, variables));
  }

  void drawPath(jsi::Runtime &runtime, const jsi::Object &props) {
    pushCommand(std::make_unique<PathCmd>(runtime, props, variables));
  }

  void drawPaint() {
    pushCommand(std::make_unique<Command>(CommandType::DrawPaint));
  }

  void drawBox(jsi::Runtime &runtime, const jsi::Object &props,
               const jsi::Array &shadows) {
    pushCommand(std::make_unique<BoxCmd>(runtime, props, shadows, variables));
  }

  void drawImage(jsi::Runtime &runtime, const jsi::Object &props) {
    pushCommand(std::make_unique<ImageCmd>(runtime, props, variables));
  }

  void drawPoints(jsi::Runtime &runtime, const jsi::Object &props) {
    pushCommand(std::make_unique<PointsCmd>(runtime, props, variables));
  }

  void drawRRect(jsi::Runtime &runtime, const jsi::Object &props) {
    pushCommand(std::make_unique<RRectCmd>(runtime, props, variables));
  }

  void drawOval(jsi::Runtime &runtime, const jsi::Object &props) {
    pushCommand(std::make_unique<OvalCmd>(runtime, props, variables));
  }

  void drawPatch(jsi::Runtime &runtime, const jsi::Object &props) {
    pushCommand(std::make_unique<PatchCmd>(runtime, props, variables));
  }

  void drawVertices(jsi::Runtime &runtime, const jsi::Object &props) {
    pushCommand(std::make_unique<VerticesCmd>(runtime, props, variables));
  }

  void drawDiffRect(jsi::Runtime &runtime, const jsi::Object &props) {
    pushCommand(std::make_unique<DiffRectCmd>(runtime, props, variables));
  }

  void drawTextBlob(jsi::Runtime &runtime, const jsi::Object &props) {
    pushCommand(std::make_unique<TextBlobCmd>(runtime, props, variables));
  }

  void drawGlyphs(jsi::Runtime &runtime, const jsi::Object &props) {
    pushCommand(std::make_unique<GlyphsCmd>(runtime, props, variables));
  }

  void drawPicture(jsi::Runtime &runtime, const jsi::Object &props) {
    pushCommand(std::make_unique<PictureCmd>(runtime, props, variables));
  }

  void drawImageSVG(jsi::Runtime &runtime, const jsi::Object &props) {
    pushCommand(std::make_unique<ImageSVGCmd>(runtime, props, variables));
  }

  void drawParagraph(jsi::Runtime &runtime, const jsi::Object &props) {
    pushCommand(std::make_unique<ParagraphCmd>(runtime, props, variables));
  }

  void drawAtlas(jsi::Runtime &runtime, const jsi::Object &props) {
    pushCommand(std::make_unique<AtlasCmd>(runtime, props, variables));
  }

  void drawSkottie(jsi::Runtime &runtime, const jsi::Object &props) {
    pushCommand(std::make_unique<SkottieCmd>(runtime, props, variables));
  }

  void materializePaint() {
    pushCommand(std::make_unique<Command>(CommandType::MaterializePaint));
  }

  void restorePaintDeclaration() {
    pushCommand(
        std::make_unique<Command>(CommandType::RestorePaintDeclaration));
  }

  void saveLayer() {
    pushCommand(std::make_unique<Command>(CommandType::SaveLayer));
  }

  void saveBackdropFilter() {
    pushCommand(std::make_unique<Command>(CommandType::SaveBackdropFilter));
  }

  void saveGroup(jsi::Runtime &runtime,
                 const jsi::Value *propsValue = nullptr) {
    auto group = std::make_unique<GroupCommand>();
    if (propsValue != nullptr && propsValue->isObject()) {
      auto object = propsValue->asObject(runtime);
      convertProperty(runtime, object, "zIndex", group->zIndex, variables);
    }
    auto *children = &group->children;
    pushCommand(std::move(group));
    commandStack.push_back(children);
  }

  void restoreGroup() {
    if (commandStack.size() > 1) {
      commandStack.pop_back();
    }
  }

  /** Replays the commands, with the pending values written in first. */
  void play(DrawingCtx *ctx) {
    std::lock_guard<std::mutex> lock(_commandsMutex);
    flushPendingWritesLocked();
    for (const auto &cmd : commands) {
      playCommand(ctx, cmd.get());
    }
  }

  /**
   * Plays the recording into a picture. The cull rect is deliberately huge:
   * a recording is not tied to a view size.
   */
  sk_sp<SkPicture> makePicture() {
    SkPictureRecorder pictureRecorder;
    SkISize size = SkISize::Make(2'000'000, 2'000'000);
    SkRect rect = SkRect::Make(size);
    auto canvas = pictureRecorder.beginRecording(rect, nullptr);
    DrawingCtx ctx(canvas);
    play(&ctx);
    return pictureRecorder.finishRecordingAsPicture();
  }

  /**
   * Reads the current value of each shared value, in slot order (the order
   * of JsiRecorder.getSharedValues()), on the calling runtime into the
   * pending writes. The writes do not need the runtime: the next replay
   * (play, on whichever thread owns the commands) writes them into the
   * commands first, so the caller never waits for a replay.
   */
  void readUpdates(jsi::Runtime &runtime, const jsi::Array &values) {
    const auto count = std::min(values.size(runtime), variables.size());
    for (size_t slot = 0; slot < count; slot++) {
      auto sharedValue =
          values.getValueAtIndex(runtime, slot).asObject(runtime);
      const auto &conversions = variables.conversions(slot);
      for (size_t j = 0; j < conversions.size(); j++) {
        if (auto write = conversions[j](runtime, sharedValue)) {
          std::lock_guard<std::mutex> lock(_pendingMutex);
          layoutPendingWritesLocked();
          _pendingWrites[_slotBase[slot] + j] = std::move(write);
          _hasPendingWrites = true;
        }
      }
    }
  }
};

} // namespace RNSkia
