import React from "react";
import {
  BlendColor,
  Canvas,
  fitbox,
  Group,
  ImageSVG,
  Paint,
  Skia,
  usePaintRef,
  useSVG,
} from "@shopify/react-native-skia";

const icons = {
  close: require("./assets/close.svg"),
  activity: require("./assets/activity.svg"),
  arrow: require("./assets/arrow.svg"),
  battery: require("./assets/battery.svg"),
  bluetooth: require("./assets/bluetooth.svg"),
  book: require("./assets/book.svg"),
  cpu: require("./assets/cpu.svg"),
};

interface IconProps {
  name: keyof typeof icons;
  size: number;
  color?: string;
}

export const Icon = ({ name, size, color = "black" }: IconProps) => {
  const svg = useSVG(icons[name]);
  const paint = usePaintRef();
  return (
    <Canvas style={{ height: size, width: size }}>
      <Paint ref={paint}>
        <BlendColor color={color} mode="srcIn" />
      </Paint>
      <Group
        layer={paint}
        transform={fitbox(
          "contain",
          Skia.XYWHRect(0, 0, 24, 24),
          Skia.XYWHRect(0, 0, size, size)
        )}
      >
        {svg && <ImageSVG svg={svg} x={0} y={0} width={24} height={24} />}
      </Group>
    </Canvas>
  );
};
