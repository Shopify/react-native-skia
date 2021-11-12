import React, {useState} from 'react';
import {StyleSheet, Text, useColorScheme, View} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

export const Section: React.FC<{
  title: string;
  description?: string;
}> = ({children, title, description}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [isVisible, setIsVisible] = useState<boolean>(false);
  return (
    <View style={styles.sectionContainer}>
      <Text
        onPress={() => setIsVisible(p => !p)}
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title + (isVisible ? ' 🔽' : ' ▶️')}
      </Text>
      {description ? (
        <Text
          onPress={() => setIsVisible(p => !p)}
          style={[
            styles.sectionDescription,
            {
              color: isDarkMode ? Colors.white : Colors.black,
            },
          ]}>
          {description}
        </Text>
      ) : null}
      <View style={styles.sectionContent}>{isVisible ? children : null}</View>
    </View>
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
    fontSize: 18,
    fontWeight: 'normal',
  },
  sectionContent: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
});
