import React from "react";
import type { ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";

export type BaseToolbarProps = {
  style?: ViewStyle;
  vertical?: boolean;
};
export const BaseToolbar: React.FC<BaseToolbarProps> = ({
  children,
  vertical = false,
  style,
}) => {
  return (
    <View
      style={[
        style,
        vertical
          ? [styles.container, styles.verticalContainer]
          : styles.container,
      ]}
    >
      {children}
    </View>
  );
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
});
