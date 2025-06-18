"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.processUniforms = exports.isShader = void 0;
const isShader = obj => obj !== null && obj.__typename__ === "Shader";
exports.isShader = isShader;
const isVector = obj => {
  "worklet";

  // We have an issue to check property existence on JSI backed instances
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return obj.x !== undefined && obj.y !== undefined;
};
function processValue(values, value) {
  "worklet";

  if (typeof value === "number") {
    values.push(value);
  } else if (Array.isArray(value)) {
    value.forEach(v => processValue(values, v));
  } else if (isVector(value)) {
    values.push(value.x, value.y);
  } else if (value instanceof Float32Array) {
    values.push(...value);
  }
}
const processUniforms = (source, uniforms, builder) => {
  "worklet";

  const result = [];
  const uniformsCount = source.getUniformCount();
  for (let i = 0; i < uniformsCount; i++) {
    const name = source.getUniformName(i);
    const value = uniforms[name];
    if (value === undefined) {
      throw new Error(
      // eslint-disable-next-line max-len
      `The runtime effect has the uniform value "${name}" declared, but it is missing from the uniforms property of the Runtime effect.`);
    }
    if (builder === undefined) {
      processValue(result, value);
    } else {
      const uniformValue = [];
      processValue(uniformValue, value);
      builder.setUniform(name, uniformValue);
      result.push(...uniformValue);
    }
  }
  return result;
};
exports.processUniforms = processUniforms;
//# sourceMappingURL=Shader.js.map