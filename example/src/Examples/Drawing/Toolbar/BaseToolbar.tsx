import React from "react";
import type { ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";

type Direction = "vertical" | "horizontal" | "square";

export type BaseToolbarProps = {
  style?: ViewStyle;
  mode?: Direction | undefined;
};
export const BaseToolbar: React.FC<BaseToolbarProps> = ({
  children,
  mode = "horizontal",
  style,
}) => {
  return <View style={[style, getStyleFromMode(mode)]}>{children}</View>;
};

const getStyleFromMode = (mode: Direction) => {
  switch (mode) {
    case "vertical":
      return [styles.container, styles.verticalContainer];
    case "horizontal":
      return styles.container;
    default:
      return [styles.container, styles.squareContainer];
  }
};

export const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#DDD",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  verticalContainer: {
    flexDirection: "column",
    paddingHorizontal: 4,
    paddingVertical: 14,
  },
  squareContainer: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
});
