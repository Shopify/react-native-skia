import React from "react";
import { Text, View, StyleSheet } from "react-native";

import { graphs, WIDTH } from "../Model";

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  container: {
    backgroundColor: "#272636",
    borderRadius: 16,
    flexDirection: "row",
  },
  button: {
    height: 64,
    width: (WIDTH - 32) / graphs.length,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  label: {
    fontFamily: "Helevtica",
    fontSize: 16,
    color: "white",
    textAlign: "center",
  },
});

export const Selection = () => {
  return (
    <View style={styles.root}>
      <View style={styles.container}>
        {graphs.map((graph, index) => (
          <View key={index} style={styles.button}>
            <Text style={styles.label}>{graph.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};
