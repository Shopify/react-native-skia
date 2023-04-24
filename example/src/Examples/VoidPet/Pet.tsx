import React from "react";
import type { SkPath, SkRect } from "@shopify/react-native-skia";
import {
  rect,
  fitbox,
  bounds,
  Group,
  Path,
  Skia,
} from "@shopify/react-native-skia";
import type { SharedValue } from "react-native-reanimated";
import { useDerivedValue } from "react-native-reanimated";
import _ from "lodash";

import { exampleStartingPaths, exampleEndingPaths } from "./data";

interface PathDef {
  start: SkPath;
  end: SkPath;
  color: string;
}

interface PetDef {
  members: PathDef[];
  boundingBox: SkRect;
}

const startingGroup = _.groupBy(exampleStartingPaths, "props.fill");
const startingPaths = _.flatMap(startingGroup, (group: any) => {
  return {
    tagName: "path",
    props: {
      d: group.map((g: any) => g.props.d).join(" "),
      fill: group[0].props.fill,
    },
  };
});

const endingGroup = _.groupBy(exampleEndingPaths, "props.fill");
const endingPaths = _.flatMap(endingGroup, (group: any) => {
  return {
    tagName: "path",
    props: {
      d: group.map((g: any) => g.props.d).join(" "),
      fill: group[0].props.fill,
    },
  };
});

const pet: PetDef = {
  boundingBox: bounds(
    exampleStartingPaths.map((s) =>
      Skia.Path.MakeFromSVGString(s.props.d)!.computeTightBounds()
    )
  ),
  members: exampleStartingPaths.map((e, i) => {
    const start = Skia.Path.MakeFromSVGString(e.props.d)!;
    const end = Skia.Path.MakeFromSVGString(exampleEndingPaths[i].props.d)!;
    if (start.isInterpolatable(end) === false) {
      throw new Error("Paths are not interpolatable");
    }
    return {
      start,
      end,
      color: e.props.fill,
    };
  }),
};

interface PetProps {
  progress: SharedValue<number>;
  size: number;
}

export const Pet = ({ progress, size }: PetProps) => {
  const dst = rect(0, 0, size, size);
  return (
    <Group transform={fitbox("contain", pet.boundingBox, dst)}>
      {pet.members.map(({ start, end, color }, i) => (
        <Member
          key={i}
          start={start}
          end={end}
          color={color}
          progress={progress}
        />
      ))}
    </Group>
  );
};

interface MemberProps {
  start: SkPath;
  end: SkPath;
  color: string;
  progress: SharedValue<number>;
}

const Member = ({ start, end, color, progress }: MemberProps) => {
  const pathHolder = Skia.Path.Make();
  const path = useDerivedValue(() => {
    return end.interpolate(start, progress.value)!;
    //Skia.Path.MakeFromPathInterpolation(start, end, progress.value, pathHolder);
  });
  return <Path path={path} color={color} />;
};
