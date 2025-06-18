"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.shallowEq = exports.mapKeys = exports.exhaustiveCheck = void 0;
const mapKeys = obj => {
  "worklet";

  return Object.keys(obj);
};
exports.mapKeys = mapKeys;
const exhaustiveCheck = a => {
  "worklet";

  throw new Error(`Unexhaustive handling for ${a}`);
};

// Shallow eq on props (without children)
exports.exhaustiveCheck = exhaustiveCheck;
const shallowEq = (p1, p2) => {
  const keys1 = mapKeys(p1);
  const keys2 = mapKeys(p2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (const key of keys1) {
    if (key === "children") {
      continue;
    }
    if (p1[key] !== p2[key]) {
      return false;
    }
  }
  return true;
};
exports.shallowEq = shallowEq;
//# sourceMappingURL=typeddash.js.map