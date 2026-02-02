import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { Routes } from "./Routes";
import { List } from "./List";
import { Triangle } from "./Triangle";
import { Wireframes } from "./Wireframes";

const Stack = createNativeStackNavigator<Routes>();

export const WebGPU = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="List"
        component={List}
        options={{
          title: "WebGPU",
          header: () => null,
        }}
      />
      <Stack.Screen
        name="Triangle"
        component={Triangle}
        options={{
          title: "Triangle",
        }}
      />
      <Stack.Screen
        name="Wireframes"
        component={Wireframes}
        options={{
          title: "Wireframes",
          header: () => null,
        }}
      />
    </Stack.Navigator>
  );
};
