import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { Routes } from "./Routes";
import { List } from "./List";
import { HeavyCanvas } from "./HeavyCanvas";
import { ManyCanvases } from "./ManyCanvases";
import { AndroidBacking } from "./AndroidBacking";
import { SmallIcon } from "./SmallIcon";
import { GcStorm } from "./GcStorm";
import { IconGrid } from "./IconGrid";

const Stack = createNativeStackNavigator<Routes>();

export const Benchmarks = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="List"
        component={List}
        options={{ title: "🏁 Benchmarks" }}
      />
      <Stack.Screen name="HeavyCanvas" component={HeavyCanvas} />
      <Stack.Screen name="ManyCanvases" component={ManyCanvases} />
      <Stack.Screen name="AndroidBacking" component={AndroidBacking} />
      <Stack.Screen name="SmallIcon" component={SmallIcon} />
      <Stack.Screen name="GcStorm" component={GcStorm} />
      <Stack.Screen name="IconGrid" component={IconGrid} />
    </Stack.Navigator>
  );
};
