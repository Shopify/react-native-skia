import React from "react";
import { View, StyleSheet, Text } from "react-native";

const styles = StyleSheet.create({
  container: {
    padding: 16,
    height: 96,
  },
  title: {
    fontFamily: "Helvetica",
    fontSize: 20,
    color: "white",
    textAlign: "center",
  },
});

export const Header = () => {
  return (
    <View style={styles.container}>
      <View style={[StyleSheet.absoluteFill, { justifyContent: "center" }]}>
        <Text style={styles.title}>Etherum</Text>
      </View>
    </View>
  );
};
