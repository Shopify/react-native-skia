function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { isSharedValue } from "../utils";
export class ReanimatedRecorder {
  constructor(Skia) {
    _defineProperty(this, "values", new Set());
    _defineProperty(this, "recorder", void 0);
    this.recorder = Skia.Recorder();
  }
  processAnimationValues(props) {
    if (!props) {
      return;
    }
    Object.values(props).forEach(value => {
      if (isSharedValue(value) && !this.values.has(value)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        value.name = `variable${this.values.size}`;
        this.values.add(value);
      }
    });
  }
  getRecorder() {
    return this.recorder;
  }
  getSharedValues() {
    return Array.from(this.values);
  }
  saveGroup() {
    this.recorder.saveGroup();
  }
  restoreGroup() {
    this.recorder.restoreGroup();
  }
  savePaint(props) {
    this.processAnimationValues(props);
    this.recorder.savePaint(props);
  }
  restorePaint() {
    this.recorder.restorePaint();
  }
  restorePaintDeclaration() {
    this.recorder.restorePaintDeclaration();
  }
  materializePaint() {
    this.recorder.materializePaint();
  }
  pushPathEffect(pathEffectType, props) {
    this.processAnimationValues(props);
    this.recorder.pushPathEffect(pathEffectType, props);
  }
  pushImageFilter(imageFilterType, props) {
    this.processAnimationValues(props);
    this.recorder.pushImageFilter(imageFilterType, props);
  }
  pushColorFilter(colorFilterType, props) {
    this.processAnimationValues(props);
    this.recorder.pushColorFilter(colorFilterType, props);
  }
  pushShader(shaderType, props) {
    this.processAnimationValues(props);
    this.recorder.pushShader(shaderType, props);
  }
  pushBlurMaskFilter(props) {
    this.processAnimationValues(props);
    this.recorder.pushBlurMaskFilter(props);
  }
  composePathEffect() {
    this.recorder.composePathEffect();
  }
  composeColorFilter() {
    this.recorder.composeColorFilter();
  }
  composeImageFilter() {
    this.recorder.composeImageFilter();
  }
  saveCTM(props) {
    this.processAnimationValues(props);
    this.recorder.saveCTM(props);
  }
  restoreCTM() {
    this.recorder.restoreCTM();
  }
  drawPaint() {
    this.recorder.drawPaint();
  }
  saveLayer() {
    this.recorder.saveLayer();
  }
  saveBackdropFilter() {
    this.recorder.saveBackdropFilter();
  }
  drawBox(boxProps, shadows) {
    this.processAnimationValues(boxProps);
    shadows.forEach(shadow => {
      this.processAnimationValues(shadow.props);
    });
    this.recorder.drawBox(boxProps,
    // TODO: Fix this type BaseRecorder.drawBox()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    shadows.map(s => s.props));
  }
  drawImage(props) {
    this.processAnimationValues(props);
    this.recorder.drawImage(props);
  }
  drawCircle(props) {
    this.processAnimationValues(props);
    this.recorder.drawCircle(props);
  }
  drawPoints(props) {
    this.processAnimationValues(props);
    this.recorder.drawPoints(props);
  }
  drawPath(props) {
    this.processAnimationValues(props);
    this.recorder.drawPath(props);
  }
  drawRect(props) {
    this.processAnimationValues(props);
    this.recorder.drawRect(props);
  }
  drawRRect(props) {
    this.processAnimationValues(props);
    this.recorder.drawRRect(props);
  }
  drawOval(props) {
    this.processAnimationValues(props);
    this.recorder.drawOval(props);
  }
  drawLine(props) {
    this.processAnimationValues(props);
    this.recorder.drawLine(props);
  }
  drawPatch(props) {
    this.processAnimationValues(props);
    this.recorder.drawPatch(props);
  }
  drawVertices(props) {
    this.processAnimationValues(props);
    this.recorder.drawVertices(props);
  }
  drawDiffRect(props) {
    this.processAnimationValues(props);
    this.recorder.drawDiffRect(props);
  }
  drawText(props) {
    this.processAnimationValues(props);
    this.recorder.drawText(props);
  }
  drawTextPath(props) {
    this.processAnimationValues(props);
    this.recorder.drawTextPath(props);
  }
  drawTextBlob(props) {
    this.processAnimationValues(props);
    this.recorder.drawTextBlob(props);
  }
  drawGlyphs(props) {
    this.processAnimationValues(props);
    this.recorder.drawGlyphs(props);
  }
  drawPicture(props) {
    this.processAnimationValues(props);
    this.recorder.drawPicture(props);
  }
  drawImageSVG(props) {
    this.processAnimationValues(props);
    this.recorder.drawImageSVG(props);
  }
  drawParagraph(props) {
    this.processAnimationValues(props);
    this.recorder.drawParagraph(props);
  }
  drawAtlas(props) {
    this.processAnimationValues(props);
    this.recorder.drawAtlas(props);
  }
}
//# sourceMappingURL=ReanimatedRecorder.js.map