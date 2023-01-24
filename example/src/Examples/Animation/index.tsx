import React, { useEffect, useState } from "react";
import { View, StyleSheet, Button, Image } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { AnimateTextOnPath } from "./AnimateTextOnPath";
import { AnimationWithTouchHandler } from "./AnimationWithTouchHandler";
import { InterpolationWithEasing } from "./InterpolationWithEasing";
import { SimpleAnimation } from "./SimpleAnimation";
import { SpringBackTouchAnimation } from "./SpringBackTouch";

function KeepJSBusy() {
  useEffect(() => {
    const interval = setInterval(() => {
      let sum = 0;
      for (let i = 0; i < 1e7; i++) {
        sum += i;
      }
    }, 30);
    return () => clearInterval(interval);
  }, []);
  return null;
}

function MakeJSSweatRow() {
  const [sweatJS, makeJSSweat] = useState(false);
  if (sweatJS) {
    return (
      <Animated.View
        key="sweat"
        entering={FadeInDown}
        style={{ flexDirection: "row", height: 40, justifyContent: "center" }}
      >
        <Image
          source={{
            uri: "https://www.streamscheme.com/wp-content/uploads/2020/06/monkas-emote.png",
          }}
          style={{ width: 40, height: 40 }}
        />
        <Button title="Stop it!" onPress={() => makeJSSweat(false)} />

        <KeepJSBusy />
      </Animated.View>
    );
  } else {
    return (
      <Animated.View key="nosweat" entering={FadeInDown} style={{ height: 40 }}>
        <Button title="Make JS sweat" onPress={() => makeJSSweat(true)} />
      </Animated.View>
    );
  }
}

export const AnimationExample: React.FC = () => {
  return (
    <View style={styles.container}>
      <MakeJSSweatRow />
      <SimpleAnimation />
      <InterpolationWithEasing />
      <AnimationWithTouchHandler />
      <AnimateTextOnPath />
      <SpringBackTouchAnimation />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingBottom: 80,
  },
});
