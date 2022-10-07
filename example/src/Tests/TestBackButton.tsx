import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import type { StackParamList } from "../types";

type Props = NativeStackScreenProps<StackParamList, "Test" | "Tests">;

export const TestBackButton: React.FC<Props> = ({ navigation }) => {
  const handleGoBack = useCallback(() => {
    navigation.pop();
  }, [navigation]);

  return (
    <TouchableOpacity onPress={handleGoBack} style={styles.path} testID="Back">
      <Text>⏪ Back</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  path: {
    backgroundColor: "white",
    flexDirection: "row",
    padding: 8,
  },
});
