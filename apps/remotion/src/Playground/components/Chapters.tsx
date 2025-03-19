import type { SkPath } from "@exodus/react-native-skia";
import {
  processTransform2d,
  DashPathEffect,
  Path,
  fitbox,
  bottomRight,
  Fill,
  LinearGradient,
  mix,
  rect,
  rrect,
  Skia,
  topLeft,
  Text,
  vec,
  Group,
} from "@exodus/react-native-skia";

import {
  CANVAS,
  useTypefaces,
  center,
  PathLine2,
  PathCircle2,
} from "../../components";

const { width, height } = CANVAS;
const r = 100;
const SIZE = 375;
const intervals = [16, 16];

interface ChapterProps {
  progress: number;
  colors: string[];
  title: string;
  icon: SkPath;
  progress2: number;
  min?: boolean;
  normalize?: boolean;
}

export const Chapter = ({
  progress,
  colors,
  title,
  icon,
  progress2,
  min,
}: ChapterProps) => {
  const { RubikMedium } = useTypefaces();
  const font = Skia.Font(RubikMedium, 125);
  const textWidth = font.getTextWidth(title);
  const size = mix(progress, min ? width / 2 : width + r, SIZE * 2);
  const baseRect = rect((width - size) / 2, (height - size) / 2, size, size);
  const roundedRect = rrect(baseRect, r, r);
  const rotate = Math.PI / 4;
  const r1 = 0.61 * SIZE;
  const r2 = r1 / Math.cos(rotate);
  const r3 = r2 * Math.sin(rotate);
  const r4 = r1;
  const bounds = icon.computeTightBounds();
  icon.transform(
    processTransform2d(
      fitbox(
        "contain",
        bounds,
        rect(center.x - r4, center.y - r4, r4 * 2, r4 * 2)
      )
    )
  );
  return (
    <>
      <Text
        x={(width - textWidth) / 2}
        y={center.y + 600}
        text={title}
        font={font}
      />
      <Group clip={roundedRect}>
        <Fill>
          <LinearGradient
            colors={colors}
            start={topLeft(baseRect)}
            end={bottomRight(baseRect)}
          />
        </Fill>
        <Group style="stroke" strokeWidth={6} color="rgba(255,255,255,0.2)">
          <PathLine2
            p1={vec(0, center.y)}
            p2={vec(width, center.y)}
            end={progress}
          />
          <PathLine2
            p1={vec(center.x, 0)}
            p2={vec(center.x, height)}
            end={progress}
          />
          <Group transform={[{ rotate }]} origin={center}>
            <PathLine2
              p2={vec(0, center.y)}
              p1={vec(width, center.y)}
              end={progress}
            />
          </Group>
          <Group transform={[{ rotate: -rotate }]} origin={center}>
            <PathLine2
              p2={vec(0, center.y)}
              p1={vec(width, center.y)}
              end={progress}
            />
          </Group>
          <PathCircle2 c={center} r={r1} end={progress} />
          <PathCircle2 c={center} r={r2} start={1 - progress} />
          <PathLine2
            p1={vec(center.x - r1, 0)}
            p2={vec(center.x - r1, height)}
            end={progress}
          >
            <DashPathEffect intervals={intervals} />
          </PathLine2>
          <PathLine2
            p2={vec(center.x + r1, 0)}
            p1={vec(center.x + r1, height)}
            end={progress}
          >
            <DashPathEffect intervals={intervals} />
          </PathLine2>
          <PathLine2
            p2={vec(0, center.y - r3)}
            p1={vec(width, center.y - r3)}
            end={progress}
          >
            <DashPathEffect intervals={intervals} />
          </PathLine2>
          <PathLine2
            p1={vec(0, center.y + r3)}
            p2={vec(width, center.y + r3)}
            end={progress}
          >
            <DashPathEffect intervals={intervals} />
          </PathLine2>
          <Path
            color="rgba(255,255,255,0.5)"
            path={icon}
            end={progress2}
            strokeWidth={48}
            strokeCap="round"
            strokeJoin="round"
          />
        </Group>
      </Group>
    </>
  );
};
