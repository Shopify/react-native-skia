import type { Vector } from "@exodus/react-native-skia";
import {
  Circle,
  Group,
  BackdropFilter,
  Blur,
  Fill,
  Skia,
} from "@exodus/react-native-skia";

const r = 100;

interface PointerProps {
  pos: Vector;
}

export const Pointer = ({ pos }: PointerProps) => {
  const clip = Skia.Path.Make();
  clip.addCircle(pos.x, pos.y, 100);
  return (
    <Group>
      <BackdropFilter filter={<Blur blur={100} mode="clamp" />} clip={clip}>
        <Fill color="rgba(255, 255, 255, 0.2)" />
        <Circle
          c={pos}
          r={r - 5}
          color="rgba(255, 255, 255, 0.2)"
          style="stroke"
          strokeWidth={5}
        />
      </BackdropFilter>
    </Group>
  );
};
