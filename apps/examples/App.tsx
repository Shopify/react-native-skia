/**
 * React Native Skia Example App
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {Canvas, Fill, Skia} from '@shopify/react-native-skia';

import {Colors} from 'react-native/Libraries/NewAppScreen';

const surface = Skia.Surface.MakeOffscreen(100, 100)!;
const canvas = surface.getCanvas();
canvas.clear(Skia.Color('green'));
surface.flush();
const image = surface.makeImageSnapshot()!;
console.log(image.encodeToBase64());

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Canvas style={{ width: 100, height: 100}}>
          <Fill color="cyan" />
        </Canvas>
        <View style={styles.header}>
          <Text style={styles.title}>React Native Skia Examples</Text>
        </View>
        <View style={styles.canvasContainer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
  },
  canvasContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvas: {
    width: 300,
    height: 300,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default App;
