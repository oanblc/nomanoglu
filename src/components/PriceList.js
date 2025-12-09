import React from 'react';
import { View, Text, StyleSheet, SectionList, Pressable } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import Header from './Header'; // Import the Blue Header

const ListHeader = () => (
  <View style={styles.listHeader}>
    <View style={styles.colLeft}>
      <Text style={styles.listHeaderText}>Birim</Text>
    </View>
    <View style={styles.colMid}>
      <Text style={styles.listHeaderText}>Alış</Text>
    </View>
    <View style={styles.colRight}>
      <Text style={styles.listHeaderText}>Satış</Text>
    </View>
    <View style={styles.colChange}>
      <Text style={styles.listHeaderText}>Değişim</Text>
    </View>
  </View>
);

// Yüzdeye göre renk seçimi
const getPercentColor = (percent) => {
  if (!percent) return '#9ca3af'; // nötr gri
  const numeric = parseFloat(
    percent.toString().replace('%', '').replace(',', '.')
  );
  if (isNaN(numeric) || numeric === 0) return '#9ca3af';
  return numeric > 0 ? '#16a34a' : '#dc2626'; // yeşil / kırmızı
};

const PriceItem = ({ item }) => {
  const percentColor = getPercentColor(item.percent);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.itemContainer,
        pressed && styles.itemPressed,
      ]}
    >
      {/* Left: Code + Name */}
      <View style={styles.colLeft}>
        <Text style={[styles.currencyCode, typography.currencyCode]}>{item.code}</Text>
        <Text style={[styles.currencyName, typography.currencyName]}>{item.name}</Text>
      </View>

      {/* Mid: Buy Price */}
      <View style={styles.colMid}>
        <Text style={[styles.priceVal, typography.priceVal]}>{item.buying}</Text>
      </View>

      {/* Right: Sell Price */}
      <View style={styles.colRight}>
        <Text style={[styles.priceValBold, typography.priceVal]}>{item.selling}</Text>
      </View>

      {/* Change: Percent */}
      <View style={styles.colChange}>
        <Text style={[styles.percentChange, { color: percentColor }]}>
          {item.percent || '%0,00'}
        </Text>
      </View>
    </Pressable>
  );
};

const PriceList = ({ data, topRates, showHeader = true, navigation }) => {
  const insets = useSafeAreaInsets();
  const sections = [{ title: 'Prices', data: data }];

  return (
    <View style={styles.container}>
      {/* Header opsiyonel */}
      {showHeader && <Header topRates={topRates} navigation={navigation} />}
      
      {/* Sadece liste scroll olacak */}
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.code + index}
        renderItem={({ item }) => <PriceItem item={item} />}
        renderSectionHeader={() => <ListHeader />}
        stickySectionHeadersEnabled={true}
        contentContainerStyle={{ paddingBottom: 60 + insets.bottom + 10 }}
        showsVerticalScrollIndicator={false}
        style={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.screenBackground,
  },
  listContainer: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    backgroundColor: palette.listHeaderBg,
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#d4d4d8', // biraz daha belirgin gri
    alignItems: 'center',
  },
  listHeaderText: {
    color: palette.listHeaderText,
    fontSize: 12,
    fontWeight: '500',
  },
  itemContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#d4d4d8', // satırlar arası ayırıcı daha belirgin
    alignItems: 'center',
    backgroundColor: palette.screenBackground,
    minHeight: 52,
  },
  colLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  colMid: {
    width: 85,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 5,
  },
  colRight: {
    width: 85,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 15,
  },
  colChange: {
    width: 70,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  currencyCode: {
    color: palette.currencyCode,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  currencyName: {
    color: palette.currencyName,
    fontSize: 10,
    marginTop: 1,
  },
  priceVal: {
    color: palette.priceText,
    fontSize: 14,
  },
  priceValBold: {
    color: palette.currencyCode,
    fontSize: 15,
    fontWeight: '700',
  },
  itemPressed: {
    backgroundColor: '#f3f4f6',
  },
  percentChange: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default PriceList;
