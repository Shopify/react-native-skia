import React, { useCallback, useLayoutEffect, useMemo } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ScrollView,
} from "react-native";

import { TestBattery } from "./TestBattery";
import type { StackParamList } from "./types";
import { getByPath, isTest } from "./types";
import { TestPath } from "./TestPath";

type Props = NativeStackScreenProps<StackParamList, "Tests">;

export const TestListScreen: React.FC<Props> = ({ route, navigation }) => {
  const current = useMemo(
    () => getByPath(route.params.path ?? [], TestBattery) ?? TestBattery,
    [route?.params]
  );

  useLayoutEffect(() => {
    navigation.setOptions({ title: route.params.title ?? "Tests" });
  }, [navigation, route.params.title]);

  const handlePress = useCallback(
    (key) => {
      const selected = current[key];
      if (isTest(selected)) {
        // Navigate to test itself
        navigation.push("Test", {
          title: key,
          path: [...(route.params.path ?? []), key],
        });
      } else {
        // Navigate to children
        navigation.push("Tests", {
          title: key,
          path: [...(route.params.path ?? []), key],
        });
      }
    },
    [current, navigation, route.params.path]
  );

  return (
    <View style={styles.container}>
      <TestPath route={route} navigation={navigation} />
      <ScrollView style={styles.container}>
        {Object.keys(current).map((key, i) => (
          <TouchableOpacity
            key={i}
            testID={key}
            style={styles.row}
            onPress={() => handlePress(key)}
          >
            <Text style={{ flex: 1 }}>
              {isTest(current[key]) ? `Run Test ${key}` : key}
            </Text>
            {isTest(current[key]) ? null : <Text>≫</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  row: {
    padding: 12,
    alignItems: "center",
    flexDirection: "row",
    borderTopColor: "gray",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
