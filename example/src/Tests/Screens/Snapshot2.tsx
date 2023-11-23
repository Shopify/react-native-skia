import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Button,
  Text,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import {
  Canvas,
  RoundedRect,
  useImage,
  Image,
} from "@shopify/react-native-skia";
import { Switch } from "react-native-gesture-handler";

export const Snapshot2 = () => {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.view}>
        <Component />
      </View>
    </View>
  );
};

const Component = () => {
  const [counter, setCounter] = useState(0);
  return (
    <ScrollView style={styles.scrollview}>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 200,
          height: 200,
        }}
      >
        <View
          style={{
            position: "absolute",
            transform: [{ translateX: 20 }, { translateY: 100 }],
            top: 0,
            left: 0,
            width: 80,
            height: 80,
            backgroundColor: "red",
          }}
        />
        <View
          style={{
            position: "absolute",
            top: 100,
            left: 100,
            width: 80,
            height: 80,
            backgroundColor: "blue",
          }}
        />
      </View>
      <Text>Hello World!</Text>
      <View style={{ flexDirection: "row" }}>
        <View
          style={{
            width: 80,
            height: 80,
            backgroundColor: "blue",
            opacity: 0.5,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              backgroundColor: "green",
              opacity: 0.5,
            }}
          />
        </View>
        <View
          style={{
            width: 40,
            height: 40,
            backgroundColor: "red",
            opacity: 0.5,
          }}
        />
      </View>
      <Button
        title={"Press me to increment (" + counter + ")"}
        onPress={() => setCounter((i) => i + 1)}
      />
      <Switch value={true} />
      <Canvas style={{ width: 100, height: 100 }}>
        <RoundedRect x={0} y={20} width={80} height={80} r={10} color="blue" />
      </Canvas>
      <Text>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;👆 This is a Skia Canvas!</Text>
      <Interleaving />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  view: {
    flex: 1,
    backgroundColor: "yellow",
  },
  scrollview: {
    padding: 14,
  },
  pinkContainer: {
    backgroundColor: "#00ff6922",
    position: "absolute",
    alignSelf: "center",
    left: 50,
    top: 50,
    right: 50,
    bottom: 50,
  },
  integratingContainer: {
    position: "absolute",
    left: "25%",
    top: 0,
    bottom: 0,
    transform: [{ scale: 0.5 }],
  },
  salmonContainer: {
    backgroundColor: "#ff8c6922",
    position: "absolute",
    alignSelf: "center",
    padding: 20,
    marginTop: 80,
  },
  black: {
    color: "black",
    textAlign: "center",
  },
  innerContainer: {
    backgroundColor: "#ff8c0044",
    transform: [{ translateX: 50 }, { rotate: "45deg" }],
  },
});

const PUPPY_TO_MAKE_YOUR_DAY_BETTER =
  "https://images.squarespace-cdn.com/content/v1/54e7a1a6e4b08db9da801ded/7f2dae36-5650-4b84-b184-684f46fe68aa/98.jpg";

const Interleaving = () => {
  const { height, width } = useWindowDimensions();
  const image = useImage(PUPPY_TO_MAKE_YOUR_DAY_BETTER);

  return (
    <View style={styles.integratingContainer}>
      <View style={styles.pinkContainer} />
      <Canvas style={{ width, height }}>
        <Image
          image={image}
          height={height}
          width={width}
          fit={"cover"}
          opacity={0.5}
        />
      </Canvas>
      <View style={styles.salmonContainer}>
        <Text style={styles.black}>Let me be a part of your snapshot!</Text>
        <View style={styles.innerContainer}>
          <Text style={styles.black}>I'm inside the red thingie!</Text>
        </View>
      </View>
    </View>
  );
};
