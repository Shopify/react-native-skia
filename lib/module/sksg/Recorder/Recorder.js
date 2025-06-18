function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { NodeType } from "../../dom/types";
import { isSharedValue } from "../utils";
import { isColorFilter, isImageFilter, isPathEffect, isShader } from "../Node";
import { CommandType } from "./Core";
export class Recorder {
  constructor() {
    _defineProperty(this, "commands", []);
    _defineProperty(this, "cursors", []);
    _defineProperty(this, "animationValues", new Set());
    this.cursors.push(this.commands);
  }
  getRecording() {
    return {
      commands: this.commands,
      paintPool: [],
      animationValues: this.animationValues
    };
  }
  processProps(props) {
    const animatedProps = {};
    let hasAnimatedProps = false;
    for (const key in props) {
      const prop = props[key];
      if (isSharedValue(prop)) {
        this.animationValues.add(prop);
        animatedProps[key] = prop;
        hasAnimatedProps = true;
      }
    }
    return {
      props,
      animatedProps: hasAnimatedProps ? animatedProps : undefined
    };
  }
  add(command) {
    if (command.props) {
      const {
        animatedProps
      } = this.processProps(command.props);
      if (animatedProps) {
        command.animatedProps = animatedProps;
      }
    }
    this.cursors[this.cursors.length - 1].push(command);
  }
  saveGroup() {
    const children = [];
    this.add({
      type: CommandType.Group,
      children
    });
    this.cursors.push(children);
  }
  restoreGroup() {
    this.cursors.pop();
  }
  savePaint(props) {
    this.add({
      type: CommandType.SavePaint,
      props
    });
  }
  restorePaint() {
    this.add({
      type: CommandType.RestorePaint
    });
  }
  restorePaintDeclaration() {
    this.add({
      type: CommandType.RestorePaintDeclaration
    });
  }
  materializePaint() {
    this.add({
      type: CommandType.MaterializePaint
    });
  }
  pushPathEffect(pathEffectType, props) {
    if (!isPathEffect(pathEffectType)) {
      throw new Error("Invalid color filter type: " + pathEffectType);
    }
    this.add({
      type: CommandType.PushPathEffect,
      pathEffectType,
      props
    });
  }
  pushImageFilter(imageFilterType, props) {
    if (!isImageFilter(imageFilterType)) {
      throw new Error("Invalid color filter type: " + imageFilterType);
    }
    this.add({
      type: CommandType.PushImageFilter,
      imageFilterType,
      props
    });
  }
  pushColorFilter(colorFilterType, props) {
    if (!isColorFilter(colorFilterType)) {
      throw new Error("Invalid color filter type: " + colorFilterType);
    }
    this.add({
      type: CommandType.PushColorFilter,
      colorFilterType,
      props
    });
  }
  pushShader(shaderType, props) {
    if (!isShader(shaderType) && !(shaderType === NodeType.Blend)) {
      throw new Error("Invalid color filter type: " + shaderType);
    }
    this.add({
      type: CommandType.PushShader,
      shaderType,
      props
    });
  }
  pushBlurMaskFilter(props) {
    this.add({
      type: CommandType.PushBlurMaskFilter,
      props
    });
  }
  composePathEffect() {
    this.add({
      type: CommandType.ComposePathEffect
    });
  }
  composeColorFilter() {
    this.add({
      type: CommandType.ComposeColorFilter
    });
  }
  composeImageFilter() {
    this.add({
      type: CommandType.ComposeImageFilter
    });
  }
  saveCTM(props) {
    this.add({
      type: CommandType.SaveCTM,
      props
    });
  }
  restoreCTM() {
    this.add({
      type: CommandType.RestoreCTM
    });
  }
  drawPaint() {
    this.add({
      type: CommandType.DrawPaint
    });
  }
  saveLayer() {
    this.add({
      type: CommandType.SaveLayer
    });
  }
  saveBackdropFilter() {
    this.add({
      type: CommandType.SaveBackdropFilter
    });
  }
  drawBox(boxProps, shadows) {
    shadows.forEach(shadow => {
      if (shadow.props) {
        if (shadow.props) {
          const {
            animatedProps
          } = this.processProps(shadow.props);
          if (animatedProps) {
            shadow.animatedProps = animatedProps;
          }
        }
      }
    });
    this.add({
      type: CommandType.DrawBox,
      props: boxProps,
      shadows
    });
  }
  drawImage(props) {
    this.add({
      type: CommandType.DrawImage,
      props
    });
  }
  drawCircle(props) {
    this.add({
      type: CommandType.DrawCircle,
      props
    });
  }
  drawPoints(props) {
    this.add({
      type: CommandType.DrawPoints,
      props
    });
  }
  drawPath(props) {
    this.add({
      type: CommandType.DrawPath,
      props
    });
  }
  drawRect(props) {
    this.add({
      type: CommandType.DrawRect,
      props
    });
  }
  drawRRect(props) {
    this.add({
      type: CommandType.DrawRRect,
      props
    });
  }
  drawOval(props) {
    this.add({
      type: CommandType.DrawOval,
      props
    });
  }
  drawLine(props) {
    this.add({
      type: CommandType.DrawLine,
      props
    });
  }
  drawPatch(props) {
    this.add({
      type: CommandType.DrawPatch,
      props
    });
  }
  drawVertices(props) {
    this.add({
      type: CommandType.DrawVertices,
      props
    });
  }
  drawDiffRect(props) {
    this.add({
      type: CommandType.DrawDiffRect,
      props
    });
  }
  drawText(props) {
    this.add({
      type: CommandType.DrawText,
      props
    });
  }
  drawTextPath(props) {
    this.add({
      type: CommandType.DrawTextPath,
      props
    });
  }
  drawTextBlob(props) {
    this.add({
      type: CommandType.DrawTextBlob,
      props
    });
  }
  drawGlyphs(props) {
    this.add({
      type: CommandType.DrawGlyphs,
      props
    });
  }
  drawPicture(props) {
    this.add({
      type: CommandType.DrawPicture,
      props
    });
  }
  drawImageSVG(props) {
    this.add({
      type: CommandType.DrawImageSVG,
      props
    });
  }
  drawParagraph(props) {
    this.add({
      type: CommandType.DrawParagraph,
      props
    });
  }
  drawAtlas(props) {
    this.add({
      type: CommandType.DrawAtlas,
      props
    });
  }
}
//# sourceMappingURL=Recorder.js.map