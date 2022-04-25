import React from "react";
import { Text, View, StyleSheet } from "react-native";

import { graphs } from "../Model";

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  container: {
    backgroundColor: "#272636",
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-evenly",
    padding: 16,
  },
  label: {
    fontFamily: "Helevtica",
    fontSize: 16,
    color: "white",
  },
});

interface SelectionProps {}

export const Selection = ({}: SelectionProps) => {
  return (
    <View style={styles.root}>
      <View style={styles.container}>
        {graphs.map((graph, index) => (
          <Text key={index} style={styles.label}>
            {graph.label}
          </Text>
        ))}
      </View>
    </View>
  );
};
