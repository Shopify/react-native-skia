import { useMemo } from "react";
import type { Font } from "opentype.js";
import { Path, Group, Skia, Blur, mix } from "@exodus/react-native-skia";
import { interpolate, random } from "remotion";

import { EASE_CLAMP } from "../animations";

interface TextDataProps {
  font: Font;
  text: string;
  fontSize: number;
}

export const getTextBoundingBox = ({ font, text, fontSize }: TextDataProps) => {
  const box = font.getPath(text, 0, fontSize, fontSize).getBoundingBox();
  return Skia.XYWHRect(box.x1, box.y1, box.x2 - box.x1, box.y2 - box.y1);
};

export const getTextPath = ({ font, text, fontSize }: TextDataProps) => {
  return Skia.Path.MakeFromSVGString(
    font.getPath(text, 0, fontSize, fontSize).toPathData(1)
  )!;
};

export const getTextPaths = ({ font, text, fontSize }: TextDataProps) => {
  return font
    .getPaths(text, 0, fontSize, fontSize)
    .map((path) => Skia.Path.MakeFromSVGString(path.toPathData(1))!);
};

interface TextRevealProps extends TextDataProps {
  color: string;
  progress: number;
  maxBlur?: number;
}

export const TextBlurReveal = ({
  font,
  color,
  text,
  fontSize,
  progress,
  maxBlur = 50,
}: TextRevealProps) => {
  const paths = useMemo(() => {
    return getTextPaths({ font, text, fontSize });
  }, [font, fontSize, text]);
  const delta = 1 / text.length;
  return (
    <Group>
      {paths.map((path, i) => {
        const p = interpolate(
          progress,
          [(i - 1) * delta, Math.min(i + 2, text.length - 1) * delta],
          [0, 1]
        );
        return (
          <Group key={i}>
            <Path path={path} color={color} opacity={progress}>
              <Blur blur={mix(p, maxBlur, 0)} />
            </Path>
          </Group>
        );
      })}
    </Group>
  );
};

export const TextReveal = ({
  font,
  color,
  text,
  fontSize,
  progress,
}: TextRevealProps) => {
  const p1 = interpolate(progress, [0, 0.6], [0, 1], EASE_CLAMP);
  const p2 = interpolate(progress, [0.5, 1], [0, 1], EASE_CLAMP);
  const paths = useMemo(() => {
    return getTextPaths({ font, text, fontSize });
  }, [font, fontSize, text]);
  return (
    <Group>
      {paths.map((path, i) => {
        const offset = random(i);
        const start = interpolate(p1, [0, 1], [offset, 0]);
        const end = interpolate(p1, [0, 1], [offset, 1]);
        return (
          <Group key={i}>
            <Path
              path={path}
              color={color}
              style="stroke"
              strokeWidth={6}
              start={start}
              end={end}
              strokeCap="round"
              strokeJoin="round"
            />
            <Path path={path} color={color} opacity={p2} />
          </Group>
        );
      })}
    </Group>
  );
};
