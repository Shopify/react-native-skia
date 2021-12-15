import React from "react";
import { StyleSheet, View } from "react-native";

import { HomeScreenButton } from "./HomeScreenButton";

export const HomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
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
        title="Drawing"
        description="Use touches to draw with Skia"
        route="Drawing"
      />
      <HomeScreenButton
        title="Animation"
        description="Animated with Skia"
        route="Animation"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
