/* eslint-disable max-len */
import React from "react";
import { View, StyleSheet, Text, TouchableWithoutFeedback } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Canvas, Path } from "@shopify/react-native-skia";

const styles = StyleSheet.create({
  container: {
    padding: 16,
    height: 96,
    justifyContent: "center",
  },
  title: {
    fontFamily: "Helvetica",
    fontSize: 20,
    color: "white",
    textAlign: "center",
  },
});

export const Header = () => {
  const { goBack } = useNavigation();
  return (
    <View style={styles.container}>
      <View style={[StyleSheet.absoluteFill, { justifyContent: "center" }]}>
        <Text style={styles.title}>Etherum</Text>
      </View>
      <TouchableWithoutFeedback onPress={goBack}>
        <View
          style={{
            width: 48,
            height: 48,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Canvas style={{ width: 32, height: 32 }}>
            <Path
              fillType="evenOdd"
              path="M15.2677 7.39935C15.572 7.70363 15.5973 8.18122 15.3438 8.51439L15.2677 8.60143L8.71965 15.1494L25.3333 15.1504C25.8028 15.1504 26.1833 15.5309 26.1833 16.0004C26.1833 16.4337 25.8591 16.7913 25.4399 16.8438L25.3333 16.8504L8.71865 16.8494L15.2677 23.3993C15.5996 23.7313 15.5996 24.2695 15.2677 24.6014C14.9634 24.9057 14.4858 24.9311 14.1527 24.6775L14.0656 24.6014L6.06561 16.6014L6.04546 16.5806C6.03311 16.5674 6.02118 16.5538 6.00969 16.5398L5.98954 16.5144L6.06561 16.6014C6.03226 16.5681 6.00225 16.5326 5.9756 16.4955C5.96538 16.4812 5.95562 16.4667 5.9463 16.4518C5.93772 16.4383 5.92956 16.4244 5.92184 16.4104L5.92185 16.4103L5.91651 16.4006C5.91238 16.3929 5.90838 16.3851 5.90451 16.3773C5.89154 16.351 5.87977 16.3238 5.86942 16.2959C5.86635 16.2875 5.86318 16.2785 5.86017 16.2695C5.85112 16.2425 5.84349 16.2151 5.83723 16.1871C5.83424 16.1734 5.83159 16.1601 5.82926 16.1467C5.82559 16.126 5.82266 16.1043 5.82056 16.0824C5.81866 16.0622 5.81746 16.0425 5.81695 16.0229C5.81675 16.0159 5.81665 16.0082 5.81665 16.0004L5.81719 15.97C5.81783 15.952 5.81904 15.934 5.82083 15.916L5.81665 16.0004C5.81665 15.9478 5.82143 15.8963 5.83057 15.8464C5.83305 15.8332 5.83583 15.8198 5.83893 15.8066C5.85665 15.7302 5.88485 15.6575 5.92185 15.5905L5.92184 15.5904C5.92241 15.5893 5.92299 15.5883 5.92357 15.5872C5.93108 15.5738 5.93852 15.5612 5.9463 15.5488C5.95629 15.533 5.9668 15.5175 5.9778 15.5023C5.98808 15.488 5.99868 15.4743 6.00974 15.4609C6.02118 15.447 6.03311 15.4334 6.04546 15.4202C6.05192 15.4133 6.05869 15.4063 6.06561 15.3994L14.0656 7.39935C14.3976 7.0674 14.9357 7.0674 15.2677 7.39935Z"
              color="white"
            />
          </Canvas>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};
