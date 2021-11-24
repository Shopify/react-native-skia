import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { Routes } from "./Routes";
import { List } from "./List";
import { PathEffect } from "./PathEffect";
import { Shapes } from "./Shapes";
import { Clipping } from "./Clipping2";
import { Transform } from "./Transform";
import { ColorFilter } from "./ColorFilter";
import { Gradients } from "./Gradients";
import { Path } from "./Path";

const Stack = createNativeStackNavigator<Routes>();
export const API = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="List"
        component={List}
        options={{
          title: "🎨 Skia",
          header: () => null,
        }}
      />
      <Stack.Screen
        name="Shapes"
        component={Shapes}
        options={{
          title: "🔺 Shapes",
        }}
      />
      <Stack.Screen
        name="ColorFilter"
        component={ColorFilter}
        options={{
          title: "🌃 Color & Image Filters",
        }}
      />
      <Stack.Screen
        name="Gradients"
        component={Gradients}
        options={{
          title: "🌈 Gradients",
        }}
      />
      <Stack.Screen
        name="Clipping"
        component={Clipping}
        options={{
          title: "✂️ Clipping",
        }}
      />
      <Stack.Screen
        name="Path"
        component={Path}
        options={{
          title: "🥾 Paths",
        }}
      />
      <Stack.Screen
        name="PathEffect"
        component={PathEffect}
        options={{
          title: "⭐️ Path Effects",
        }}
      />
      <Stack.Screen
        name="Transform"
        component={Transform}
        options={{
          title: "🔄 Transformations",
        }}
      />
    </Stack.Navigator>
  );
};
