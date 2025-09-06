import React from "react";
import type { SkPath } from "@shopify/react-native-skia";
import { fitbox, rect, Path, Skia } from "@shopify/react-native-skia";

export type IconName = "plus" | "search" | "credit-card" | "more" | "cast";

interface IconProps {
  name: IconName;
  size: number;
}

const plus = Skia.Path.Make();
plus.moveTo(12, 5);
plus.lineTo(12, 19);
plus.moveTo(5, 12);
plus.lineTo(19, 12);

const search = Skia.Path.Make();
search.addCircle(11, 11, 8);
search.moveTo(21, 21);
search.lineTo(16.65, 16.65);

const creditCard = Skia.Path.Make();
creditCard.addRRect(Skia.RRectXY(Skia.XYWHRect(1, 4, 22, 16), 2, 2));
creditCard.moveTo(1, 10);
creditCard.lineTo(23, 10);

const more = Skia.Path.Make();
more.addCircle(12, 12, 1);
more.addCircle(19, 12, 1);
more.addCircle(5, 12, 1);

const cast = Skia.Path.MakeFromSVGString(
  "M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"
)!;
// Small dot line
cast.moveTo(2, 20);
cast.lineTo(2.01, 20);

const paths: Record<IconName, SkPath> = {
  plus,
  search,
  "credit-card": cast,
  more,
  cast,
};

const src = rect(0, 0, 24, 24);

export const Icon = ({ name, size }: IconProps) => {
  const squareSize = size / Math.sqrt(2);
  const offset = (size - squareSize) / 2;
  const dst = rect(offset, offset, squareSize, squareSize);
  const path = paths[name];
  //const bounds = path.computeTightBounds();
  const transform = fitbox("contain", src, dst);
  return (
    <Path
      transform={[
        { translateX: -size / 2 },
        { translateY: -size / 2 },
        ...transform,
      ]}
      path={path}
      strokeWidth={2}
      color="black"
      style="stroke"
      strokeJoin="round"
      strokeCap="round"
    />
  );
};
