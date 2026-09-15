import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import * as THREE from "three";
import type { CanvasRef } from "react-native-webgpu";
import { Canvas } from "react-native-webgpu";

import { useGLTF, useHDR } from "./components/AssetManager";
import {
  makeWebGPURenderer,
  disposeWebGPURenderer,
} from "./components/makeWebGPURenderer";

export const Helmet = () => {
  const texture = useHDR(require("./assets/helmet/royal_esplanade_1k.hdr"));
  const gltf = useGLTF(require("./assets/helmet/DamagedHelmet.gltf"));
  const ref = useRef<CanvasRef>(null);

  useEffect(() => {
    if (!texture || !gltf) {
      return;
    }
    const context = ref.current?.getContext("webgpu");
    if (!context) {
      console.warn("Failed to get WebGPU context");
      return;
    }
    const { width, height } = context.canvas;

    const timer = new THREE.Timer();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.25, 20);
    camera.position.set(-1.8, 0.6, 2.7);

    const scene = new THREE.Scene();

    const renderer = makeWebGPURenderer(context);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;

    scene.add(gltf.scene);

    const animateCamera = () => {
      timer.update();
      const elapsed = timer.getElapsed();
      const distance = 5;
      camera.position.x = Math.sin(elapsed) * distance;
      camera.position.z = Math.cos(elapsed) * distance;
      camera.lookAt(new THREE.Vector3(0, 0, 0));
    };

    const animate = () => {
      animateCamera();
      renderer.render(scene, camera);
      context.present();
    };
    renderer.setAnimationLoop(animate);

    return () => {
      disposeWebGPURenderer(renderer);
    };
  }, [texture, gltf]);

  return (
    <View style={styles.container}>
      <Text style={styles.loading}>Loading assets...</Text>
      <View style={StyleSheet.absoluteFill}>
        <Canvas ref={ref} style={styles.canvas} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  canvas: {
    flex: 1,
  },
  loading: {
    color: "#fff",
  },
});
