#pragma once

#include <algorithm>
#include <cmath>
#include <memory>
#include <optional>
#include <string>
#include <vector>

#include <jsi/jsi.h>

#include "ColorFilters.h"
#include "Command.h"
#include "Convertor.h"
#include "DrawingCtx.h"
#include "Drawings.h"
#include "ImageFilters.h"
#include "Paint.h"
#include "PathEffects.h"
#include "RNSkPlatformContext.h"
#include "Shaders.h"

namespace RNSkia {

class Recorder {
private:
  using CommandList = std::vector<std::unique_ptr<Command>>;

  struct PendingGroup {
    GroupCommand *group;
    float zIndex;
    int order;
  };

  CommandList commands;
  std::vector<CommandList *> commandStack;

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
        pending.push_back(
            {childGroup, sanitizeZIndex(childGroup), static_cast<int>(pending.size())});
      } else {
        flushPendingGroups(ctx, pending);
        playCommand(ctx, child.get());
      }
    }
    flushPendingGroups(ctx, pending);
  }

  void playCommand(DrawingCtx *ctx, Command *cmd);

public:
  std::shared_ptr<RNSkPlatformContext> _context;
  Variables variables;

  Recorder() {
    commandStack.push_back(&commands);
  }
  ~Recorder() {
    if (!_context || commands.empty()) {
      return;
    }

    auto context = _context;
    auto pendingCommands = std::make_shared<CommandList>(std::move(commands));

    context->runOnMainThread(
        [pendingCommands = std::move(pendingCommands)]() mutable {
          // Destroy the recorded commands on the main thread to ensure GPU
          // backed resources release safely.
          pendingCommands->clear();
        });
  }

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
      pushCommand(
          std::make_unique<ColorShaderCmd>(runtime, props, variables));
    } else if (nodeType == "skTurbulence") {
      pushCommand(
          std::make_unique<TurbulenceCmd>(runtime, props, variables));
    } else if (nodeType == "skFractalNoise") {
      pushCommand(
          std::make_unique<FractalNoiseCmd>(runtime, props, variables));
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
      pushCommand(std::make_unique<TwoPointConicalGradientCmd>(
          runtime, props, variables));
      // TODO: should receive skBlendShader here
    } else if (nodeType == "skBlend") {
      pushCommand(
          std::make_unique<BlendShaderCmd>(runtime, props, variables));
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
      pushCommand(std::make_unique<DropShadowImageFilterCmd>(
          runtime, props, variables));
    } else if (nodeType == "skMorphologyImageFilter") {
      pushCommand(std::make_unique<MorphologyImageFilterCmd>(
          runtime, props, variables));
    } else if (nodeType == "skBlendImageFilter") {
      pushCommand(
          std::make_unique<BlendImageFilterCmd>(runtime, props, variables));
    } else if (nodeType == "skRuntimeShaderImageFilter") {
      pushCommand(std::make_unique<RuntimeShaderImageFilterCmd>(
          runtime, props, variables));
    } else if (nodeType == "skImageFilter") {
      pushCommand(
          std::make_unique<ImageFilterCmd>(runtime, props, variables));
    }
  }

  void composePathEffect() {
    pushCommand(
        std::make_unique<Command>(CommandType::ComposePathEffect));
  }

  void composeImageFilter() {
    pushCommand(
        std::make_unique<Command>(CommandType::ComposeImageFilter));
  }

  void composeColorFilter() {
    pushCommand(
        std::make_unique<Command>(CommandType::ComposeColorFilter));
  }

  void pushBlurMaskFilter(jsi::Runtime &runtime, const jsi::Object &props) {
    pushCommand(
        std::make_unique<BlurMaskFilterCmd>(runtime, props, variables));
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
    pushCommand(
        std::make_unique<TextPathCmd>(runtime, props, variables));
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
    pushCommand(
        std::make_unique<BoxCmd>(runtime, props, shadows, variables));
  }

  void drawImage(jsi::Runtime &runtime, const jsi::Object &props) {
    pushCommand(
        std::make_unique<ImageCmd>(_context, runtime, props, variables));
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
    pushCommand(
        std::make_unique<VerticesCmd>(runtime, props, variables));
  }

  void drawDiffRect(jsi::Runtime &runtime, const jsi::Object &props) {
    pushCommand(
        std::make_unique<DiffRectCmd>(runtime, props, variables));
  }

  void drawTextBlob(jsi::Runtime &runtime, const jsi::Object &props) {
    pushCommand(
        std::make_unique<TextBlobCmd>(runtime, props, variables));
  }

  void drawGlyphs(jsi::Runtime &runtime, const jsi::Object &props) {
    pushCommand(std::make_unique<GlyphsCmd>(runtime, props, variables));
  }

  void drawPicture(jsi::Runtime &runtime, const jsi::Object &props) {
    pushCommand(
        std::make_unique<PictureCmd>(_context, runtime, props, variables));
  }

  void drawImageSVG(jsi::Runtime &runtime, const jsi::Object &props) {
    pushCommand(
        std::make_unique<ImageSVGCmd>(runtime, props, variables));
  }

  void drawParagraph(jsi::Runtime &runtime, const jsi::Object &props) {
    pushCommand(
        std::make_unique<ParagraphCmd>(runtime, props, variables));
  }

  void drawAtlas(jsi::Runtime &runtime, const jsi::Object &props) {
    pushCommand(
        std::make_unique<AtlasCmd>(_context, runtime, props, variables));
  }

  void drawSkottie(jsi::Runtime &runtime, const jsi::Object &props) {
    pushCommand(std::make_unique<SkottieCmd>(runtime, props, variables));
  }

  void materializePaint() {
    pushCommand(
        std::make_unique<Command>(CommandType::MaterializePaint));
  }

  void restorePaintDeclaration() {
    pushCommand(
        std::make_unique<Command>(CommandType::RestorePaintDeclaration));
  }

  void saveLayer() {
    pushCommand(std::make_unique<Command>(CommandType::SaveLayer));
  }

  void saveBackdropFilter() {
    pushCommand(
        std::make_unique<Command>(CommandType::SaveBackdropFilter));
  }

  void saveGroup(jsi::Runtime &runtime, const jsi::Value *propsValue = nullptr) {
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


  void play(DrawingCtx *ctx) {
    for (const auto &cmd : commands) {
      playCommand(ctx, cmd.get());
    }
  }

  // Returns the number of unique shared values (variables) recorded
  size_t getVariableCount() const {
    return variables.size();
  }

  // C++ visitor - traverses node tree directly without JS overhead
  // Returns an array of shared values found during traversal
  jsi::Array visit(jsi::Runtime &runtime, const jsi::Array &root) {
    // Collect shared values during visit
    std::vector<jsi::Object> sharedValues;

    size_t len = root.size(runtime);
    for (size_t i = 0; i < len; i++) {
      auto node = root.getValueAtIndex(runtime, i).asObject(runtime);
      visitNode(runtime, node, sharedValues);
    }

    // Return the collected shared values as a JSI array
    jsi::Array result(runtime, sharedValues.size());
    for (size_t i = 0; i < sharedValues.size(); i++) {
      result.setValueAtIndex(runtime, i, std::move(sharedValues[i]));
    }
    return result;
  }

private:
  // Helper to check if a value is a Reanimated shared value
  static bool isSharedValue(jsi::Runtime &runtime, const jsi::Value &value) {
    if (!value.isObject()) {
      return false;
    }
    auto obj = value.asObject(runtime);
    if (!obj.hasProperty(runtime, "_isReanimatedSharedValue")) {
      return false;
    }
    auto prop = obj.getProperty(runtime, "_isReanimatedSharedValue");
    return prop.isBool() && prop.asBool();
  }

  // Collect shared values from a props object and assign names to them
  void collectSharedValues(jsi::Runtime &runtime, const jsi::Object &props,
                           std::vector<jsi::Object> &sharedValues) {
    auto propertyNames = props.getPropertyNames(runtime);
    size_t propCount = propertyNames.size(runtime);

    for (size_t i = 0; i < propCount; i++) {
      auto propName = propertyNames.getValueAtIndex(runtime, i).asString(runtime);
      auto propValue = props.getProperty(runtime, propName);

      if (isSharedValue(runtime, propValue)) {
        auto sharedValue = propValue.asObject(runtime);

        // Check if this shared value already has a name assigned
        if (!sharedValue.hasProperty(runtime, "name") ||
            sharedValue.getProperty(runtime, "name").isUndefined()) {
          // Assign a new name based on current count
          std::string name = "variable" + std::to_string(sharedValues.size());
          sharedValue.setProperty(runtime, "name",
                                  jsi::String::createFromUtf8(runtime, name));
          sharedValues.push_back(std::move(sharedValue));
        } else {
          // Already named, check if we need to add it to our list
          auto existingName = sharedValue.getProperty(runtime, "name")
                                  .asString(runtime)
                                  .utf8(runtime);
          // Check if it starts with "variable" - if so, it's already tracked
          if (existingName.rfind("variable", 0) != 0) {
            // New shared value with non-standard name, assign proper name
            std::string name = "variable" + std::to_string(sharedValues.size());
            sharedValue.setProperty(runtime, "name",
                                    jsi::String::createFromUtf8(runtime, name));
            sharedValues.push_back(std::move(sharedValue));
          }
        }
      }
    }
  }

  // Node type classification helpers
  static bool isColorFilter(const std::string &type) {
    return type == "skBlendColorFilter" || type == "skMatrixColorFilter" ||
           type == "skLerpColorFilter" || type == "skLumaColorFilter" ||
           type == "skSRGBToLinearGammaColorFilter" ||
           type == "skLinearToSRGBGammaColorFilter";
  }

  static bool isPathEffect(const std::string &type) {
    return type == "skDiscretePathEffect" || type == "skDashPathEffect" ||
           type == "skPath1DPathEffect" || type == "skPath2DPathEffect" ||
           type == "skCornerPathEffect" || type == "skSumPathEffect" ||
           type == "skLine2DPathEffect";
  }

  static bool isImageFilterType(const std::string &type) {
    return type == "skImageFilter" || type == "skOffsetImageFilter" ||
           type == "skDisplacementMapImageFilter" ||
           type == "skBlurImageFilter" || type == "skDropShadowImageFilter" ||
           type == "skMorphologyImageFilter" || type == "skBlendImageFilter" ||
           type == "skRuntimeShaderImageFilter";
  }

  static bool isShader(const std::string &type) {
    return type == "skShader" || type == "skImageShader" ||
           type == "skColorShader" || type == "skTurbulence" ||
           type == "skFractalNoise" || type == "skLinearGradient" ||
           type == "skRadialGradient" || type == "skSweepGradient" ||
           type == "skTwoPointConicalGradient";
  }

  // Check if props object has any paint-related properties
  static bool hasPaintProps(jsi::Runtime &runtime, const jsi::Object &props) {
    return props.hasProperty(runtime, "opacity") ||
           props.hasProperty(runtime, "color") ||
           props.hasProperty(runtime, "strokeWidth") ||
           props.hasProperty(runtime, "blendMode") ||
           props.hasProperty(runtime, "style") ||
           props.hasProperty(runtime, "strokeJoin") ||
           props.hasProperty(runtime, "strokeCap") ||
           props.hasProperty(runtime, "strokeMiter") ||
           props.hasProperty(runtime, "antiAlias") ||
           props.hasProperty(runtime, "dither") ||
           props.hasProperty(runtime, "paint");
  }

  // Check if props object has any CTM-related properties
  static bool hasCTMProps(jsi::Runtime &runtime, const jsi::Object &props) {
    return props.hasProperty(runtime, "clip") ||
           props.hasProperty(runtime, "invertClip") ||
           props.hasProperty(runtime, "transform") ||
           props.hasProperty(runtime, "origin") ||
           props.hasProperty(runtime, "matrix") ||
           props.hasProperty(runtime, "layer");
  }

  // Sort children into categories
  struct SortedChildren {
    std::vector<jsi::Object> colorFilters;
    std::vector<jsi::Object> maskFilters;
    std::vector<jsi::Object> shaders;
    std::vector<jsi::Object> imageFilters;
    std::vector<jsi::Object> pathEffects;
    std::vector<jsi::Object> drawings;
    std::vector<jsi::Object> paints;
  };

  SortedChildren sortNodeChildren(jsi::Runtime &runtime,
                                  const jsi::Object &node) {
    SortedChildren result;

    if (!node.hasProperty(runtime, "children")) {
      return result;
    }

    auto children = node.getProperty(runtime, "children").asObject(runtime).asArray(runtime);
    size_t len = children.size(runtime);

    for (size_t i = 0; i < len; i++) {
      auto child = children.getValueAtIndex(runtime, i).asObject(runtime);
      auto type = child.getProperty(runtime, "type").asString(runtime).utf8(runtime);

      if (isColorFilter(type)) {
        result.colorFilters.push_back(std::move(child));
      } else if (type == "skBlurMaskFilter") {
        result.maskFilters.push_back(std::move(child));
      } else if (isPathEffect(type)) {
        result.pathEffects.push_back(std::move(child));
      } else if (isImageFilterType(type)) {
        result.imageFilters.push_back(std::move(child));
      } else if (isShader(type)) {
        result.shaders.push_back(std::move(child));
      } else if (type == "skPaint") {
        result.paints.push_back(std::move(child));
      } else if (type == "skBlend") {
        // Check first child to determine if it's an image filter blend or shader blend
        if (child.hasProperty(runtime, "children")) {
          auto blendChildren = child.getProperty(runtime, "children").asObject(runtime).asArray(runtime);
          if (blendChildren.size(runtime) > 0) {
            auto firstChild = blendChildren.getValueAtIndex(runtime, 0).asObject(runtime);
            auto firstChildType = firstChild.getProperty(runtime, "type").asString(runtime).utf8(runtime);
            if (isImageFilterType(firstChildType)) {
              // Mutate type to BlendImageFilter
              child.setProperty(runtime, "type", jsi::String::createFromUtf8(runtime, "skBlendImageFilter"));
              result.imageFilters.push_back(std::move(child));
            } else {
              result.shaders.push_back(std::move(child));
            }
          } else {
            result.shaders.push_back(std::move(child));
          }
        } else {
          result.shaders.push_back(std::move(child));
        }
      } else {
        result.drawings.push_back(std::move(child));
      }
    }

    return result;
  }

  void pushColorFilters(jsi::Runtime &runtime,
                        std::vector<jsi::Object> &colorFilters,
                        std::vector<jsi::Object> &sharedValues) {
    for (auto &colorFilter : colorFilters) {
      // Recurse on children first
      if (colorFilter.hasProperty(runtime, "children")) {
        auto children = colorFilter.getProperty(runtime, "children").asObject(runtime).asArray(runtime);
        size_t len = children.size(runtime);
        std::vector<jsi::Object> childFilters;
        for (size_t i = 0; i < len; i++) {
          childFilters.push_back(children.getValueAtIndex(runtime, i).asObject(runtime));
        }
        pushColorFilters(runtime, childFilters, sharedValues);
      }

      auto type = colorFilter.getProperty(runtime, "type").asString(runtime).utf8(runtime);
      auto props = colorFilter.getProperty(runtime, "props").asObject(runtime);
      collectSharedValues(runtime, props, sharedValues);
      pushColorFilter(runtime, type, props);

      // Check if composition needed
      bool hasChildren = colorFilter.hasProperty(runtime, "children") &&
                         colorFilter.getProperty(runtime, "children").asObject(runtime).asArray(runtime).size(runtime) > 0;
      bool needsComposition = type != "skLerpColorFilter" && hasChildren;
      if (needsComposition) {
        composeColorFilter();
      }
    }
  }

  void pushPathEffects(jsi::Runtime &runtime,
                       std::vector<jsi::Object> &pathEffects,
                       std::vector<jsi::Object> &sharedValues) {
    for (auto &pathEffect : pathEffects) {
      if (pathEffect.hasProperty(runtime, "children")) {
        auto children = pathEffect.getProperty(runtime, "children").asObject(runtime).asArray(runtime);
        size_t len = children.size(runtime);
        std::vector<jsi::Object> childEffects;
        for (size_t i = 0; i < len; i++) {
          childEffects.push_back(children.getValueAtIndex(runtime, i).asObject(runtime));
        }
        pushPathEffects(runtime, childEffects, sharedValues);
      }

      auto type = pathEffect.getProperty(runtime, "type").asString(runtime).utf8(runtime);
      auto props = pathEffect.getProperty(runtime, "props").asObject(runtime);
      collectSharedValues(runtime, props, sharedValues);
      pushPathEffect(runtime, type, props);

      bool hasChildren = pathEffect.hasProperty(runtime, "children") &&
                         pathEffect.getProperty(runtime, "children").asObject(runtime).asArray(runtime).size(runtime) > 0;
      bool needsComposition = type != "skSumPathEffect" && hasChildren;
      if (needsComposition) {
        composePathEffect();
      }
    }
  }

  void pushImageFilters(jsi::Runtime &runtime,
                        std::vector<jsi::Object> &imageFilters,
                        std::vector<jsi::Object> &sharedValues) {
    for (auto &imageFilter : imageFilters) {
      if (imageFilter.hasProperty(runtime, "children")) {
        auto children = imageFilter.getProperty(runtime, "children").asObject(runtime).asArray(runtime);
        size_t len = children.size(runtime);
        std::vector<jsi::Object> childFilters;
        for (size_t i = 0; i < len; i++) {
          childFilters.push_back(children.getValueAtIndex(runtime, i).asObject(runtime));
        }
        pushImageFilters(runtime, childFilters, sharedValues);
      }

      auto type = imageFilter.getProperty(runtime, "type").asString(runtime).utf8(runtime);
      auto props = imageFilter.getProperty(runtime, "props").asObject(runtime);
      collectSharedValues(runtime, props, sharedValues);

      if (isImageFilterType(type)) {
        pushImageFilter(runtime, type, props);
      } else if (isShader(type)) {
        pushShader(runtime, type, props, 0);
      }

      bool hasChildren = imageFilter.hasProperty(runtime, "children") &&
                         imageFilter.getProperty(runtime, "children").asObject(runtime).asArray(runtime).size(runtime) > 0;
      bool needsComposition = type != "skBlendImageFilter" && hasChildren;
      if (needsComposition) {
        composeImageFilter();
      }
    }
  }

  void pushShaders(jsi::Runtime &runtime, std::vector<jsi::Object> &shaders,
                   std::vector<jsi::Object> &sharedValues) {
    for (auto &shader : shaders) {
      size_t childrenLen = 0;
      if (shader.hasProperty(runtime, "children")) {
        auto children = shader.getProperty(runtime, "children").asObject(runtime).asArray(runtime);
        childrenLen = children.size(runtime);
        std::vector<jsi::Object> childShaders;
        for (size_t i = 0; i < childrenLen; i++) {
          childShaders.push_back(children.getValueAtIndex(runtime, i).asObject(runtime));
        }
        pushShaders(runtime, childShaders, sharedValues);
      }

      auto type = shader.getProperty(runtime, "type").asString(runtime).utf8(runtime);
      auto props = shader.getProperty(runtime, "props").asObject(runtime);
      collectSharedValues(runtime, props, sharedValues);
      pushShader(runtime, type, props, static_cast<int>(childrenLen));
    }
  }

  void pushMaskFilters(jsi::Runtime &runtime,
                       std::vector<jsi::Object> &maskFilters,
                       std::vector<jsi::Object> &sharedValues) {
    if (!maskFilters.empty()) {
      auto &last = maskFilters.back();
      auto props = last.getProperty(runtime, "props").asObject(runtime);
      collectSharedValues(runtime, props, sharedValues);
      pushBlurMaskFilter(runtime, props);
    }
  }

  void pushPaints(jsi::Runtime &runtime, std::vector<jsi::Object> &paints,
                  std::vector<jsi::Object> &sharedValues) {
    for (auto &paint : paints) {
      auto props = paint.getProperty(runtime, "props").asObject(runtime);
      collectSharedValues(runtime, props, sharedValues);
      savePaint(runtime, props, true);

      auto sorted = sortNodeChildren(runtime, paint);
      pushColorFilters(runtime, sorted.colorFilters, sharedValues);
      pushImageFilters(runtime, sorted.imageFilters, sharedValues);
      pushMaskFilters(runtime, sorted.maskFilters, sharedValues);
      pushShaders(runtime, sorted.shaders, sharedValues);
      pushPathEffects(runtime, sorted.pathEffects, sharedValues);

      restorePaintDeclaration();
    }
  }

  void visitNode(jsi::Runtime &runtime, jsi::Object &node,
                 std::vector<jsi::Object> &sharedValues) {
    auto type = node.getProperty(runtime, "type").asString(runtime).utf8(runtime);
    auto props = node.getProperty(runtime, "props").asObject(runtime);

    // Collect shared values from this node's props
    collectSharedValues(runtime, props, sharedValues);

    // Get stacking context props (zIndex)
    if (props.hasProperty(runtime, "zIndex")) {
      jsi::Value propsValue = jsi::Value(runtime, props);
      saveGroup(runtime, &propsValue);
    } else {
      saveGroup(runtime, nullptr);
    }

    // Sort children
    auto sorted = sortNodeChildren(runtime, node);

    // Check if we need to push paint
    bool shouldPushPaint = hasPaintProps(runtime, props) ||
                           !sorted.colorFilters.empty() ||
                           !sorted.maskFilters.empty() ||
                           !sorted.imageFilters.empty() ||
                           !sorted.pathEffects.empty() ||
                           !sorted.shaders.empty();

    if (shouldPushPaint) {
      savePaint(runtime, props, false);
      pushColorFilters(runtime, sorted.colorFilters, sharedValues);
      pushImageFilters(runtime, sorted.imageFilters, sharedValues);
      pushMaskFilters(runtime, sorted.maskFilters, sharedValues);
      pushShaders(runtime, sorted.shaders, sharedValues);
      pushPathEffects(runtime, sorted.pathEffects, sharedValues);

      if (type == "skBackdropFilter") {
        saveBackdropFilter();
      } else {
        materializePaint();
      }
    }

    // Push standalone paints
    pushPaints(runtime, sorted.paints, sharedValues);

    // Handle Layer
    if (type == "skLayer") {
      saveLayer();
    }

    // Handle CTM
    bool hasCTM = hasCTMProps(runtime, props);
    bool shouldRestore = hasCTM || type == "skLayer";
    if (hasCTM) {
      saveCTM(runtime, props);
    }

    // Draw based on node type
    if (type == "skBox") {
      // Collect box shadows
      jsi::Array shadows = jsi::Array(runtime, 0);
      if (node.hasProperty(runtime, "children")) {
        auto children = node.getProperty(runtime, "children").asObject(runtime).asArray(runtime);
        size_t len = children.size(runtime);
        std::vector<jsi::Value> shadowProps;
        for (size_t i = 0; i < len; i++) {
          auto child = children.getValueAtIndex(runtime, i).asObject(runtime);
          auto childType = child.getProperty(runtime, "type").asString(runtime).utf8(runtime);
          if (childType == "skBoxShadow") {
            shadowProps.push_back(child.getProperty(runtime, "props"));
          }
        }
        shadows = jsi::Array(runtime, shadowProps.size());
        for (size_t i = 0; i < shadowProps.size(); i++) {
          shadows.setValueAtIndex(runtime, i, std::move(shadowProps[i]));
        }
      }
      drawBox(runtime, props, shadows);
    } else if (type == "skFill") {
      drawPaint();
    } else if (type == "skImage") {
      drawImage(runtime, props);
    } else if (type == "skCircle") {
      drawCircle(runtime, props);
    } else if (type == "skPoints") {
      drawPoints(runtime, props);
    } else if (type == "skPath") {
      drawPath(runtime, props);
    } else if (type == "skRect") {
      drawRect(runtime, props);
    } else if (type == "skRRect") {
      drawRRect(runtime, props);
    } else if (type == "skOval") {
      drawOval(runtime, props);
    } else if (type == "skLine") {
      drawLine(runtime, props);
    } else if (type == "skPatch") {
      drawPatch(runtime, props);
    } else if (type == "skVertices") {
      drawVertices(runtime, props);
    } else if (type == "skDiffRect") {
      drawDiffRect(runtime, props);
    } else if (type == "skText") {
      drawText(runtime, props);
    } else if (type == "skTextPath") {
      drawTextPath(runtime, props);
    } else if (type == "skTextBlob") {
      drawTextBlob(runtime, props);
    } else if (type == "skGlyphs") {
      drawGlyphs(runtime, props);
    } else if (type == "skPicture") {
      drawPicture(runtime, props);
    } else if (type == "skImageSVG") {
      drawImageSVG(runtime, props);
    } else if (type == "skParagraph") {
      drawParagraph(runtime, props);
    } else if (type == "skSkottie") {
      drawSkottie(runtime, props);
    } else if (type == "skAtlas") {
      drawAtlas(runtime, props);
    }

    // Visit drawing children
    for (auto &drawing : sorted.drawings) {
      visitNode(runtime, drawing, sharedValues);
    }

    // Restore state
    if (shouldPushPaint) {
      restorePaint();
    }
    if (shouldRestore) {
      restoreCTM();
    }
    restoreGroup();
  }
};

inline void Recorder::playCommand(DrawingCtx *ctx, Command *cmd) {
  switch (cmd->type) {
  case CommandType::Group: {
    auto *group = static_cast<GroupCommand *>(cmd);
    playGroup(ctx, group);
    break;
  }
  case CommandType::ComposeColorFilter: {
    ctx->composeColorFilter();
    break;
  }
  case CommandType::ComposeImageFilter: {
    ctx->composeImageFilter();
    break;
  }
  case CommandType::ComposePathEffect: {
    ctx->composePathEffect();
    break;
  }
  case CommandType::RestorePaintDeclaration: {
    ctx->materializePaint();
    auto paint = ctx->restorePaint();
    ctx->paintDeclarations.push_back(paint);
    break;
  }
  case CommandType::SaveBackdropFilter: {
    ctx->saveBackdropFilter();
    break;
  }
  case CommandType::SaveLayer: {
    ctx->materializePaint();
    auto paint = ctx->paintDeclarations.back();
    ctx->paintDeclarations.pop_back();
    ctx->canvas->saveLayer(SkCanvas::SaveLayerRec(nullptr, &paint, nullptr, 0));
    break;
  }
  case CommandType::MaterializePaint: {
    ctx->materializePaint();
    break;
  }
  case CommandType::SavePaint: {
    auto *savePaintCmd = static_cast<SavePaintCmd *>(cmd);
    savePaintCmd->savePaint(ctx);
    break;
  }
  case CommandType::PushShader: {
    auto nodeType = cmd->nodeType;
    if (nodeType == "skShader") {
      auto *pushShaderCmd = static_cast<PushShaderCmd *>(cmd);
      pushShaderCmd->pushShader(ctx);
    } else if (nodeType == "skImageShader") {
      auto *pushImageShaderCmd = static_cast<PushImageShaderCmd *>(cmd);
      pushImageShaderCmd->pushShader(ctx);
    } else if (nodeType == "skColorShader") {
      auto *colorShaderCmd = static_cast<ColorShaderCmd *>(cmd);
      colorShaderCmd->pushShader(ctx);
    } else if (nodeType == "skTurbulence") {
      auto *turbulenceCmd = static_cast<TurbulenceCmd *>(cmd);
      turbulenceCmd->pushShader(ctx);
    } else if (nodeType == "skFractalNoise") {
      auto *fractalNoiseCmd = static_cast<FractalNoiseCmd *>(cmd);
      fractalNoiseCmd->pushShader(ctx);
    } else if (nodeType == "skLinearGradient") {
      auto *linearGradientCmd = static_cast<LinearGradientCmd *>(cmd);
      linearGradientCmd->pushShader(ctx);
    } else if (nodeType == "skRadialGradient") {
      auto *radialGradientCmd = static_cast<RadialGradientCmd *>(cmd);
      radialGradientCmd->pushShader(ctx);
    } else if (nodeType == "skSweepGradient") {
      auto *sweepGradientCmd = static_cast<SweepGradientCmd *>(cmd);
      sweepGradientCmd->pushShader(ctx);
    } else if (nodeType == "skTwoPointConicalGradient") {
      auto *twoPointConicalGradientCmd =
          static_cast<TwoPointConicalGradientCmd *>(cmd);
      twoPointConicalGradientCmd->pushShader(ctx);
    } else if (nodeType == "skBlendShader") {
      auto *blendShaderCmd = static_cast<BlendShaderCmd *>(cmd);
      blendShaderCmd->pushShader(ctx);
    } else {
      throw std::runtime_error("Invalid shader type: " + nodeType);
    }
    break;
  }
  case CommandType::PushImageFilter: {
    auto nodeType = cmd->nodeType;
    if (nodeType == "skOffsetImageFilter") {
      auto *offsetCmd = static_cast<OffsetImageFilterCmd *>(cmd);
      offsetCmd->pushImageFilter(ctx);
    } else if (nodeType == "skDisplacementMapImageFilter") {
      auto *displacementCmd =
          static_cast<DisplacementMapImageFilterCmd *>(cmd);
      displacementCmd->pushImageFilter(ctx);
    } else if (nodeType == "skBlurImageFilter") {
      auto *blurCmd = static_cast<BlurImageFilterCmd *>(cmd);
      blurCmd->pushImageFilter(ctx);
    } else if (nodeType == "skDropShadowImageFilter") {
      auto *dropShadowCmd = static_cast<DropShadowImageFilterCmd *>(cmd);
      dropShadowCmd->pushImageFilter(ctx);
    } else if (nodeType == "skMorphologyImageFilter") {
      auto *morphologyCmd = static_cast<MorphologyImageFilterCmd *>(cmd);
      morphologyCmd->pushImageFilter(ctx);
    } else if (nodeType == "skBlendImageFilter") {
      auto *blendCmd = static_cast<BlendImageFilterCmd *>(cmd);
      blendCmd->pushImageFilter(ctx);
    } else if (nodeType == "skRuntimeShaderImageFilter") {
      auto *runtimeShaderCmd =
          static_cast<RuntimeShaderImageFilterCmd *>(cmd);
      runtimeShaderCmd->pushImageFilter(ctx);
    } else if (nodeType == "skImageFilter") {
      auto *imageFilterCmd = static_cast<ImageFilterCmd *>(cmd);
      imageFilterCmd->pushImageFilter(ctx);
    } else {
      throw std::runtime_error("Invalid image filter type: " + nodeType);
    }
    break;
  }
  case CommandType::PushPathEffect: {
    auto nodeType = cmd->nodeType;
    if (nodeType == "skDiscretePathEffect") {
      auto *discreteCmd = static_cast<DiscretePathEffectCmd *>(cmd);
      discreteCmd->pushPathEffect(ctx);
    } else if (nodeType == "skDashPathEffect") {
      auto *dashCmd = static_cast<DashPathEffectCmd *>(cmd);
      dashCmd->pushPathEffect(ctx);
    } else if (nodeType == "skPath1DPathEffect") {
      auto *path1DCmd = static_cast<Path1DPathEffectCmd *>(cmd);
      path1DCmd->pushPathEffect(ctx);
    } else if (nodeType == "skPath2DPathEffect") {
      auto *path2DCmd = static_cast<Path2DPathEffectCmd *>(cmd);
      path2DCmd->pushPathEffect(ctx);
    } else if (nodeType == "skCornerPathEffect") {
      auto *cornerCmd = static_cast<CornerPathEffectCmd *>(cmd);
      cornerCmd->pushPathEffect(ctx);
    } else if (nodeType == "skSumPathEffect") {
      auto *sumCmd = static_cast<SumPathEffectCmd *>(cmd);
      sumCmd->pushPathEffect(ctx);
    } else if (nodeType == "skLine2DPathEffect") {
      auto *line2DCmd = static_cast<Line2DPathEffectCmd *>(cmd);
      line2DCmd->pushPathEffect(ctx);
    } else {
      throw std::runtime_error("Invalid path effect type: " + nodeType);
    }
    break;
  }
  case CommandType::PushColorFilter: {
    auto nodeType = cmd->nodeType;
    if (nodeType == "skMatrixColorFilter") {
      auto *matrixCmd = static_cast<MatrixColorFilterCmd *>(cmd);
      matrixCmd->pushColorFilter(ctx);
    } else if (nodeType == "skBlendColorFilter") {
      auto *blendCmd = static_cast<BlendColorFilterCmd *>(cmd);
      blendCmd->pushColorFilter(ctx);
    } else if (nodeType == "skLinearToSRGBGammaColorFilter") {
      auto *linearToSRGBCmd =
          static_cast<LinearToSRGBGammaColorFilterCmd *>(cmd);
      linearToSRGBCmd->pushColorFilter(ctx);
    } else if (nodeType == "skSRGBToLinearGammaColorFilter") {
      auto *srgbToLinearCmd =
          static_cast<SRGBToLinearGammaColorFilterCmd *>(cmd);
      srgbToLinearCmd->pushColorFilter(ctx);
    } else if (nodeType == "skLumaColorFilter") {
      auto *lumaCmd = static_cast<LumaColorFilterCmd *>(cmd);
      lumaCmd->pushColorFilter(ctx);
    } else if (nodeType == "skLerpColorFilter") {
      auto *lerpCmd = static_cast<LerpColorFilterCmd *>(cmd);
      lerpCmd->pushColorFilter(ctx);
    } else {
      throw std::runtime_error("Invalid color filter type: " + nodeType);
    }
    break;
  }
  case CommandType::PushBlurMaskFilter: {
    auto *blurMaskFilterCmd = static_cast<BlurMaskFilterCmd *>(cmd);
    blurMaskFilterCmd->pushMaskFilter(ctx);
    break;
  }
  case CommandType::RestorePaint: {
    ctx->restorePaint();
    break;
  }
  case CommandType::SaveCTM: {
    auto *saveCTMCmd = static_cast<SaveCTMCmd *>(cmd);
    saveCTMCmd->saveCTM(ctx);
    break;
  }
  case CommandType::RestoreCTM: {
    ctx->canvas->restore();
    break;
  }
  default: {
    auto currentPaints = ctx->paintDeclarations;
    SkPaint paint(ctx->getPaint());
    paint.setAlphaf(paint.getAlphaf() * ctx->getOpacity());
    currentPaints.push_back(paint);
    ctx->paintDeclarations.clear();

    for (auto &layerPaint : currentPaints) {
      ctx->pushPaint(layerPaint);

      switch (cmd->type) {
      case CommandType::DrawPaint:
        ctx->canvas->drawPaint(layerPaint);
        break;
      case CommandType::DrawCircle: {
        auto *circleCmd = static_cast<CircleCmd *>(cmd);
        circleCmd->draw(ctx);
        break;
      }
      case CommandType::DrawPath: {
        auto *pathCmd = static_cast<PathCmd *>(cmd);
        pathCmd->draw(ctx);
        break;
      }
      case CommandType::DrawRect: {
        auto *rectCmd = static_cast<RectCmd *>(cmd);
        rectCmd->draw(ctx);
        break;
      }
      case CommandType::DrawLine: {
        auto *lineCmd = static_cast<LineCmd *>(cmd);
        lineCmd->draw(ctx);
        break;
      }
      case CommandType::DrawTextPath: {
        auto *textPathCmd = static_cast<TextPathCmd *>(cmd);
        textPathCmd->draw(ctx);
        break;
      }
      case CommandType::DrawText: {
        auto *textCmd = static_cast<TextCmd *>(cmd);
        textCmd->draw(ctx);
        break;
      }
      case CommandType::DrawBox: {
        auto *boxCmd = static_cast<BoxCmd *>(cmd);
        boxCmd->draw(ctx);
        break;
      }
      case CommandType::DrawImage: {
        auto *imageCmd = static_cast<ImageCmd *>(cmd);
        imageCmd->draw(ctx);
        break;
      }
      case CommandType::DrawPoints: {
        auto *pointsCmd = static_cast<PointsCmd *>(cmd);
        pointsCmd->draw(ctx);
        break;
      }
      case CommandType::DrawRRect: {
        auto *rRectCmd = static_cast<RRectCmd *>(cmd);
        rRectCmd->draw(ctx);
        break;
      }
      case CommandType::DrawOval: {
        auto *ovalCmd = static_cast<OvalCmd *>(cmd);
        ovalCmd->draw(ctx);
        break;
      }
      case CommandType::DrawPatch: {
        auto *patchCmd = static_cast<PatchCmd *>(cmd);
        patchCmd->draw(ctx);
        break;
      }
      case CommandType::DrawVertices: {
        auto *verticesCmd = static_cast<VerticesCmd *>(cmd);
        verticesCmd->draw(ctx);
        break;
      }
      case CommandType::DrawDiffRect: {
        auto *diffRectCmd = static_cast<DiffRectCmd *>(cmd);
        diffRectCmd->draw(ctx);
        break;
      }
      case CommandType::DrawTextBlob: {
        auto *textBlobCmd = static_cast<TextBlobCmd *>(cmd);
        textBlobCmd->draw(ctx);
        break;
      }
      case CommandType::DrawGlyphs: {
        auto *glyphsCmd = static_cast<GlyphsCmd *>(cmd);
        glyphsCmd->draw(ctx);
        break;
      }
      case CommandType::DrawPicture: {
        auto *pictureCmd = static_cast<PictureCmd *>(cmd);
        pictureCmd->draw(ctx);
        break;
      }
      case CommandType::DrawImageSVG: {
        auto *imageSVGCmd = static_cast<ImageSVGCmd *>(cmd);
        imageSVGCmd->draw(ctx);
        break;
      }
      case CommandType::DrawParagraph: {
        auto *paragraphCmd = static_cast<ParagraphCmd *>(cmd);
        paragraphCmd->draw(ctx);
        break;
      }
      case CommandType::DrawAtlas: {
        auto *atlasCmd = static_cast<AtlasCmd *>(cmd);
        atlasCmd->draw(ctx);
        break;
      }
      case CommandType::DrawSkottie: {
        auto *skottieCmd = static_cast<SkottieCmd *>(cmd);
        skottieCmd->draw(ctx);
        break;
      }
      default:
        break;
      }

      ctx->restorePaint();
    }
    break;
  }
  }
}

} // namespace RNSkia
