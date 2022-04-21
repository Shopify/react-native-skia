import React, { useMemo } from "react";
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import {
  Canvas,
  Path,
  Group,
  useTouchHandler,
  useValue,
  vec,
  Circle,
  Shadow,
} from "@shopify/react-native-skia";

import { graphs, PADDING, SIZE } from "./Model";
import { Header } from "./Header";
import { getYForX } from "./Math";

const { width } = Dimensions.get("window");

const SELECTION_WIDTH = width - 32;
const BUTTON_WIDTH = (width - 32) / graphs.length;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  backgroundSelection: {
    backgroundColor: "#f3f3f3",
    ...StyleSheet.absoluteFillObject,
    width: BUTTON_WIDTH,
    borderRadius: 8,
  },
  selection: {
    flexDirection: "row",
    width: SELECTION_WIDTH,
    alignSelf: "center",
  },
  labelContainer: {
    padding: 16,
    width: BUTTON_WIDTH,
  },
  label: {
    fontSize: 16,
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export const Graph = () => {
  const graph = graphs[0];
  const { path } = graph.data;
  const cmds = useMemo(() => path.toCmds(), [path]);
  const cursor = useValue(vec(0, 0));
  console.log({ cmds });

  const onTouch = useTouchHandler({
    onActive: ({ x }) => {
      cursor.current = { x, y: getYForX(cmds, x)! + PADDING };
    },
  });
  return (
    <View style={styles.container}>
      <Header />
      <View>
        <Canvas style={{ width: SIZE, height: SIZE }} onTouch={onTouch}>
          <Group transform={[{ translateY: PADDING }]}>
            <Path
              style="stroke"
              color="lightblue"
              path={path}
              strokeWidth={5}
              strokeJoin="round"
              strokeCap="round"
            />
          </Group>
          <Group>
            <Circle c={cursor} r={12} color="white">
              <Shadow dx={0} dy={0} color="rgba(0, 0, 0, 0.3)" blur={4} />
            </Circle>
            <Circle c={cursor} r={7} color="lightblue" />
          </Group>
        </Canvas>
      </View>
      <View style={styles.selection}>
        <View style={StyleSheet.absoluteFill}>
          <View style={styles.backgroundSelection} />
        </View>
        {graphs.map((graph) => {
          return (
            <TouchableWithoutFeedback key={graph.label} onPress={() => {}}>
              <View style={[styles.labelContainer]}>
                <Text style={styles.label}>{graph.label}</Text>
              </View>
            </TouchableWithoutFeedback>
          );
        })}
      </View>
    </View>
  );
};
