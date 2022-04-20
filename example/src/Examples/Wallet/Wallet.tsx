import React from "react";
import { StyleSheet, View } from "react-native";

import { Graph } from "./Graph";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});

export const Wallet = () => {
  return (
    <View style={styles.container}>
      <Graph />
    </View>
  );
};
