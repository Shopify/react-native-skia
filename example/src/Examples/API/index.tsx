import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { Routes } from "./Routes";
import { List } from "./List";
import { PathEffectDemo } from "./PathEffect";
import { Shapes } from "./Shapes";
import { Clipping } from "./Clipping";
import { Transform } from "./Transform";
import { ColorFilter } from "./ColorFilter";
import { Gradients } from "./Gradients";
import { PathExample } from "./Path2";
import { Images } from "./Images";
import { SVG } from "./SVG";
import { BlendModes } from "./BlendModes";
import { Data } from "./Data";
import { ImageFilters } from "./ImageFilters";

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
        name="Images"
        component={Images}
        options={{
          title: "🏞 Images",
        }}
      />
      <Stack.Screen
        name="ColorFilter"
        component={ColorFilter}
        options={{
          title: "🌃 ColorFilters",
        }}
      />
      <Stack.Screen
        name="ImageFilters"
        component={ImageFilters}
        options={{
          title: "💧 Image Filters",
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
          title: "🎭 Clipping & Masking",
        }}
      />
      <Stack.Screen
        name="Path"
        component={PathExample}
        options={{
          title: "🥾 Paths",
        }}
      />
      <Stack.Screen
        name="PathEffect"
        component={PathEffectDemo}
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
      <Stack.Screen
        name="SVG"
        component={SVG}
        options={{
          title: "🖋 SVG",
        }}
      />
      <Stack.Screen
        name="BlendModes"
        component={BlendModes}
        options={{
          title: "🎨 Blend Modes",
        }}
      />
      <Stack.Screen
        name="Data"
        component={Data}
        options={{
          title: "📊 Data",
        }}
      />
    </Stack.Navigator>
  );
};
