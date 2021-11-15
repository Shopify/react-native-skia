import React, {useCallback, useState} from 'react';
import {SafeAreaView, StatusBar, useColorScheme, View} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {DrawingExample} from './Examples';
import {AnimationExample} from './Examples/Animation';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [selectedExample, setSelectedExample] = useState<number>(-1);
  const toggleExample = useCallback(
    (index: number) => setSelectedExample(p => (p === index ? -1 : index)),
    [],
  );

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View
        style={{
          backgroundColor: isDarkMode ? Colors.black : Colors.white,
        }}>
        <DrawingExample
          index={0}
          onToggle={toggleExample}
          isVisible={selectedExample === 0}
        />
        <AnimationExample
          index={1}
          onToggle={toggleExample}
          isVisible={selectedExample === 1}
        />
      </View>
    </SafeAreaView>
  );
};

export default App;
