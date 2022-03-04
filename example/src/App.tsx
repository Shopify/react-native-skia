import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "react-native";

import { HomeScreen } from "./Home/HomeScreen";
import {
  AnimationExample,
  DrawingExample,
  GraphsScreen,
  Neumorphism,
  API,
  Breathe,
  Filters,
  Gooey,
  Hue,
  Matrix,
  Aurora,
  Glassmorphism,
} from "./Examples";

const App = () => {
  const Stack = createNativeStackNavigator();
  return (
    <>
      <StatusBar hidden />
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: "🎨 Skia",
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
          <Stack.Screen name="Drawing" component={DrawingExample} />
          <Stack.Screen name="Graphs" component={GraphsScreen} />
          <Stack.Screen name="Animation" component={AnimationExample} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

// eslint-disable-next-line import/no-default-export
export default App;
