export const mapKeys = obj => {
  "worklet";

  return Object.keys(obj);
};
export const exhaustiveCheck = a => {
  "worklet";

  throw new Error(`Unexhaustive handling for ${a}`);
};

// Shallow eq on props (without children)
export const shallowEq = (p1, p2) => {
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
//# sourceMappingURL=typeddash.js.map