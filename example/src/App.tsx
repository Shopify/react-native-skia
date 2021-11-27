import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import {
  HomeScreen,
  DrawingExample,
  AnimationExample,
  PhysicsExample,
} from "./Examples";
import { API } from "./API";
import { Breathe } from "./Breathe";
import { Filters } from "./Filters";

const App = () => {
  const Stack = createNativeStackNavigator();
  return (
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
        <Stack.Screen name="Drawing" component={DrawingExample} />
        <Stack.Screen name="Animation" component={AnimationExample} />
        <Stack.Screen name="Physics" component={PhysicsExample} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// eslint-disable-next-line import/no-default-export
export default App;
