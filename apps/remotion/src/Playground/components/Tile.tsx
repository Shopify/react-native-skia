import type { SkImage, Vector } from "@shopify/react-native-skia";
import { center, rect, Group, Rect, Image } from "@shopify/react-native-skia";
import { Easing } from "remotion";

interface TileProps {
  pos: Vector;
  image: SkImage;
  progress: number;
}

export const Tile = ({ pos, image, progress }: TileProps) => {
  const rct = rect(pos.x, pos.y, image.width(), image.height());
  return (
    <Group
      transform={[{ scale: Easing.bezier(0.37, 0, 0.63, 1)(progress) }]}
      origin={center(rct)}
    >
      <Image image={image} rect={rct} />
      <Rect
        rect={rct}
        opacity={1 - Easing.bezier(0.37, 0, 0.63, 1)(progress)}
      />
    </Group>
  );
};

Tile.defaultProps = {
  progress: 0,
};
