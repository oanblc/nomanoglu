import React from 'react';
import { View, StyleSheet } from 'react-native';

const MenuIcon = ({ size = 24, color = '#FFFFFF' }) => {
  const lineHeight = size * 0.12;
  const spacing = size * 0.22;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Üst çizgi - kısa */}
      <View
        style={[
          styles.line,
          {
            width: size * 0.55,
            height: lineHeight,
            backgroundColor: color,
            borderRadius: lineHeight / 2,
          }
        ]}
      />
      {/* Orta çizgi - uzun */}
      <View
        style={[
          styles.line,
          {
            width: size * 0.85,
            height: lineHeight,
            backgroundColor: color,
            borderRadius: lineHeight / 2,
            marginVertical: spacing,
          }
        ]}
      />
      {/* Alt çizgi - kısa */}
      <View
        style={[
          styles.line,
          {
            width: size * 0.55,
            height: lineHeight,
            backgroundColor: color,
            borderRadius: lineHeight / 2,
          }
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  line: {
    // Base styles applied inline
  },
});

export default MenuIcon;
