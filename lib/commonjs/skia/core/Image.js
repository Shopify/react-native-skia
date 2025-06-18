"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useImage = exports.makeImageFromView = void 0;
var _Platform = require("../../Platform");
var _Skia = require("../Skia");
var _Data = require("./Data");
const imgFactory = _Skia.Skia.Image.MakeImageFromEncoded.bind(_Skia.Skia.Image);

/**
 * Returns a Skia Image object
 * */
const useImage = (source, onError) => (0, _Data.useRawData)(source, imgFactory, onError);

/**
 * Creates an image from a given view reference. NOTE: This method has different implementations
 * on web/native. On web, the callback is called with the view ref and the callback is expected to
 * return a promise that resolves to a Skia Image object. On native, the view ref is used to
 * find the view tag and the Skia Image object is created from the view tag. This means that on web
 * you will need to implement the logic to create the image from the view ref yourself.
 * @param viewRef Ref to the view we're creating an image from
 * @returns A promise that resolves to a Skia Image object or rejects
 * with an error id the view tag is invalid.
 */
exports.useImage = useImage;
const makeImageFromView = (viewRef, callback = null) => {
  // In web implementation we just delegate the work to the provided callback
  if (_Platform.Platform.OS === "web") {
    if (callback) {
      return callback(viewRef);
    } else {
      Promise.reject(new Error("Callback is required on web in the makeImageFromView function."));
    }
  }
  const viewTag = _Platform.Platform.findNodeHandle(viewRef.current);
  if (viewTag !== null && viewTag !== 0) {
    return _Skia.Skia.Image.MakeImageFromViewTag(viewTag);
  }
  return Promise.reject(new Error("Invalid view tag"));
};
exports.makeImageFromView = makeImageFromView;
//# sourceMappingURL=Image.js.map