import type { PatchProps } from "@shopify/react-native-skia";
import { Path, Skia } from "@shopify/react-native-skia";
import React from "react";

interface CurvesProps {
  patch: () => PatchProps["patch"];
}

export const Curves = ({ patch }: CurvesProps) => {
  return (
    <Path
      path={() => {
        const [p1, p2, p3, p4] = patch();
        const path = Skia.Path.Make();
        path.moveTo(p1.pos.x, p1.pos.y);
        path.cubicTo(p1.c2.x, p1.c2.y, p2.c1.x, p2.c1.y, p2.pos.x, p2.pos.y);
        path.cubicTo(p2.c2.x, p2.c2.y, p3.c1.x, p3.c1.y, p3.pos.x, p3.pos.y);
        path.cubicTo(p3.c2.x, p3.c2.y, p4.c1.x, p4.c1.y, p4.pos.x, p4.pos.y);
        path.cubicTo(p4.c2.x, p4.c2.y, p1.c1.x, p1.c1.y, p1.pos.x, p1.pos.y);
        return path;
      }}
      color="white"
      strokeWidth={2}
      style="stroke"
    />
  );
};
