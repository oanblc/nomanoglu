import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../theme/colors';
import { typography } from '../../theme/fonts';

const PriceCard = ({ code, price = 0, change = '+%0.00', onPress }) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.headerRow}>
        <Text style={styles.code}>{code}</Text>
        <View style={styles.iconBadge}>
          <Ionicons name="trending-up-outline" size={16} color={palette.accent} />
        </View>
      </View>
      <Text style={styles.price}>{price}</Text>
      <Text style={styles.change}>{change}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: 20,
    padding: 20,
    margin: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  code: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.textSecondary,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF2D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: 6,
  },
  change: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.success,
  },
});

export default PriceCard;
