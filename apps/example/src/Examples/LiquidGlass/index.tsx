import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { Routes } from "./Routes";
import { List } from "./List";
import { LiquidShape } from "./LiquidShape";
import { DisplacementMapExample } from "./DisplacementMap";

const Stack = createNativeStackNavigator<Routes>();
export const LiquidGlass = () => {
  return (
    <Stack.Navigator initialRouteName="LiquidShape">
      <Stack.Screen
        name="List"
        component={List}
        options={{
          title: "💧 Liquid Glass",
          header: () => null,
        }}
      />
      <Stack.Screen
        name="LiquidShape"
        component={LiquidShape}
        options={{
          title: "🔘 Liquid Shape",
        }}
      />
      <Stack.Screen
        name="DisplacementMap"
        component={DisplacementMapExample}
        options={{
          title: "🗺️  Displacement Map",
        }}
      />
    </Stack.Navigator>
  );
};
