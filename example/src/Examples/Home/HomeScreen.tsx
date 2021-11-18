import React from 'react';
import {StyleSheet, View} from 'react-native';
import {HomeScreenButton} from './HomeScreenButton';

export const HomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <HomeScreenButton
        title="Drawing"
        description="Use touches to draw with Skia"
        route="Drawing"
      />
      <HomeScreenButton
        title="Animation"
        description="Animation with Skia"
        route="Animation"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
