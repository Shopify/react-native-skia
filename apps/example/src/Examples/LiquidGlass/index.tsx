import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { Routes } from "./Routes";
import { List } from "./List";
import { LiquidShape } from "./LiquidShape";
import { DisplacementMap1 } from "./DisplacementMap1";
import { DisplacementMap2 } from "./DisplacementMap2";

const Stack = createNativeStackNavigator<Routes>();
export const LiquidGlass = () => {
  return (
    <Stack.Navigator initialRouteName="DisplacementMap2">
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
        name="DisplacementMap1"
        component={DisplacementMap1}
        options={{
          title: "🗺️  Displacement Map 1",
        }}
      />
      <Stack.Screen
        name="DisplacementMap2"
        component={DisplacementMap2}
        options={{
          title: "🗺️  Displacement Map 2",
        }}
      />
    </Stack.Navigator>
  );
};
