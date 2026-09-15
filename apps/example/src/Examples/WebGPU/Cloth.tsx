import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import * as THREE from "three";
import type { CanvasRef } from "react-native-webgpu";
import { Canvas } from "react-native-webgpu";

import { useHDR } from "./components/AssetManager";
import { setupCloth } from "./components/cloth";
import {
  makeWebGPURenderer,
  disposeWebGPURenderer,
} from "./components/makeWebGPURenderer";

// Screen for the cloth simulation in ./components/cloth.ts, rendered on a
// plain WebGPU canvas.
const params = {
  sphere: true,
  wind: 1.0,
};

export const Cloth = () => {
  const hdr = useHDR(require("./assets/helmet/royal_esplanade_1k.hdr"));
  const ref = useRef<CanvasRef>(null);

  useEffect(() => {
    if (!hdr) {
      return;
    }
    const context = ref.current?.getContext("webgpu");
    if (!context) {
      console.warn("Failed to get WebGPU context");
      return;
    }
    const { width, height } = context.canvas;

    const renderer = makeWebGPURenderer({
      context,
      // the cloth vertex shader reads the verlet positions storage buffer
      requiredLimits: { maxStorageBuffersInVertexStage: 1 },
    });
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1;

    const scene = new THREE.Scene();
    hdr.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = hdr;
    scene.backgroundBlurriness = 0.5;
    scene.environment = hdr;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.01, 10);
    camera.position.set(-1.6, -0.1, -1.6);
    camera.lookAt(0, -0.1, 0);

    const {
      computeSpringForces,
      computeVertexForces,
      sphere,
      spherePositionUniform,
      sphereUniform,
      windUniform,
    } = setupCloth(scene);

    const timer = new THREE.Timer();
    let timeSinceLastStep = 0;
    let timestamp = 0;
    // fixed simulation rate, independent of the display refresh rate
    const stepsPerSecond = 360;
    const timePerStep = 1 / stepsPerSecond;

    const updateSphere = () => {
      sphere.position.set(
        Math.sin(timestamp * 2.1) * 0.1,
        0,
        Math.sin(timestamp * 0.8)
      );
      spherePositionUniform.value.copy(sphere.position);
    };

    const animate = () => {
      timer.update();
      sphere.visible = params.sphere;
      sphereUniform.value = params.sphere ? 1 : 0;
      windUniform.value = params.wind;

      // never advance too far at once, e.g. after the app was backgrounded
      const deltaTime = Math.min(timer.getDelta(), 1 / 60);
      timeSinceLastStep += deltaTime;
      while (timeSinceLastStep >= timePerStep) {
        timestamp += timePerStep;
        timeSinceLastStep -= timePerStep;
        updateSphere();
        renderer.compute(computeSpringForces);
        renderer.compute(computeVertexForces);
      }

      renderer.render(scene, camera);
      context.present();
    };
    renderer.setAnimationLoop(animate);

    return () => {
      disposeWebGPURenderer(renderer);
    };
  }, [hdr]);

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
