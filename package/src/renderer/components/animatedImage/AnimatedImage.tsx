import React, { useEffect } from 'react';

import type { AnimatedImageProps } from '../../../dom/types';
import { useSharedValue } from '../../../external/reanimated/moduleWrapper';

export const AnimatedImage = (props: AnimatedImageProps) => {
  const currentFrame = useSharedValue(null);

  useEffect(() => {
    if (!props.image) {
      currentFrame.value = null;
      return;
    }

    currentFrame.value = props.image.getCurrentFrame();
    const frameDuration = props.image.currentFrameDuration();

    const interval = setInterval(() => {
      props.image?.decodeNextFrame();
      currentFrame.value = props.image?.getCurrentFrame();
    }, frameDuration);

    return () => {
      clearInterval(interval);
    };
  }, [props.image]);

  return <skImage {...props} image={currentFrame} />;
};
