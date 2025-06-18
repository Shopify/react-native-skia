"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useRawData = exports.useData = exports.useCollectionLoading = exports.loadData = void 0;
var _react = require("react");
var _Skia = require("../Skia");
var _Platform = require("../../Platform");
const factoryWrapper = (data2, factory, onError) => {
  const factoryResult = factory(data2);
  if (factoryResult === null) {
    onError && onError(new Error("Could not load data"));
    return null;
  } else {
    return factoryResult;
  }
};
const loadData = (source, factory, onError) => {
  if (source === null || source === undefined) {
    return new Promise(resolve => resolve(null));
  } else if (source instanceof Uint8Array) {
    return new Promise(resolve => resolve(factoryWrapper(_Skia.Skia.Data.fromBytes(source), factory, onError)));
  } else {
    const uri = typeof source === "string" ? source : _Platform.Platform.resolveAsset(source);
    return _Skia.Skia.Data.fromURI(uri).then(d => factoryWrapper(d, factory, onError));
  }
};
exports.loadData = loadData;
const useLoading = (source, loader) => {
  const mounted = (0, _react.useRef)(false);
  const [data, setData] = (0, _react.useState)(null);
  const dataRef = (0, _react.useRef)(null);
  (0, _react.useEffect)(() => {
    mounted.current = true;
    loader().then(value => {
      if (mounted.current) {
        setData(value);
        dataRef.current = value;
      }
    });
    return () => {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);
  return data;
};
const useCollectionLoading = (source, loader) => {
  const mounted = (0, _react.useRef)(false);
  const [data, setData] = (0, _react.useState)(null);
  const dataRef = (0, _react.useRef)(null);
  (0, _react.useEffect)(() => {
    mounted.current = true;
    loader().then(result => {
      const value = result.filter(r => r !== null);
      if (mounted.current) {
        setData(value);
        dataRef.current = value;
      }
    });
    return () => {
      mounted.current = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);
  return data;
};
exports.useCollectionLoading = useCollectionLoading;
const useRawData = (source, factory, onError) => useLoading(source, () => loadData(source, factory, onError));
exports.useRawData = useRawData;
const identity = data => data;
const useData = (source, onError) => useRawData(source, identity, onError);
exports.useData = useData;
//# sourceMappingURL=Data.js.map