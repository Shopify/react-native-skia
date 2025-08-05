import React from "react";
import { Text } from "react-native";
import { Canvas, Fill, useCanvasSize } from "@shopify/react-native-skia";

export const OnLayoutDemo = () => {
  const { ref, size } = useCanvasSize();
  // const [, forceUpdate] = useState({});

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     console.log("OnLayoutDemo size", size);
  //     forceUpdate({});
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, []);

  return (
    <>
      <Text>{`OnLayout: ${size?.width} / ${size?.height}`}</Text>
      <Canvas style={{ flex: 1 }} ref={ref}>
        <Fill color="red" />
      </Canvas>
    </>
  );
};
