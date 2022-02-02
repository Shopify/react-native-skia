import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "react-native";

import { AnimationExample, DrawingExample, GraphsScreen } from "./Examples";
import { API } from "./Examples/API";
import { Breathe } from "./Examples/Breathe";
import { Filters } from "./Examples/Filters";
import { Gooey } from "./Examples/Gooey";
import { Hue } from "./Examples/Hue";
import { Matrix } from "./Examples/Matrix";
import { HomeScreen } from "./Home";

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
