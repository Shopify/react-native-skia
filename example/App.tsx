import React, {useMemo} from 'react';
import {
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import type {IPath} from '@shopify/react-native-skia';
import {
  Skia,
  usePaint,
  useDrawCallback,
  PaintStyle,
  StrokeCap,
} from '@shopify/react-native-skia';

import {Colors} from 'react-native/Libraries/NewAppScreen';

const bgColor = Skia.Color('#7FC8A9');
const fgColor = Skia.Color('#7F00A9');

const Section: React.FC<{
  title: string;
}> = ({children, title}) => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const paint = usePaint();

  const pathPaint = usePaint(p => {
    p.setColor(fgColor);
    p.setStrokeWidth(15);
    p.setStyle(PaintStyle.Stroke);
    p.setStrokeCap(StrokeCap.Round);
  });

  const paths = useMemo(() => [] as IPath[], []);

  const onDraw = useDrawCallback(
    canvas => {
      paint.setColor(bgColor);
      canvas.drawPaint(paint);
      if (paths.length > 0) {
        for (let i = 0; i < paths.length; i++) {
          canvas.drawPath(paths[i]!, pathPaint);
        }
      }
    },
    [paint, pathPaint, paths],
  );

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View
        style={{
          backgroundColor: isDarkMode ? Colors.black : Colors.white,
        }}>
        <Section title="Simple Skia Drawing">
          <View
            onTouchStart={evt => {
              const path = Skia.Path();
              path.moveTo(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
              paths.push(path);
            }}
            onTouchMove={evt => {
              paths[paths.length - 1]?.lineTo(
                evt.nativeEvent.locationX,
                evt.nativeEvent.locationY,
              );
            }}>
            <Skia.View
              style={styles.skiaview}
              onDraw={onDraw}
              mode="continuous"
            />
          </View>
        </Section>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  skiaview: {
    width: Dimensions.get('window').width * 0.85,
    height: Dimensions.get('window').height * 0.25,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#ECECEC',
  },
});

export default App;
