import { View, useWindowDimensions } from "react-native";
import { Canvas, Circle, Fill } from "@shopify/react-native-skia";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

const radius = 30;

const useBallTracker = (defaultX: number, defaultY: number) => {
  // The position of the ball
  const x = useSharedValue(defaultX);
  const y = useSharedValue(defaultY);
  // This is the style we will apply to the "invisible" animated view
  // that will overlay the ball
  const style = useAnimatedStyle(() => ({
    position: "absolute",
    top: -radius,
    left: -radius,
    width: radius * 2,
    height: radius * 2,
    backgroundColor: "rgba(100, 200, 300, 0.4)",
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));
  // The gesture handler for the ball
  const gesture = Gesture.Pan().onChange((e) => {
    x.value += e.x;
    y.value += e.y;
  });
  return [x, y, gesture, style];
};

export const App = () => {
  // The position of the ball
  const x = useSharedValue(100);
  const y = useSharedValue(100);
  // This is the style we will apply to the "invisible" animated view
  // that will overlay the ball
  const style = useAnimatedStyle(() => ({
    position: "absolute",
    top: -radius,
    left: -radius,
    width: radius * 2,
    height: radius * 2,
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));
  // The gesture handler for the ball
  const gesture = Gesture.Pan().onChange((e) => {
    x.value += e.x;
    y.value += e.y;
  });
  return (
    <View style={{ flex: 1 }}>
      <Canvas style={{ flex: 1 }}>
        <Fill color="white" />
        <Circle cx={x} cy={y} r={radius} color="cyan" />
      </Canvas>
      <GestureDetector gesture={gesture}>
        <Animated.View style={style} />
      </GestureDetector>
    </View>
  );
};

export default App;
