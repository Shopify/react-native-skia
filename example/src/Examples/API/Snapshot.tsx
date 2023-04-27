import React, { useCallback, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Button,
  Text,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import type { SkImage } from "@shopify/react-native-skia";
import {
  Canvas,
  Fill,
  Skia,
  RoundedRect,
  makeImageFromView,
  useLoop,
  useComputedValue,
  mix,
  Shader,
  ImageShader,
} from "@shopify/react-native-skia";
import { Switch } from "react-native-gesture-handler";

const source = Skia.RuntimeEffect.Make(`
uniform shader image;
uniform float r;

half4 main(float2 xy) {   
  xy.x += sin(xy.y / r) * 4;
  return image.eval(xy).rgba;
}`)!;

export const Snapshot = () => {
  const { width } = useWindowDimensions();
  const viewRef = useRef<View>(null);

  const progress = useLoop({ duration: 1500 });
  const uniforms = useComputedValue(
    () => ({ r: mix(progress.current, 1, 100) }),
    [progress]
  );

  const [image, setImage] = useState<SkImage | null>(null);
  const takeSnapshot = useCallback(async () => {
    if (viewRef.current == null) {
      return;
    }
    const snapshot = await makeImageFromView(viewRef);
    setImage(snapshot);
  }, []);
  return (
    <View style={{ flex: 1 }}>
      <View ref={viewRef} style={styles.view}>
        <Component />
      </View>
      <Button title="Take snapshot" onPress={takeSnapshot} />
      <Canvas style={styles.canvas}>
        <Fill color="white" />
        {image ? (
          <Fill>
            <Shader source={source} uniforms={uniforms}>
              <ImageShader
                image={image}
                fit="contain"
                x={20}
                y={20}
                width={width - 40}
                height={width - 120}
              />
            </Shader>
          </Fill>
        ) : null}
      </Canvas>
    </View>
  );
};

const Component = () => {
  const [counter, setCounter] = useState(0);
  return (
    <ScrollView style={styles.scrollview}>
      <Text>Hello World!</Text>
      <Button
        title={"Press me to increment (" + counter + ")"}
        onPress={() => setCounter((i) => i + 1)}
      />
      <Switch value={true} />
      <Canvas style={{ width: 100, height: 100 }}>
        <RoundedRect x={0} y={20} width={80} height={80} r={10} color="blue" />
      </Canvas>
      <Text>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;👆 This is a Skia Canvas!</Text>
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
  canvas: {
    flex: 1,
  },
});
