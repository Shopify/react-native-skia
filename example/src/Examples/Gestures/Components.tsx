import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const Padding = 10;

export const GestureDemo: React.FC<{ title: string }> = ({
  title,
  children,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{title}</Text>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    paddingHorizontal: Padding / 2,
  },
  text: {
    fontWeight: "bold",
    marginBottom: 8,
  },
});
