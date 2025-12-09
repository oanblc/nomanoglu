import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { palette } from '../../theme/colors';

const ForexScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Döviz Ekranı (Yakında)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.screenBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: palette.currencyCode,
  }
});

export default ForexScreen;
