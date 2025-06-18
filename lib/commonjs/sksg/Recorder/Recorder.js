"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Recorder = void 0;
var _types = require("../../dom/types");
var _utils = require("../utils");
var _Node = require("../Node");
var _Core = require("./Core");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class Recorder {
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
      if ((0, _utils.isSharedValue)(prop)) {
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
      type: _Core.CommandType.Group,
      children
    });
    this.cursors.push(children);
  }
  restoreGroup() {
    this.cursors.pop();
  }
  savePaint(props) {
    this.add({
      type: _Core.CommandType.SavePaint,
      props
    });
  }
  restorePaint() {
    this.add({
      type: _Core.CommandType.RestorePaint
    });
  }
  restorePaintDeclaration() {
    this.add({
      type: _Core.CommandType.RestorePaintDeclaration
    });
  }
  materializePaint() {
    this.add({
      type: _Core.CommandType.MaterializePaint
    });
  }
  pushPathEffect(pathEffectType, props) {
    if (!(0, _Node.isPathEffect)(pathEffectType)) {
      throw new Error("Invalid color filter type: " + pathEffectType);
    }
    this.add({
      type: _Core.CommandType.PushPathEffect,
      pathEffectType,
      props
    });
  }
  pushImageFilter(imageFilterType, props) {
    if (!(0, _Node.isImageFilter)(imageFilterType)) {
      throw new Error("Invalid color filter type: " + imageFilterType);
    }
    this.add({
      type: _Core.CommandType.PushImageFilter,
      imageFilterType,
      props
    });
  }
  pushColorFilter(colorFilterType, props) {
    if (!(0, _Node.isColorFilter)(colorFilterType)) {
      throw new Error("Invalid color filter type: " + colorFilterType);
    }
    this.add({
      type: _Core.CommandType.PushColorFilter,
      colorFilterType,
      props
    });
  }
  pushShader(shaderType, props) {
    if (!(0, _Node.isShader)(shaderType) && !(shaderType === _types.NodeType.Blend)) {
      throw new Error("Invalid color filter type: " + shaderType);
    }
    this.add({
      type: _Core.CommandType.PushShader,
      shaderType,
      props
    });
  }
  pushBlurMaskFilter(props) {
    this.add({
      type: _Core.CommandType.PushBlurMaskFilter,
      props
    });
  }
  composePathEffect() {
    this.add({
      type: _Core.CommandType.ComposePathEffect
    });
  }
  composeColorFilter() {
    this.add({
      type: _Core.CommandType.ComposeColorFilter
    });
  }
  composeImageFilter() {
    this.add({
      type: _Core.CommandType.ComposeImageFilter
    });
  }
  saveCTM(props) {
    this.add({
      type: _Core.CommandType.SaveCTM,
      props
    });
  }
  restoreCTM() {
    this.add({
      type: _Core.CommandType.RestoreCTM
    });
  }
  drawPaint() {
    this.add({
      type: _Core.CommandType.DrawPaint
    });
  }
  saveLayer() {
    this.add({
      type: _Core.CommandType.SaveLayer
    });
  }
  saveBackdropFilter() {
    this.add({
      type: _Core.CommandType.SaveBackdropFilter
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
      type: _Core.CommandType.DrawBox,
      props: boxProps,
      shadows
    });
  }
  drawImage(props) {
    this.add({
      type: _Core.CommandType.DrawImage,
      props
    });
  }
  drawCircle(props) {
    this.add({
      type: _Core.CommandType.DrawCircle,
      props
    });
  }
  drawPoints(props) {
    this.add({
      type: _Core.CommandType.DrawPoints,
      props
    });
  }
  drawPath(props) {
    this.add({
      type: _Core.CommandType.DrawPath,
      props
    });
  }
  drawRect(props) {
    this.add({
      type: _Core.CommandType.DrawRect,
      props
    });
  }
  drawRRect(props) {
    this.add({
      type: _Core.CommandType.DrawRRect,
      props
    });
  }
  drawOval(props) {
    this.add({
      type: _Core.CommandType.DrawOval,
      props
    });
  }
  drawLine(props) {
    this.add({
      type: _Core.CommandType.DrawLine,
      props
    });
  }
  drawPatch(props) {
    this.add({
      type: _Core.CommandType.DrawPatch,
      props
    });
  }
  drawVertices(props) {
    this.add({
      type: _Core.CommandType.DrawVertices,
      props
    });
  }
  drawDiffRect(props) {
    this.add({
      type: _Core.CommandType.DrawDiffRect,
      props
    });
  }
  drawText(props) {
    this.add({
      type: _Core.CommandType.DrawText,
      props
    });
  }
  drawTextPath(props) {
    this.add({
      type: _Core.CommandType.DrawTextPath,
      props
    });
  }
  drawTextBlob(props) {
    this.add({
      type: _Core.CommandType.DrawTextBlob,
      props
    });
  }
  drawGlyphs(props) {
    this.add({
      type: _Core.CommandType.DrawGlyphs,
      props
    });
  }
  drawPicture(props) {
    this.add({
      type: _Core.CommandType.DrawPicture,
      props
    });
  }
  drawImageSVG(props) {
    this.add({
      type: _Core.CommandType.DrawImageSVG,
      props
    });
  }
  drawParagraph(props) {
    this.add({
      type: _Core.CommandType.DrawParagraph,
      props
    });
  }
  drawAtlas(props) {
    this.add({
      type: _Core.CommandType.DrawAtlas,
      props
    });
  }
}
exports.Recorder = Recorder;
//# sourceMappingURL=Recorder.js.map