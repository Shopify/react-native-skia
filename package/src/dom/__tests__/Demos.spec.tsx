import { mapKeys } from "../../renderer/typeddash";
import { importSkia, width, height } from "../../renderer/__tests__/setup";
import { setupSkia } from "../../skia/__tests__/setup";
import { processResult } from "../../__tests__/setup";
import type { Node } from "../types";
import { isMatrix } from "../../skia/types/Matrix";

describe("Drawings", () => {
  it("Hello World", () => {
    const { surface, canvas } = setupSkia(width, height);
    const { Skia, vec, polar2Canvas } = importSkia();
    const c = vec(width / 2, height / 2);
    const c1 = Skia.Color("#61bea2");
    const c2 = Skia.Color("#529ca0");
    const R = width / 4;
    const color = Skia.Color("rgb(36,43,56)");
    const root = Sk.Group({ color });
    root.addChild(Sk.Fill());
    const rings = Sk.Group({
      blendMode: "screen",
    });
    const blur = Sk.BlurMaskFilter({
      blur: 10,
      style: "solid",
      respectCTM: true,
    });
    expect(blur.isMaskFilter()).toBe(true);
    rings.addChild(blur);
    for (let i = 0; i < 6; i++) {
      const theta = (i * (2 * Math.PI)) / 6;
      const matrix = Skia.Matrix();
      const { x, y } = polar2Canvas({ theta, radius: R }, { x: 0, y: 0 });
      matrix.translate(x, y);
      const ring = Sk.Group({
        matrix,
        color: i % 2 ? c1 : c2,
      });
      ring.addChild(Sk.Circle({ c, r: R }));
      rings.addChild(ring);
    }
    root.addChild(rings);
    console.log(asXML(root));
    const ctx = { canvas, paint: Skia.Paint(), opacity: 1, Skia };
    root.render(ctx);
    processResult(surface, "snapshots/demos/breathe2.png", true);
  });
});

// TODO: add test where each circle is not around a group

const asValue = (value: unknown) => {
  if (value instanceof Float32Array) {
    return Array.from(value)
      .map((v) => Math.round(v * 100) / 100)
      .join(", ");
  } else if (isMatrix(value)) {
    // TODO: https://github.com/Shopify/react-native-skia/issues/715
    return "m3x3";
  } else if (
    typeof value === "object" &&
    value !== null &&
    "x" in value &&
    "y" in value
  ) {
    const v = value as { x: number; y: number };
    return `{x:${v.x}, y:${v.y}}`;
  }
  return value;
};

// Print nodes as XML tree
const asXML = (node: Node<unknown>, indent = 0): string => {
  // TODO: remove cast
  const hasChildren = node.children().length > 0;
  const props = node.getProps() as object;
  const space = new Array(indent).fill(" ").join("");
  if (hasChildren) {
    return `${space}<${node.type} ${mapKeys(props)
      .map((name) => `${name}="${asValue(props[name])}"`)
      .join(" ")}>
${node.children().map((child) => asXML(child, indent + 2)).join(`
`)}
${space}</${node.type}>`;
  } else {
    return `${space}<${node.type} ${mapKeys(props)
      .map((name) => `${name}="${asValue(props[name])}"`)
      .join(" ")} />`;
  }
};
