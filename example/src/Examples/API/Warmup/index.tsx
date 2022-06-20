import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { List } from "./List";
import { Icons } from "./Icons";
import { Images } from "./Images";
import type { Routes } from "./Routes";

const Stack = createNativeStackNavigator<Routes>();
export const Warmup = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="List"
        component={List}
        options={{
          title: "☀️ Warmup",
          header: () => null,
        }}
      />
      <Stack.Screen
        name="Icons"
        component={Icons}
        options={{
          title: "📫 Icons",
        }}
      />
      <Stack.Screen
        name="Images"
        component={Images}
        options={{
          title: "🎆 Images",
        }}
      />
    </Stack.Navigator>
  );
};
