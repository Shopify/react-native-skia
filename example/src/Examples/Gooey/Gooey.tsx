import { Canvas, Fill, vec } from "@shopify/react-native-skia";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const center = vec(width / 2, height / 2 - 64);

export const Gooey = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="lightblue" />
    </Canvas>
  );
};
