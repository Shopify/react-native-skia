import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useMemo } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

import type { StackParamList } from "../types";

type Props = NativeStackScreenProps<StackParamList, "Test" | "Tests">;

export const TestPath: React.FC<Props> = ({ route, navigation }) => {
  const path = useMemo(
    () => (route.params.path ? [...route.params.path] : []),
    [route.params.path]
  );

  const handleGoBack = useCallback(() => {
    navigation.pop();
  }, [navigation]);

  return path.length > 0 ? (
    <TouchableOpacity onPress={handleGoBack} style={styles.path} testID="Back">
      <Text>⏪ {path.join(" / ")}</Text>
    </TouchableOpacity>
  ) : null;
};

const styles = StyleSheet.create({
  path: {
    backgroundColor: "white",
    flexDirection: "row",
    padding: 8,
  },
});
