/* eslint-disable @typescript-eslint/no-explicit-any */
import { Canvas } from "@shopify/react-native-skia";
import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useSharedValue } from "react-native-reanimated";

import { BreatheScreen } from "./BreatheScreen";

const Screen = () => {
  const size = useSharedValue({ width: 0, height: 0 });
  return (
    <View style={{ width: 100, height: 100 }}>
      <Canvas style={StyleSheet.absoluteFill} onSize={size}>
        <BreatheScreen />
      </Canvas>
    </View>
  );
};

const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const Breathe = () => {
  const [screens, setScreens] = useState<any>([]);

  const addScreen = () => {
    setScreens((prevScreens: any) => [
      ...prevScreens,
      { id: Date.now() + Math.random(), component: <Screen /> },
    ]);
  };

  const removeScreen = () => {
    setScreens((prevScreens: any) => {
      if (prevScreens.length === 0) {
        return prevScreens;
      }
      const indexToRemove = Math.floor(Math.random() * prevScreens.length);
      return prevScreens.filter(
        (_: any, index: number) => index !== indexToRemove
      );
    });
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (Math.random() > 0.5) {
        addScreen();
      } else {
        removeScreen();
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {screens.map((screen: any) => (
        <React.Fragment key={screen.id}>{screen.component}</React.Fragment>
      ))}
    </View>
  );
};
