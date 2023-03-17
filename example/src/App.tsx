import type { LinkingOptions } from "@react-navigation/native";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "react-native";
import type { HeaderBackButtonProps } from "@react-navigation/elements";
import { HeaderBackButton } from "@react-navigation/elements";
import { FiberProvider } from "its-fine";

import {
  AnimationExample,
  ReanimatedExample,
  API,
  Aurora,
  Breathe,
  Filters,
  Gooey,
  GraphsScreen,
  Hue,
  Matrix,
  Glassmorphism,
  Neumorphism,
  PerformanceDrawingTest,
  Wallpaper,
  Vertices,
  Wallet,
  Severance,
} from "./Examples";
import { CI, Tests } from "./Tests";
import { HomeScreen } from "./Home";
import type { StackParamList } from "./types";
import { useAssets } from "./Tests/useAssets";

const linking: LinkingOptions<StackParamList> = {
  config: {
    screens: {
      Home: "",
      Vertices: "vertices",
      API: "api",
      Breathe: "breathe",
      Filters: "filters",
      Gooey: "gooey",
      Hue: "hue",
      Matrix: "matrix",
      Severance: "severance",
      Aurora: "aurora",
      Glassmorphism: "glassmorphism",
      Neumorphism: "neumorphism",
      Wallpaper: "wallpaper",
      Wallet: "wallet",
      Graphs: "graphs",
      Animation: "animation",
      Reanimated: "reanimated",
      Performance: "performance",
      Tests: "test",
    },
  },
  prefixes: ["rnskia://"],
};

const HeaderLeft = (props: HeaderBackButtonProps) => {
  const navigation = useNavigation();
  return (
    <HeaderBackButton
      {...props}
      onPress={() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
      }}
      testID="back"
    />
  );
};

const App = () => {
  const Stack = createNativeStackNavigator<StackParamList>();
  const assets = useAssets();
  if (assets === null) {
    return null;
  }
  return (
    <FiberProvider>
      <StatusBar hidden />
      <NavigationContainer linking={linking}>
        <Stack.Navigator
          screenOptions={{
            headerLeft: HeaderLeft,
          }}
          initialRouteName={CI ? "Tests" : "Home"}
        >
          <Stack.Screen
            name="Home"
            key="Home"
            component={HomeScreen}
            options={{
              title: "🎨 Skia",
            }}
          />
          <Stack.Screen
            key="Tests"
            name="Tests"
            options={{
              title: "🔧 Tests",
            }}
          >
            {(props) => <Tests {...props} assets={assets} />}
          </Stack.Screen>
          <Stack.Screen
            name="Vertices"
            component={Vertices}
            options={{
              header: () => null,
            }}
          />
          <Stack.Screen name="API" component={API} />
          <Stack.Screen name="Breathe" component={Breathe} />
          <Stack.Screen name="Filters" component={Filters} />
          <Stack.Screen name="Gooey" component={Gooey} />
          <Stack.Screen name="Hue" component={Hue} />
          <Stack.Screen
            name="Matrix"
            component={Matrix}
            options={{
              header: () => null,
            }}
          />
          <Stack.Screen
            name="Severance"
            component={Severance}
            options={{
              header: () => null,
            }}
          />
          <Stack.Screen
            name="Aurora"
            component={Aurora}
            options={{
              header: () => null,
            }}
          />
          <Stack.Screen
            name="Glassmorphism"
            component={Glassmorphism}
            options={{
              header: () => null,
            }}
          />
          <Stack.Screen name="Neumorphism" component={Neumorphism} />
          <Stack.Screen
            name="Wallpaper"
            component={Wallpaper}
            options={{
              header: () => null,
            }}
          />
          <Stack.Screen
            name="Wallet"
            component={Wallet}
            options={{
              header: () => null,
            }}
          />
          <Stack.Screen name="Graphs" component={GraphsScreen} />
          <Stack.Screen name="Animation" component={AnimationExample} />
          <Stack.Screen name="Reanimated" component={ReanimatedExample} />
          <Stack.Screen name="Performance" component={PerformanceDrawingTest} />
        </Stack.Navigator>
      </NavigationContainer>
    </FiberProvider>
  );
};

// eslint-disable-next-line import/no-default-export
export default App;
