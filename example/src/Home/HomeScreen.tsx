import React from "react";
import { StyleSheet, ScrollView } from "react-native";

import { HomeScreenButton } from "./HomeScreenButton";

export const HomeScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <HomeScreenButton title="API" description="API examples" route="API" />
      <HomeScreenButton
        title="🧘 Breathe"
        description="Simple declarative example"
        route="Breathe"
      />
      <HomeScreenButton
        title="🏞 Filters"
        description="Simple Image Filters"
        route="Filters"
      />
      <HomeScreenButton
        title="🟣 Gooey Effect"
        description="Simple Gooey effect"
        route="Gooey"
      />
      <HomeScreenButton
        title="💡 Hue"
        description="Hue Color Selection"
        route="Hue"
      />
      <HomeScreenButton
        title="🌧 Digital Rain"
        description="Digital Rain"
        route="Matrix"
      />
      <HomeScreenButton
        title="☀️ Aurora"
        description="Aurora Design via Mesh Gradients"
        route="Aurora"
      />
      <HomeScreenButton
        title="🖌 Drawing"
        description="Use touches to draw with Skia"
        route="Drawing"
      />
      <HomeScreenButton
        title="📉 Graphs"
        description="Animated graphs with Skia"
        route="Graphs"
      />
      <HomeScreenButton
        title="🎥 Animation"
        description="Animated with Skia"
        route="Animation"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
