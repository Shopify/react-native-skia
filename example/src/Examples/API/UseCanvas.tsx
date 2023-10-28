import type { SkSize } from "@shopify/react-native-skia";
import { Canvas, Fill, Group, Rect, rect } from "@shopify/react-native-skia";
import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useContextBridge } from "its-fine";
import type { SharedValue } from "react-native-reanimated";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";

interface MyCompProps {
  size: SharedValue<SkSize>;
}

const MyComp = ({ size }: MyCompProps) => {
  const navigation = useNavigation();
  const { routeNames } = navigation.getState();
  console.log({ routeNames });
  const rct = useDerivedValue(() => {
    return rect(0, 0, size.value.width, size.value.height / 2);
  }, [size]);
  return (
    <Group>
      <Fill color="magenta" />
      <Rect color="cyan" rect={rct} />
    </Group>
  );
};

export const UseCanvas = () => {
  const Bridge = useContextBridge();
  const size = useSharedValue({ width: 0, height: 0 });
  const height = useRef(new Animated.Value(0));
  useEffect(() => {
    Animated.loop(
      Animated.timing(height.current, {
        toValue: 500,
        duration: 4000,
        useNativeDriver: false,
      })
    ).start();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Canvas style={{ flex: 1 }} onSize={size}>
        <Bridge>
          <MyComp size={size} />
        </Bridge>
      </Canvas>
      <Animated.View style={{ height: height.current }} />
    </View>
  );
};
