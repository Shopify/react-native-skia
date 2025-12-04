import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";
import type { SkPicture } from "@shopify/react-native-skia";
import {
  createPicture,
  Skia,
  SkiaPictureView,
} from "@shopify/react-native-skia";

/**
 * This stress test reproduces a race condition crash in SkiaPictureView.
 *
 * The crash occurs in RNSkPictureView.h:69-70 where _picture is checked for null
 * and then used, but can be modified by another thread between these operations:
 *
 *   if (_picture != nullptr) {      // <-- Check on main thread
 *     canvas->drawPicture(_picture); // <-- _picture may have changed!
 *   }
 *
 * This test rapidly alternates between setting a picture and null to trigger
 * the race condition. The crash manifests as:
 *   null pointer dereference: SIGSEGV
 *   at SkRecord::Record::visit (SkRecordDraw)
 */
export const PictureViewCrashTest = () => {
  const [picture, setPicture] = useState<SkPicture | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [iterations, setIterations] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const toggleRef = useRef(false);

  // Create different pictures to ensure we're not just reusing the same pointer
  const createRandomPicture = useCallback(() => {
    return createPicture((canvas) => {
      const paint = Skia.Paint();
      // Random color to make it visually obvious the picture is changing
      paint.setColor(
        Skia.Color(
          `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`
        )
      );
      canvas.drawRect({ x: 0, y: 0, width: 300, height: 300 }, paint);

      const circlePaint = Skia.Paint();
      circlePaint.setColor(
        Skia.Color(
          `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`
        )
      );
      // Draw multiple circles to make the picture more complex
      for (let i = 0; i < 10; i++) {
        canvas.drawCircle(
          Math.random() * 300,
          Math.random() * 300,
          20 + Math.random() * 30,
          circlePaint
        );
      }
    });
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startTest = () => {
    if (isRunning) return;
    setIsRunning(true);
    setIterations(0);

    // Rapidly toggle between picture and null to trigger the race condition
    // The key is to change _picture while the render thread might be drawing
    intervalRef.current = setInterval(() => {
      toggleRef.current = !toggleRef.current;
      if (toggleRef.current) {
        // Set a new picture (different object each time)
        setPicture(createRandomPicture());
      } else {
        // Set null - this is where the race condition can cause a crash
        // If the render thread is between the null check and drawPicture(),
        // it will try to draw a null picture
        setPicture(null);
      }
      setIterations((prev) => prev + 1);
    }, 1); // Very fast interval to maximize race condition probability
  };

  const stopTest = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.title}>PictureView Race Condition Test</Text>
        <Text style={styles.description}>
          This test rapidly toggles the picture between a valid SkPicture and
          null to reproduce the race condition crash in RNSkPictureView.
        </Text>
        <Text style={styles.iterations}>Iterations: {iterations}</Text>
        {isRunning && (
          <Text style={styles.warning}>
            Running... If the app crashes, the race condition was triggered.
          </Text>
        )}
      </View>

      <SkiaPictureView style={styles.canvas} picture={picture} />

      <View style={styles.buttonContainer}>
        <Button
          onPress={isRunning ? stopTest : startTest}
          title={isRunning ? "Stop Test" : "Start Race Condition Test"}
          color={isRunning ? "#dc3545" : "#28a745"}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoContainer: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  iterations: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  warning: {
    fontSize: 14,
    color: "#dc3545",
    fontWeight: "600",
  },
  canvas: {
    width: 300,
    height: 300,
    borderColor: "red",
    borderWidth: 2,
    alignSelf: "center",
    marginVertical: 16,
  },
  buttonContainer: {
    padding: 16,
  },
});
