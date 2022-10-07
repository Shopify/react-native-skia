import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Canvas } from "@shopify/react-native-skia";
import React, { useLayoutEffect, useMemo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import type { StackParamList } from "../types";

import { TestBackButton } from "./TestBackButton";
import { TestBattery } from "./TestBattery";
import { isTest, getByPath } from "./types";

const Size = Dimensions.get("window").width;

type Props = NativeStackScreenProps<StackParamList, "Test">;

export const TestScreen: React.FC<Props> = ({ route, navigation }) => {
  const test = useMemo(
    () => getByPath(route.params.path ?? [], TestBattery),
    [route?.params]
  );
  useLayoutEffect(() => {
    navigation.setOptions({ title: route.params.title ?? "Test" });
  }, [navigation, route.params.title]);

  return (
    <View style={styles.container}>
      <TestBackButton navigation={navigation} route={route} />
      <Canvas style={[styles.canvas, { width: Size, height: Size }]}>
        {test && isTest(test)
          ? test.component({ width: Size, height: Size })
          : null}
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvas: {
    borderColor: "black",
    borderWidth: StyleSheet.hairlineWidth,
  },
});
