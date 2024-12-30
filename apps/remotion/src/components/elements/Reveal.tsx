import { Group, mix, Skia } from "@shopify/react-native-skia";
import type { ReactNode } from "react";

import { CANVAS, center } from "../Theme";

interface CircleRevealProps {
  progress: number;
  children: ReactNode;
}

const circle = Skia.Path.Make();
circle.addCircle(center.x, center.y, Math.hypot(CANVAS.width, CANVAS.height));

export const CircleReveal = ({ progress, children }: CircleRevealProps) => {
  const m3 = Skia.Matrix();
  m3.translate(center.x, center.y);
  const s = mix(progress, 0, 1);
  m3.scale(s, s);
  m3.translate(-center.x, -center.y);
  const clip = circle.copy();
  clip.transform(m3);
  return <Group clip={clip}>{children}</Group>;
};

export const SlideReveal = ({ progress, children }: CircleRevealProps) => {
  return (
    <Group
      clip={CANVAS}
      transform={[{ translateX: mix(progress, CANVAS.width, 0) }]}
    >
      {children}
    </Group>
  );
};
