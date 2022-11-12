import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { List } from "./List";
import { HelloWorld } from "./HelloWorld";
import type { Routes } from "./Routes";

const Stack = createNativeStackNavigator<Routes>();
export const Tests = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="TestList" component={List} />
      <Stack.Screen
        name="HelloWorld"
        component={HelloWorld}
        options={{
          title: "🟢 Hello World",
        }}
      />
    </Stack.Navigator>
  );
};
