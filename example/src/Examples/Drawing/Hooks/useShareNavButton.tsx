import { useNavigation } from "@react-navigation/native";
import type { SkiaView } from "@shopify/react-native-skia";
import { ImageFormat } from "@shopify/react-native-skia";
import React, { useCallback } from "react";
import { Alert, Share } from "react-native";

import { ShareToolPath } from "../assets";
import { PathToolbarItem } from "../Toolbar/Items";

export const useShareNavButton = (skiaViewRef: React.RefObject<SkiaView>) => {
  const handleShare = useCallback(() => {
    const image = skiaViewRef.current?.makeImageSnapshot();
    if (image) {
      const data = image.encodeToBase64(ImageFormat.JPEG, 100);
      const url = `data:image/png;base64,${data}`;
      Share.share({
        url,
        title: "Drawing",
      }).catch(() => {
        Alert.alert("An error occurred when sharing the image.");
      });
    } else {
      Alert.alert(
        "An error occurred when creating a snapshot of your drawing."
      );
    }
  }, [skiaViewRef]);

  const navigation = useNavigation();
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <PathToolbarItem path={ShareToolPath!} onPress={handleShare} />
      ),
    });
  }, [handleShare, navigation]);
};
