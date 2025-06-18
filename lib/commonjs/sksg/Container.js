"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createContainer = exports.Container = void 0;
var _ReanimatedProxy = _interopRequireDefault(require("../external/reanimated/ReanimatedProxy"));
var _renderHelpers = require("../external/reanimated/renderHelpers");
var _Recorder = require("./Recorder/Recorder");
var _Visitor = require("./Recorder/Visitor");
var _Player = require("./Recorder/Player");
var _DrawingContext = require("./Recorder/DrawingContext");
var _ReanimatedRecorder = require("./Recorder/ReanimatedRecorder");
require("../views/api");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const drawOnscreen = (Skia, nativeId, recording) => {
  "worklet";

  const rec = Skia.PictureRecorder();
  const canvas = rec.beginRecording();
  //const start = performance.now();

  const ctx = (0, _DrawingContext.createDrawingContext)(Skia, recording.paintPool, canvas);
  (0, _Player.replay)(ctx, recording.commands);
  const picture = rec.finishRecordingAsPicture();
  //const end = performance.now();
  //console.log("Recording time: ", end - start);
  SkiaViewApi.setJsiProperty(nativeId, "picture", picture);
};
const nativeDrawOnscreen = (nativeId, recorder) => {
  "worklet";

  //const start = performance.now();
  const picture = recorder.play();
  //const end = performance.now();
  //console.log("Recording time: ", end - start);
  SkiaViewApi.setJsiProperty(nativeId, "picture", picture);
};
class Container {
  constructor(Skia, nativeId) {
    this.Skia = Skia;
    this.nativeId = nativeId;
    _defineProperty(this, "root", []);
    _defineProperty(this, "recording", null);
    _defineProperty(this, "unmounted", false);
  }
  unmount() {
    this.unmounted = true;
  }
  drawOnCanvas(canvas) {
    if (!this.recording) {
      throw new Error("No recording to draw");
    }
    const ctx = (0, _DrawingContext.createDrawingContext)(this.Skia, this.recording.paintPool, canvas);
    (0, _Player.replay)(ctx, this.recording.commands);
  }
}
exports.Container = Container;
class StaticContainer extends Container {
  constructor(Skia, nativeId) {
    super(Skia, nativeId);
  }
  redraw() {
    const recorder = new _Recorder.Recorder();
    (0, _Visitor.visit)(recorder, this.root);
    this.recording = recorder.getRecording();
    const isOnScreen = this.nativeId !== -1;
    if (isOnScreen) {
      const rec = this.Skia.PictureRecorder();
      const canvas = rec.beginRecording();
      this.drawOnCanvas(canvas);
      const picture = rec.finishRecordingAsPicture();
      SkiaViewApi.setJsiProperty(this.nativeId, "picture", picture);
    }
  }
}
class ReanimatedContainer extends Container {
  constructor(Skia, nativeId) {
    super(Skia, nativeId);
    _defineProperty(this, "mapperId", null);
  }
  redraw() {
    if (this.mapperId !== null) {
      _ReanimatedProxy.default.stopMapper(this.mapperId);
    }
    if (this.unmounted) {
      return;
    }
    const recorder = new _Recorder.Recorder();
    (0, _Visitor.visit)(recorder, this.root);
    const record = recorder.getRecording();
    const {
      animationValues
    } = record;
    this.recording = {
      commands: record.commands,
      paintPool: record.paintPool
    };
    const {
      nativeId,
      Skia,
      recording
    } = this;
    if (animationValues.size > 0) {
      this.mapperId = _ReanimatedProxy.default.startMapper(() => {
        "worklet";

        drawOnscreen(Skia, nativeId, recording);
      }, Array.from(animationValues));
    }
    _ReanimatedProxy.default.runOnUI(() => {
      "worklet";

      drawOnscreen(Skia, nativeId, recording);
    })();
  }
}
class NativeReanimatedContainer extends Container {
  constructor(Skia, nativeId) {
    super(Skia, nativeId);
    _defineProperty(this, "mapperId", null);
  }
  redraw() {
    if (this.mapperId !== null) {
      _ReanimatedProxy.default.stopMapper(this.mapperId);
    }
    if (this.unmounted) {
      return;
    }
    const {
      nativeId,
      Skia
    } = this;
    const recorder = new _ReanimatedRecorder.ReanimatedRecorder(Skia);
    (0, _Visitor.visit)(recorder, this.root);
    const sharedValues = recorder.getSharedValues();
    const sharedRecorder = recorder.getRecorder();
    _ReanimatedProxy.default.runOnUI(() => {
      "worklet";

      nativeDrawOnscreen(nativeId, sharedRecorder);
    })();
    if (sharedValues.length > 0) {
      this.mapperId = _ReanimatedProxy.default.startMapper(() => {
        "worklet";

        sharedRecorder.applyUpdates(sharedValues);
        nativeDrawOnscreen(nativeId, sharedRecorder);
      }, sharedValues);
    }
  }
}
const createContainer = (Skia, nativeId) => {
  const web = global.SkiaViewApi && global.SkiaViewApi.web;
  if (_renderHelpers.HAS_REANIMATED_3 && nativeId !== -1) {
    if (!web) {
      return new NativeReanimatedContainer(Skia, nativeId);
    } else {
      return new ReanimatedContainer(Skia, nativeId);
    }
  } else {
    return new StaticContainer(Skia, nativeId);
  }
};
exports.createContainer = createContainer;
//# sourceMappingURL=Container.js.map