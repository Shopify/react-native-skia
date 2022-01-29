import { StyleSheet } from "react-native";

export const ToolbarItemSize = 26;

export const styles = StyleSheet.create({
  container: {
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  toolbarItem: {
    width: ToolbarItemSize,
    height: ToolbarItemSize,
  },
  colorItem: {
    width: ToolbarItemSize,
    height: ToolbarItemSize,
    borderRadius: ToolbarItemSize / 2,
  },
  selected: {
    backgroundColor: "#CCC",
    borderRadius: 4,
  },
  disabled: {
    opacity: 0.4,
  },
});
