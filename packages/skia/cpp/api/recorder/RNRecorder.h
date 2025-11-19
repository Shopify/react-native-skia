#pragma once

#include <algorithm>
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
  std::vector<std::unique_ptr<Command>> commands;

public:
  std::shared_ptr<RNSkPlatformContext> _context;
  Variables variables;

  Recorder() = default;
  ~Recorder() {
    if (!_context || commands.empty()) {
      return;
    }

    auto context = _context;
    using CommandList = std::vector<std::unique_ptr<Command>>;
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
    commands.push_back(
        std::make_unique<SavePaintCmd>(runtime, props, variables, standalone));
  }

  void pushShader(jsi::Runtime &runtime, const std::string &nodeType,
                  const jsi::Object &props, int children) {
    if (nodeType == "skShader") {
      commands.push_back(
          std::make_unique<PushShaderCmd>(runtime, props, variables, children));
    } else if (nodeType == "skImageShader") {
      commands.push_back(
          std::make_unique<PushImageShaderCmd>(runtime, props, variables));
    } else if (nodeType == "skColorShader") {
      commands.push_back(
          std::make_unique<ColorShaderCmd>(runtime, props, variables));
    } else if (nodeType == "skTurbulence") {
      commands.push_back(
          std::make_unique<TurbulenceCmd>(runtime, props, variables));
    } else if (nodeType == "skFractalNoise") {
      commands.push_back(
          std::make_unique<FractalNoiseCmd>(runtime, props, variables));
    } else if (nodeType == "skLinearGradient") {
      commands.push_back(
          std::make_unique<LinearGradientCmd>(runtime, props, variables));
    } else if (nodeType == "skRadialGradient") {
      commands.push_back(
          std::make_unique<RadialGradientCmd>(runtime, props, variables));
    } else if (nodeType == "skSweepGradient") {
      commands.push_back(
          std::make_unique<SweepGradientCmd>(runtime, props, variables));
    } else if (nodeType == "skTwoPointConicalGradient") {
      commands.push_back(std::make_unique<TwoPointConicalGradientCmd>(
          runtime, props, variables));
      // TODO: should receive skBlendShader here
    } else if (nodeType == "skBlend") {
      commands.push_back(
          std::make_unique<BlendShaderCmd>(runtime, props, variables));
    }
  }

  void pushPathEffect(jsi::Runtime &runtime, const std::string &nodeType,
                      const jsi::Object &props) {
    if (nodeType == "skDiscretePathEffect") {
      commands.push_back(
          std::make_unique<DiscretePathEffectCmd>(runtime, props, variables));
    } else if (nodeType == "skDashPathEffect") {
      commands.push_back(
          std::make_unique<DashPathEffectCmd>(runtime, props, variables));
    } else if (nodeType == "skPath1DPathEffect") {
      commands.push_back(
          std::make_unique<Path1DPathEffectCmd>(runtime, props, variables));
    } else if (nodeType == "skPath2DPathEffect") {
      commands.push_back(
          std::make_unique<Path2DPathEffectCmd>(runtime, props, variables));
    } else if (nodeType == "skCornerPathEffect") {
      commands.push_back(
          std::make_unique<CornerPathEffectCmd>(runtime, props, variables));
    } else if (nodeType == "skSumPathEffect") {
      commands.push_back(
          std::make_unique<SumPathEffectCmd>(runtime, props, variables));
    } else if (nodeType == "skLine2DPathEffect") {
      commands.push_back(
          std::make_unique<Line2DPathEffectCmd>(runtime, props, variables));
    }
  }

  void pushColorFilter(jsi::Runtime &runtime, const std::string &nodeType,
                       const jsi::Object &props) {
    if (nodeType == "skMatrixColorFilter") {
      commands.push_back(
          std::make_unique<MatrixColorFilterCmd>(runtime, props, variables));
    } else if (nodeType == "skBlendColorFilter") {
      commands.push_back(
          std::make_unique<BlendColorFilterCmd>(runtime, props, variables));
    } else if (nodeType == "skLinearToSRGBGammaColorFilter") {
      commands.push_back(std::make_unique<LinearToSRGBGammaColorFilterCmd>(
          runtime, props, variables));
    } else if (nodeType == "skSRGBToLinearGammaColorFilter") {
      commands.push_back(std::make_unique<SRGBToLinearGammaColorFilterCmd>(
          runtime, props, variables));
    } else if (nodeType == "skLumaColorFilter") {
      commands.push_back(
          std::make_unique<LumaColorFilterCmd>(runtime, props, variables));
    } else if (nodeType == "skLerpColorFilter") {
      commands.push_back(
          std::make_unique<LerpColorFilterCmd>(runtime, props, variables));
    }
  }

  void pushImageFilter(jsi::Runtime &runtime, const std::string &nodeType,
                       const jsi::Object &props) {
    if (nodeType == "skOffsetImageFilter") {
      commands.push_back(
          std::make_unique<OffsetImageFilterCmd>(runtime, props, variables));
    } else if (nodeType == "skDisplacementMapImageFilter") {
      commands.push_back(std::make_unique<DisplacementMapImageFilterCmd>(
          runtime, props, variables));
    } else if (nodeType == "skBlurImageFilter") {
      commands.push_back(
          std::make_unique<BlurImageFilterCmd>(runtime, props, variables));
    } else if (nodeType == "skDropShadowImageFilter") {
      commands.push_back(std::make_unique<DropShadowImageFilterCmd>(
          runtime, props, variables));
    } else if (nodeType == "skMorphologyImageFilter") {
      commands.push_back(std::make_unique<MorphologyImageFilterCmd>(
          runtime, props, variables));
    } else if (nodeType == "skBlendImageFilter") {
      commands.push_back(
          std::make_unique<BlendImageFilterCmd>(runtime, props, variables));
    } else if (nodeType == "skRuntimeShaderImageFilter") {
      commands.push_back(std::make_unique<RuntimeShaderImageFilterCmd>(
          runtime, props, variables));
    } else if (nodeType == "skImageFilter") {
      commands.push_back(
          std::make_unique<ImageFilterCmd>(runtime, props, variables));
    }
  }

  void composePathEffect() {
    commands.push_back(
        std::make_unique<Command>(CommandType::ComposePathEffect));
  }

  void composeImageFilter() {
    commands.push_back(
        std::make_unique<Command>(CommandType::ComposeImageFilter));
  }

  void composeColorFilter() {
    commands.push_back(
        std::make_unique<Command>(CommandType::ComposeColorFilter));
  }

  void pushBlurMaskFilter(jsi::Runtime &runtime, const jsi::Object &props) {
    commands.push_back(
        std::make_unique<BlurMaskFilterCmd>(runtime, props, variables));
  }

  void saveCTM(jsi::Runtime &runtime, const jsi::Object &props) {
    commands.push_back(std::make_unique<SaveCTMCmd>(runtime, props, variables));
  }

  void restoreCTM() {
    commands.push_back(std::make_unique<Command>(CommandType::RestoreCTM));
  }

  void restorePaint() {
    commands.push_back(std::make_unique<Command>(CommandType::RestorePaint));
  }

  void drawRect(jsi::Runtime &runtime, const jsi::Object &props) {
    commands.push_back(std::make_unique<RectCmd>(runtime, props, variables));
  }

  void drawCircle(jsi::Runtime &runtime, const jsi::Object &props) {
    commands.push_back(std::make_unique<CircleCmd>(runtime, props, variables));
  }

  void drawLine(jsi::Runtime &runtime, const jsi::Object &props) {
    commands.push_back(std::make_unique<LineCmd>(runtime, props, variables));
  }

  void drawTextPath(jsi::Runtime &runtime, const jsi::Object &props) {
    commands.push_back(
        std::make_unique<TextPathCmd>(runtime, props, variables));
  }

  void drawText(jsi::Runtime &runtime, const jsi::Object &props) {
    commands.push_back(std::make_unique<TextCmd>(runtime, props, variables));
  }

  void drawPath(jsi::Runtime &runtime, const jsi::Object &props) {
    commands.push_back(std::make_unique<PathCmd>(runtime, props, variables));
  }

  void drawPaint() {
    commands.push_back(std::make_unique<Command>(CommandType::DrawPaint));
  }

  void drawBox(jsi::Runtime &runtime, const jsi::Object &props,
               const jsi::Array &shadows) {
    commands.push_back(
        std::make_unique<BoxCmd>(runtime, props, shadows, variables));
  }

  void drawImage(jsi::Runtime &runtime, const jsi::Object &props) {
    commands.push_back(
        std::make_unique<ImageCmd>(_context, runtime, props, variables));
  }

  void drawPoints(jsi::Runtime &runtime, const jsi::Object &props) {
    commands.push_back(std::make_unique<PointsCmd>(runtime, props, variables));
  }

  void drawRRect(jsi::Runtime &runtime, const jsi::Object &props) {
    commands.push_back(std::make_unique<RRectCmd>(runtime, props, variables));
  }

  void drawOval(jsi::Runtime &runtime, const jsi::Object &props) {
    commands.push_back(std::make_unique<OvalCmd>(runtime, props, variables));
  }

  void drawPatch(jsi::Runtime &runtime, const jsi::Object &props) {
    commands.push_back(std::make_unique<PatchCmd>(runtime, props, variables));
  }

  void drawVertices(jsi::Runtime &runtime, const jsi::Object &props) {
    commands.push_back(
        std::make_unique<VerticesCmd>(runtime, props, variables));
  }

  void drawDiffRect(jsi::Runtime &runtime, const jsi::Object &props) {
    commands.push_back(
        std::make_unique<DiffRectCmd>(runtime, props, variables));
  }

  void drawTextBlob(jsi::Runtime &runtime, const jsi::Object &props) {
    commands.push_back(
        std::make_unique<TextBlobCmd>(runtime, props, variables));
  }

  void drawGlyphs(jsi::Runtime &runtime, const jsi::Object &props) {
    commands.push_back(std::make_unique<GlyphsCmd>(runtime, props, variables));
  }

  void drawPicture(jsi::Runtime &runtime, const jsi::Object &props) {
    commands.push_back(
        std::make_unique<PictureCmd>(_context, runtime, props, variables));
  }

  void drawImageSVG(jsi::Runtime &runtime, const jsi::Object &props) {
    commands.push_back(
        std::make_unique<ImageSVGCmd>(runtime, props, variables));
  }

  void drawParagraph(jsi::Runtime &runtime, const jsi::Object &props) {
    commands.push_back(
        std::make_unique<ParagraphCmd>(runtime, props, variables));
  }

  void drawAtlas(jsi::Runtime &runtime, const jsi::Object &props) {
    commands.push_back(
        std::make_unique<AtlasCmd>(_context, runtime, props, variables));
  }

  void drawSkottie(jsi::Runtime &runtime, const jsi::Object &props) {
    commands.push_back(std::make_unique<SkottieCmd>(runtime, props, variables));
  }

  void materializePaint() {
    commands.push_back(
        std::make_unique<Command>(CommandType::MaterializePaint));
  }

  void restorePaintDeclaration() {
    commands.push_back(
        std::make_unique<Command>(CommandType::RestorePaintDeclaration));
  }

  void saveLayer() {
    commands.push_back(std::make_unique<Command>(CommandType::SaveLayer));
  }

  void saveBackdropFilter() {
    commands.push_back(
        std::make_unique<Command>(CommandType::SaveBackdropFilter));
  }

  void saveGroup(jsi::Runtime &runtime, const jsi::Object &props) {
    commands.push_back(std::make_unique<GroupCmd>(runtime, props, variables));
  }

  void restoreGroup() {
    commands.push_back(std::make_unique<Command>(CommandType::RestoreGroup));
  }

  void executeCommand(Command *cmd, DrawingCtx *ctx) {
    switch (cmd->type) {
    case CommandType::Group:
    case CommandType::RestoreGroup:
      // Handled by play()
      break;

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
      ctx->canvas->saveLayer(
          SkCanvas::SaveLayerRec(nullptr, &paint, nullptr, 0));
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
      // Handle all drawing commands
      auto currentPaints = ctx->paintDeclarations;
      // apply alpha to the current paint.
      SkPaint paint(ctx->getPaint());
      paint.setAlphaf(paint.getAlphaf() * ctx->getOpacity());
      currentPaints.push_back(paint);
      ctx->paintDeclarations.clear();

      for (auto &paint : currentPaints) {
        ctx->pushPaint(paint);

        switch (cmd->type) {
        case CommandType::DrawPaint: {
          ctx->canvas->drawPaint(paint);
          break;
        }
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
          // Context commands (Group, SavePaint, RestorePaint, etc.) are not
          // handled here
          break;
        }

        ctx->restorePaint();
      }
      break;
    }
    }
  }

  void play(DrawingCtx *ctx) {
    struct Node {
      Command *cmd;
      std::vector<std::shared_ptr<Node>> children;
      int zIndex = 0;
      Node(Command *c) : cmd(c) {
        if (c && c->zIndex.has_value()) {
          zIndex = c->zIndex.value();
        }
      }
    };

    auto root = std::make_shared<Node>(nullptr);
    std::vector<std::shared_ptr<Node>> stack;
    stack.push_back(root);

    for (const auto &cmd : commands) {
      if (cmd->type == CommandType::Group) {
        auto node = std::make_shared<Node>(cmd.get());
        stack.back()->children.push_back(node);
        stack.push_back(node);
      } else if (cmd->type == CommandType::RestoreGroup) {
        if (stack.size() > 1) {
          stack.pop_back();
        }
      } else {
        auto node = std::make_shared<Node>(cmd.get());
        stack.back()->children.push_back(node);
      }
    }

    std::function<void(Node *)> executeNode = [&](Node *node) {
      // Sort children
      std::stable_sort(
          node->children.begin(), node->children.end(),
          [](const std::shared_ptr<Node> &a, const std::shared_ptr<Node> &b) {
            return a->zIndex < b->zIndex;
          });

      // Execute Group begin
      if (node->cmd && node->cmd->type == CommandType::Group) {
        static_cast<GroupCmd *>(node->cmd)->begin(ctx);
      }

      // Execute children
      for (const auto &child : node->children) {
        if (child->cmd && child->cmd->type == CommandType::Group) {
          executeNode(child.get());
        } else if (child->cmd) {
          executeCommand(child->cmd, ctx);
        }
      }

      // Execute Group end
      if (node->cmd && node->cmd->type == CommandType::Group) {
        static_cast<GroupCmd *>(node->cmd)->end(ctx);
      }
    };

    executeNode(root.get());
  }
};

} // namespace RNSkia
