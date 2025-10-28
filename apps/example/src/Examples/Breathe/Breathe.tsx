import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  useWindowDimensions,
  View,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
  PermissionsAndroid,
} from "react-native";
import {
  BlurMask,
  vec,
  Canvas,
  Circle,
  Fill,
  Group,
  polar2Canvas,
  mix,
} from "@shopify/react-native-skia";
import type { SharedValue } from "react-native-reanimated";
import { useDerivedValue } from "react-native-reanimated";
import { Recorder } from "@react-native-community/audio-toolkit";

import { useLoop } from "../../components/Animations";

const c1 = "#61bea2";
const c2 = "#529ca0";

interface RingProps {
  index: number;
  progress: SharedValue<number>;
  total: number;
}

const Ring = ({ index, progress, total }: RingProps) => {
  const { width, height } = useWindowDimensions();
  const R = width / 4;
  const center = useMemo(
    () => vec(width / 2, height / 2 - 64),
    [height, width]
  );

  const transform = useDerivedValue(() => {
    const theta = (index * (2 * Math.PI)) / total;
    const { x, y } = polar2Canvas(
      { theta, radius: progress.value * R },
      { x: 0, y: 0 }
    );
    const scale = mix(progress.value, 0.3, 1);
    return [{ translateX: x }, { translateY: y }, { scale }];
  });

  return (
    <Circle
      c={center}
      r={R}
      color={index % 2 ? c1 : c2}
      origin={center}
      transform={transform}
    />
  );
};

export const Breathe = () => {
  const { width, height } = useWindowDimensions();
  const center = useMemo(
    () => vec(width / 2, height / 2 - 64),
    [height, width]
  );
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef<Recorder | null>(null);

  const progress = useLoop({ duration: 3000 });

  const transform = useDerivedValue(() => [
    { rotate: mix(progress.value, -Math.PI, 0) },
  ]);

  // Clean up audio resources when component unmounts
  useEffect(() => {
    return () => {
      if (recorderRef.current) {
        recorderRef.current.destroy();
        recorderRef.current = null;
      }
    };
  }, []);

  const requestMicrophonePermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: "Microphone Permission",
            message:
              "App needs access to your microphone to test voice recording.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS permissions are handled differently
  };

  const startVoiceSession = async () => {
    try {
      // Request permission first
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        Alert.alert(
          "Permission Denied",
          "Microphone permission is required for voice recording."
        );
        return;
      }

      console.log(
        "Starting voice session - using real microphone with audio-toolkit..."
      );

      // Clean up any existing recorder
      if (recorderRef.current) {
        recorderRef.current.destroy();
      }

      // Create a new recorder instance
      // Using a temporary filename for the recording
      const recorder = new Recorder("test_recording.mp4", {
        bitrate: 256000,
        channels: 2,
        sampleRate: 44100,
        quality: "max",
        format: "mp4",
        encoder: "aac",
      });

      recorderRef.current = recorder;

      // Set up event handlers
      recorder.on("info", (info) => {
        console.log("Recorder info:", info);
      });

      recorder.on("error", (error) => {
        console.error("Recorder error:", error);
        Alert.alert("Recording Error", "An error occurred while recording.");
        setIsRecording(false);
      });

      // Prepare and start recording
      recorder.prepare((err, fsPath) => {
        if (err) {
          console.error("Failed to prepare recorder:", err);
          Alert.alert("Error", "Failed to prepare audio recorder");
          return;
        }

        console.log("Recorder prepared, starting recording at:", fsPath);

        recorder.record((recordErr) => {
          if (recordErr) {
            console.error("Failed to start recording:", recordErr);
            Alert.alert("Error", "Failed to start recording");
            return;
          }

          setIsRecording(true);
          console.log("Voice recording started successfully");

          Alert.alert(
            "Voice Session Active",
            "Real microphone recording is now active. Watch if Skia becomes unresponsive.",
            [{ text: "OK" }]
          );
        });
      });
    } catch (error) {
      console.error("Error starting voice session:", error);
      Alert.alert("Error", `Failed to start voice session: ${error}`);
    }
  };

  const stopVoiceSession = () => {
    if (recorderRef.current) {
      recorderRef.current.stop((err) => {
        if (err) {
          console.error("Error stopping recording:", err);
        } else {
          console.log("Recording stopped successfully");
        }

        // Clean up the recorder
        recorderRef.current?.destroy();
        recorderRef.current = null;
      });
    }

    setIsRecording(false);
    Alert.alert(
      "Voice Session Ended",
      "Microphone recording has been stopped."
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Canvas style={styles.container} testID="breathe-canvas">
        <Fill color="rgb(36,43,56)" />
        <Group origin={center} transform={transform} blendMode="screen">
          <BlurMask style="solid" blur={40} />
          {new Array(6).fill(0).map((_, index) => {
            return (
              <Ring key={index} index={index} progress={progress} total={6} />
            );
          })}
        </Group>
      </Canvas>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isRecording && styles.buttonRecording]}
          onPress={isRecording ? stopVoiceSession : startVoiceSession}
        >
          <Text style={styles.buttonText}>
            {isRecording ? "🔴 Stop Voice Session" : "🎤 Start Voice Session"}
          </Text>
        </TouchableOpacity>
        {isRecording && (
          <Text style={styles.recordingText}>
            Recording... Check if Skia is responsive
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  button: {
    backgroundColor: "#61bea2",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 200,
    alignItems: "center",
  },
  buttonRecording: {
    backgroundColor: "#ff4444",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  recordingText: {
    color: "#ff4444",
    fontSize: 14,
    marginTop: 10,
    fontWeight: "500",
  },
});
