import { View } from 'react-native';
import AnimatedSquareCanvas from './AnimatedSquareCanvas';

function SkiaApp() {
  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <View style={{ width: 400, aspectRatio: 1 }}>
        <AnimatedSquareCanvas />
      </View>
    </View>
  )
}

export default SkiaApp;
