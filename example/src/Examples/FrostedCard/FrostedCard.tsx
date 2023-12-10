import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HEIGHT = 256;
const WIDTH = SCREEN_WIDTH * 0.9;

const CARD_HEIGHT = HEIGHT - 5;
const CARD_WIDTH = WIDTH - 5;

export const FrostedCard = () => {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onChange((event) => {
      rotateY.value += event.changeX / 10;
      rotateX.value -= event.changeY / 10;
    })
    .onFinalize(() => {
      rotateX.value = withSpring(0);
      rotateY.value = withSpring(0);
    });

  const rStyle = useAnimatedStyle(() => {
    const rotateXvalue = `${rotateX.value}deg`;
    const rotateYvalue = `${rotateY.value}deg`;

    return {
      transform: [
        {
          perspective: 300,
        },
        { rotateX: rotateXvalue },
        { rotateY: rotateYvalue },
      ],
    };
  }, []);

  return (
    <View style={styles.container}>
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            {
              height: CARD_HEIGHT,
              width: CARD_WIDTH,
              backgroundColor: "black",
              position: "absolute",
              borderRadius: 20,
              zIndex: 300,
            },
            rStyle,
          ]}
        >
          <View
            style={{
              position: "absolute",
              bottom: "10%",
              left: "10%",
              flexDirection: "row",
            }}
          >
            <View
              style={{
                height: 50,
                aspectRatio: 1,
                borderRadius: 25,
                backgroundColor: "#272F46",
              }}
            />
            <View
              style={{
                flexDirection: "column",
                marginLeft: 10,
                justifyContent: "space-around",
              }}
            >
              <View
                style={{
                  height: 20,
                  width: 80,
                  borderRadius: 25,
                  backgroundColor: "#272F46",
                }}
              />
              <View
                style={{
                  height: 20,
                  width: 80,
                  borderRadius: 25,
                  backgroundColor: "#272F46",
                }}
              />
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
