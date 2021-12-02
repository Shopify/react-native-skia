import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { HomeScreen } from "./Home";
import {
  DrawingExample,
  API,
  Breathe,
  Filters,
  Gooey,
  AnimationExample,
} from "./Examples";

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
        <Stack.Screen name="Gooey" component={Gooey} />
        <Stack.Screen name="Drawing" component={DrawingExample} />
        <Stack.Screen name="Animation" component={AnimationExample} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// eslint-disable-next-line import/no-default-export
export default App;
