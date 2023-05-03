import { Canvas, Fill, useTouchHandler } from "@shopify/react-native-skia";
import { render } from "@testing-library/react-native";
import * as React from "react";

//import { Gooey } from "./Gooey";

const Test = () => {
  const onTouch = useTouchHandler({});
  return (
    <Canvas style={{ flex: 1 }} onTouch={onTouch}>
      <Fill color="cyan" />
    </Canvas>
  );
};

it("renders correctly", () => {
  render(<Test />);
});
