import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SectionList, Pressable, Animated } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import Header from './Header'; // Import the Blue Header

const ListHeader = () => (
  <View style={styles.listHeader}>
    <View style={styles.colLeft}>
      <Text style={styles.listHeaderText}>Ürün</Text>
    </View>
    <View style={styles.colMid}>
      <Text style={[styles.listHeaderText, { textAlign: 'right' }]}>Alış</Text>
    </View>
    <View style={styles.colRight}>
      <Text style={[styles.listHeaderText, { textAlign: 'right' }]}>Satış</Text>
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
  // isPositive prop varsa onu kullan, yoksa yüzdeden hesapla
  const percent = item.percent || '%0,00';
  const numericPercent = parseFloat(percent.replace('%', '').replace(',', '.'));

  // isPositive prop'u varsa onu kullan, yoksa yüzdeden belirle
  const isPositive = item.isPositive !== undefined ? item.isPositive : numericPercent >= 0;
  const hasChange = item.hasChange !== undefined ? item.hasChange : numericPercent !== 0;

  // Renk belirleme - fiyatlar ve ok için
  // Fiyat değişimi yoksa (ilk yükleme) siyah göster, değişim varsa yeşil/kırmızı
  const priceColor = hasChange ? (isPositive ? '#16a34a' : '#dc2626') : '#1A1A1A';
  const arrowColor = hasChange ? priceColor : '#9ca3af';

  // Fiyat değişim animasyonu
  const flashAnim = useRef(new Animated.Value(0)).current;
  const prevBuying = useRef(item.buying);
  const prevSelling = useRef(item.selling);

  useEffect(() => {
    // Fiyat değişti mi kontrol et
    if (prevBuying.current !== item.buying || prevSelling.current !== item.selling) {
      // Sarı flash animasyonu
      flashAnim.setValue(1);
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: false,
      }).start();

      // Önceki değerleri güncelle
      prevBuying.current = item.buying;
      prevSelling.current = item.selling;
    }
  }, [item.buying, item.selling]);

  // Animasyonlu arka plan rengi
  const backgroundColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [palette.screenBackground, 'rgba(247, 222, 0, 0.25)'] // Hafif sarı
  });

  return (
    <Pressable
      style={({ pressed }) => [
        pressed && styles.itemPressed,
      ]}
    >
      <Animated.View style={[styles.itemContainer, { backgroundColor }]}>
      {/* İki satırlı yapı */}
      <View style={styles.itemContent}>
        {/* Üst satır: Ürün adı | Alış | Satış */}
        <View style={styles.topRow}>
          <View style={styles.colLeft}>
            <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          </View>
          <View style={styles.colMid}>
            <Text style={[styles.priceVal, { color: priceColor }]}>{item.buying}</Text>
          </View>
          <View style={styles.colRight}>
            <Text style={[styles.priceValBold, { color: priceColor }]}>{item.selling}</Text>
          </View>
        </View>

        {/* Alt satır: Kod | Yüzde ve Değişim üçgeni */}
        <View style={styles.bottomRow}>
          <View style={styles.colLeft}>
            <Text style={styles.productCode}>{item.code}</Text>
          </View>
          <View style={styles.changeContainer}>
            <Text style={styles.percentText}>
              {percent}
            </Text>
            <FontAwesome5
              name={hasChange ? (isPositive ? 'caret-up' : 'caret-down') : 'minus'}
              size={hasChange ? 18 : 12}
              color={arrowColor}
            />
          </View>
        </View>
      </View>
      </Animated.View>
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
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#d4d4d8',
    alignItems: 'center',
  },
  listHeaderText: {
    color: palette.listHeaderText,
    fontSize: 12,
    fontWeight: '600',
  },
  itemContainer: {
    height: 60,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    justifyContent: 'center',
  },
  itemContent: {
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 18,
    marginTop: 2,
  },
  colLeft: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8,
  },
  colMid: {
    width: 85,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  colRight: {
    width: 85,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  productName: {
    color: palette.currencyCode,
    fontSize: 14,
    fontWeight: '600',
  },
  productCode: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '500',
  },
  priceVal: {
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '600',
  },
  priceValBold: {
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '700',
  },
  changeContainer: {
    width: 170,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  percentText: {
    fontSize: 11,
    fontWeight: '600',
    marginRight: 6,
    color: '#9ca3af', // Ürün kodu ile aynı gri ton
  },
  changeIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemPressed: {
    backgroundColor: '#f3f4f6',
  },
});

export default PriceList;
