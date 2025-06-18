import { mapKeys } from "../renderer/typeddash";
export const isSharedValue = value => {
  "worklet";

  // We cannot use `in` operator here because `value` could be a HostObject and therefore we cast.
  return (value === null || value === void 0 ? void 0 : value._isReanimatedSharedValue) === true;
};
export const materialize = props => {
  "worklet";

  const result = Object.assign({}, props);
  mapKeys(result).forEach(key => {
    const value = result[key];
    if (isSharedValue(value)) {
      result[key] = value.value;
    }
  });
  return result;
};
export const composeDeclarations = (filters, composer) => {
  "worklet";

  const len = filters.length;
  if (len <= 1) {
    return filters[0];
  }
  return filters.reduceRight((inner, outer) => inner ? composer(outer, inner) : outer);
};
//# sourceMappingURL=utils.js.map