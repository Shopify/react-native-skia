#pragma once

#include <memory>
#include <optional>
#include <string>
#include <vector>

#include <jsi/jsi.h>

#include "Command.h"
#include "Convertor.h"
#include "DrawingCtx.h"
#include "Drawings.h"
#include "ImageFilters.h"
#include "Paint.h"
#include "PathEffects.h"
#include "ColorFilters.h"
#include "Shaders.h"

namespace RNSkia {

class Recorder {
private:
  std::vector<std::unique_ptr<Command>> commands;

public:
  Variables variables;

  ~Recorder() = default;

  void savePaint(jsi::Runtime &runtime, const jsi::Object &props) {
    commands.push_back(
        std::make_unique<SavePaintCmd>(runtime, props, variables));
  }

  void pushShader(jsi::Runtime &runtime, const std::string &nodeType,
                  const jsi::Object &props) {
    if (nodeType == "skShader") {
      commands.push_back(
          std::make_unique<PushShaderCmd>(runtime, props, variables));
    } else if (nodeType == "skImageShader") {
      commands.push_back(
          std::make_unique<PushImageShaderCmd>(runtime, props, variables));
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
      commands.push_back(
          std::make_unique<LinearToSRGBGammaColorFilterCmd>(runtime, props, variables));
    } else if (nodeType == "skSRGBToLinearGammaColorFilter") {
      commands.push_back(
          std::make_unique<SRGBToLinearGammaColorFilterCmd>(runtime, props, variables));
    } else if (nodeType == "skLumaColorFilter") {
      commands.push_back(
          std::make_unique<LumaColorFilterCmd>(runtime, props, variables));
    } else if (nodeType == "skLerpColorFilter") {
      commands.push_back(
          std::make_unique<LerpColorFilterCmd>(runtime, props, variables));
    }
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

  void drawBox(jsi::Runtime &runtime, const jsi::Object &props) {
    commands.push_back(std::make_unique<BoxCmd>(runtime, props, variables));
  }

  void drawImage(jsi::Runtime &runtime, const jsi::Object &props) {
    commands.push_back(std::make_unique<ImageCmd>(runtime, props, variables));
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
    commands.push_back(std::make_unique<PictureCmd>(runtime, props, variables));
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
    commands.push_back(std::make_unique<AtlasCmd>(runtime, props, variables));
  }

  void materializePaint() {
    commands.push_back(
        std::make_unique<Command>(CommandType::MaterializePaint));
  }

  void play(DrawingCtx *ctx) {
    for (const auto &cmd : commands) {
      switch (cmd->type) {

      case CommandType::MaterializePaint: {
        ctx->materializePaint();
        break;
      }

      case CommandType::SavePaint: {
        auto *savePaintCmd = static_cast<SavePaintCmd *>(cmd.get());
        savePaintCmd->savePaint(ctx);
        break;
      }

      case CommandType::PushShader: {
        auto nodeType = cmd->nodeType;
        if (nodeType == "skShader") {
          auto *pushShaderCmd = static_cast<PushShaderCmd *>(cmd.get());
          pushShaderCmd->pushShader(ctx);
          break;
        } else if (nodeType == "skImageShader") {
          auto *pushImageShaderCmd =
              static_cast<PushImageShaderCmd *>(cmd.get());
          pushImageShaderCmd->pushShader(ctx);
        }
      }

      case CommandType::PushImageFilter: {
        auto nodeType = cmd->nodeType;
        if (nodeType == "skOffsetImageFilter") {
          auto *offsetCmd = static_cast<OffsetImageFilterCmd *>(cmd.get());
          offsetCmd->pushImageFilter(ctx);
        } else if (nodeType == "skDisplacementMapImageFilter") {
          auto *displacementCmd =
              static_cast<DisplacementMapImageFilterCmd *>(cmd.get());
          displacementCmd->pushImageFilter(ctx);
        } else if (nodeType == "skBlurImageFilter") {
          auto *blurCmd = static_cast<BlurImageFilterCmd *>(cmd.get());
          blurCmd->pushImageFilter(ctx);
        } else if (nodeType == "skDropShadowImageFilter") {
          auto *dropShadowCmd =
              static_cast<DropShadowImageFilterCmd *>(cmd.get());
          dropShadowCmd->pushImageFilter(ctx);
        } else if (nodeType == "skMorphologyImageFilter") {
          auto *morphologyCmd =
              static_cast<MorphologyImageFilterCmd *>(cmd.get());
          morphologyCmd->pushImageFilter(ctx);
        } else if (nodeType == "skBlendImageFilter") {
          auto *blendCmd = static_cast<BlendImageFilterCmd *>(cmd.get());
          blendCmd->pushImageFilter(ctx);
        } else if (nodeType == "skRuntimeShaderImageFilter") {
          auto *runtimeShaderCmd =
              static_cast<RuntimeShaderImageFilterCmd *>(cmd.get());
          runtimeShaderCmd->pushImageFilter(ctx);
        }
        break;
      }

      case CommandType::PushPathEffect: {
        auto nodeType = cmd->nodeType;
        if (nodeType == "skDiscretePathEffect") {
          auto *discreteCmd = static_cast<DiscretePathEffectCmd *>(cmd.get());
          discreteCmd->pushPathEffect(ctx);
        } else if (nodeType == "skDashPathEffect") {
          auto *dashCmd = static_cast<DashPathEffectCmd *>(cmd.get());
          dashCmd->pushPathEffect(ctx);
        } else if (nodeType == "skPath1DPathEffect") {
          auto *path1DCmd = static_cast<Path1DPathEffectCmd *>(cmd.get());
          path1DCmd->pushPathEffect(ctx);
        } else if (nodeType == "skPath2DPathEffect") {
          auto *path2DCmd = static_cast<Path2DPathEffectCmd *>(cmd.get());
          path2DCmd->pushPathEffect(ctx);
        } else if (nodeType == "skCornerPathEffect") {
          auto *cornerCmd = static_cast<CornerPathEffectCmd *>(cmd.get());
          cornerCmd->pushPathEffect(ctx);
        } else if (nodeType == "skSumPathEffect") {
          auto *sumCmd = static_cast<SumPathEffectCmd *>(cmd.get());
          sumCmd->pushPathEffect(ctx);
        } else if (nodeType == "skLine2DPathEffect") {
          auto *line2DCmd = static_cast<Line2DPathEffectCmd *>(cmd.get());
          line2DCmd->pushPathEffect(ctx);
        }
        break;
      }

      case CommandType::PushColorFilter: {
        auto nodeType = cmd->nodeType;
        if (nodeType == "skMatrixColorFilter") {
          auto *matrixCmd = static_cast<MatrixColorFilterCmd *>(cmd.get());
          matrixCmd->pushColorFilter(ctx);
        } else if (nodeType == "skBlendColorFilter") {
          auto *blendCmd = static_cast<BlendColorFilterCmd *>(cmd.get());
          blendCmd->pushColorFilter(ctx);
        } else if (nodeType == "skLinearToSRGBGammaColorFilter") {
          auto *linearToSRGBCmd = static_cast<LinearToSRGBGammaColorFilterCmd *>(cmd.get());
          linearToSRGBCmd->pushColorFilter(ctx);
        } else if (nodeType == "skSRGBToLinearGammaColorFilter") {
          auto *srgbToLinearCmd = static_cast<SRGBToLinearGammaColorFilterCmd *>(cmd.get());
          srgbToLinearCmd->pushColorFilter(ctx);
        } else if (nodeType == "skLumaColorFilter") {
          auto *lumaCmd = static_cast<LumaColorFilterCmd *>(cmd.get());
          lumaCmd->pushColorFilter(ctx);
        } else if (nodeType == "skLerpColorFilter") {
          auto *lerpCmd = static_cast<LerpColorFilterCmd *>(cmd.get());
          lerpCmd->pushColorFilter(ctx);
        }
        break;
      }

      case CommandType::PushBlurMaskFilter: {
        auto *blurMaskFilterCmd = static_cast<BlurMaskFilterCmd *>(cmd.get());
        blurMaskFilterCmd->pushMaskFilter(ctx);
        break;
      }

      case CommandType::DrawPaint: {
        ctx->canvas->drawPaint(ctx->getPaint());
        break;
      }

      case CommandType::DrawText: {
        auto *textCmd = static_cast<TextCmd *>(cmd.get());
        textCmd->draw(ctx);
        break;
      }

      case CommandType::RestorePaint: {
        ctx->restorePaint();
        break;
      }

      case CommandType::SaveCTM: {
        auto *saveCTMCmd = static_cast<SaveCTMCmd *>(cmd.get());
        saveCTMCmd->saveCTM(ctx);
        break;
      }

      case CommandType::RestoreCTM: {
        ctx->canvas->restore();
        break;
      }

      case CommandType::DrawCircle: {
        auto *circleCmd = static_cast<CircleCmd *>(cmd.get());
        circleCmd->draw(ctx);
        break;
      }

      case CommandType::DrawPath: {
        auto *pathCmd = static_cast<PathCmd *>(cmd.get());
        pathCmd->draw(ctx);
        break;
      }

      case CommandType::DrawRect: {
        auto *rectCmd = static_cast<RectCmd *>(cmd.get());
        rectCmd->draw(ctx);
        break;
      }

      case CommandType::DrawLine: {
        auto *lineCmd = static_cast<LineCmd *>(cmd.get());
        lineCmd->draw(ctx);
        break;
      }

      case CommandType::DrawTextPath: {
        auto *textPathCmd = static_cast<TextPathCmd *>(cmd.get());
        textPathCmd->draw(ctx);
        break;
      }
      case CommandType::DrawBox: {
        auto *boxCmd = static_cast<BoxCmd *>(cmd.get());
        boxCmd->draw(ctx);
        break;
      }

      case CommandType::DrawImage: {
        auto *imageCmd = static_cast<ImageCmd *>(cmd.get());
        imageCmd->draw(ctx);
        break;
      }

      case CommandType::DrawPoints: {
        auto *pointsCmd = static_cast<PointsCmd *>(cmd.get());
        pointsCmd->draw(ctx);
        break;
      }

      case CommandType::DrawRRect: {
        auto *rRectCmd = static_cast<RRectCmd *>(cmd.get());
        rRectCmd->draw(ctx);
        break;
      }

      case CommandType::DrawOval: {
        auto *ovalCmd = static_cast<OvalCmd *>(cmd.get());
        ovalCmd->draw(ctx);
        break;
      }

      case CommandType::DrawPatch: {
        auto *patchCmd = static_cast<PatchCmd *>(cmd.get());
        patchCmd->draw(ctx);
        break;
      }

      case CommandType::DrawVertices: {
        auto *verticesCmd = static_cast<VerticesCmd *>(cmd.get());
        verticesCmd->draw(ctx);
        break;
      }

      case CommandType::DrawDiffRect: {
        auto *diffRectCmd = static_cast<DiffRectCmd *>(cmd.get());
        diffRectCmd->draw(ctx);
        break;
      }

      case CommandType::DrawTextBlob: {
        auto *textBlobCmd = static_cast<TextBlobCmd *>(cmd.get());
        textBlobCmd->draw(ctx);
        break;
      }

      case CommandType::DrawGlyphs: {
        auto *glyphsCmd = static_cast<GlyphsCmd *>(cmd.get());
        glyphsCmd->draw(ctx);
        break;
      }

      case CommandType::DrawPicture: {
        auto *pictureCmd = static_cast<PictureCmd *>(cmd.get());
        pictureCmd->draw(ctx);
        break;
      }

      case CommandType::DrawImageSVG: {
        auto *imageSVGCmd = static_cast<ImageSVGCmd *>(cmd.get());
        imageSVGCmd->draw(ctx);
        break;
      }

      case CommandType::DrawParagraph: {
        auto *paragraphCmd = static_cast<ParagraphCmd *>(cmd.get());
        paragraphCmd->draw(ctx);
        break;
      }

      case CommandType::DrawAtlas: {
        auto *atlasCmd = static_cast<AtlasCmd *>(cmd.get());
        atlasCmd->draw(ctx);
        break;
      }
      }
    }
  }
};

} // namespace RNSkia
