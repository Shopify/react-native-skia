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
        title="Drawing"
        description="Use touches to draw with Skia"
        route="Drawing"
      />
      <HomeScreenButton
        title="Animation"
        description="Animation with Skia"
        route="Animation"
      />
      <HomeScreenButton
        title="Physics"
        description="Box2D physics with Skia"
        route="Physics"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
