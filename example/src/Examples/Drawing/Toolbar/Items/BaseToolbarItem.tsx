import React from "react";
import { TouchableOpacity, View } from "react-native";

import { styles } from "./styles";

export type BaseToolbarItemProps = {
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
};

export const BaseToolbarItem: React.FC<BaseToolbarItemProps> = ({
  selected,
  disabled,
  onPress,
  children,
}) => {
  return disabled ? (
    <View
      style={[
        styles.container,
        styles.disabled,
        selected ? styles.selected : {},
      ]}
    >
      {children}
    </View>
  ) : (
    <TouchableOpacity
      style={[styles.container, selected ? styles.selected : {}]}
      onPress={onPress}
    >
      {children}
    </TouchableOpacity>
  );
};
