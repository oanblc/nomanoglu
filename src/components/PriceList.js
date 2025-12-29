import React, { useEffect, useRef, useState } from 'react';
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

// Satış/Alış fiyat farkı yüzdesini hesapla
const calculateSpreadPercent = (buying, selling) => {
  // String fiyatları sayıya çevir (Türkçe format: 1.234,56)
  const parseTurkishNumber = (str) => {
    if (!str) return 0;
    return parseFloat(str.toString().replace(/\./g, '').replace(',', '.'));
  };

  const buyPrice = parseTurkishNumber(buying);
  const sellPrice = parseTurkishNumber(selling);

  if (!buyPrice || buyPrice === 0) return { percent: '0,00', isPositive: true };

  const diff = ((sellPrice - buyPrice) / buyPrice) * 100;
  return {
    percent: Math.abs(diff).toFixed(2).replace('.', ','),
    isPositive: diff >= 0
  };
};

// Türkçe format fiyatı sayıya çevir
const parseTurkishNumber = (str) => {
  if (!str) return 0;
  return parseFloat(str.toString().replace(/\./g, '').replace(',', '.'));
};

const PriceItem = ({ item }) => {
  // Satış/Alış farkı yüzdesini hesapla (spread için)
  const spreadInfo = calculateSpreadPercent(item.buying, item.selling);
  const percent = `%${spreadInfo.percent}`;

  // Fiyat değişim animasyonu ve renk takibi
  const flashAnim = useRef(new Animated.Value(0)).current;
  const prevBuying = useRef(item.buying);
  const prevSelling = useRef(item.selling);
  const [buyingDirection, setBuyingDirection] = useState(null); // 'up', 'down', null
  const [sellingDirection, setSellingDirection] = useState(null);

  useEffect(() => {
    const currentBuying = parseTurkishNumber(item.buying);
    const currentSelling = parseTurkishNumber(item.selling);
    const oldBuying = parseTurkishNumber(prevBuying.current);
    const oldSelling = parseTurkishNumber(prevSelling.current);

    // Fiyat değişti mi kontrol et
    if (prevBuying.current !== item.buying || prevSelling.current !== item.selling) {
      // Alış yönü
      if (currentBuying > oldBuying) {
        setBuyingDirection('up');
      } else if (currentBuying < oldBuying) {
        setBuyingDirection('down');
      }

      // Satış yönü
      if (currentSelling > oldSelling) {
        setSellingDirection('up');
      } else if (currentSelling < oldSelling) {
        setSellingDirection('down');
      }

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

  // Renk belirleme - her fiyat kendi değişimine göre
  const getBuyingColor = () => {
    if (buyingDirection === 'up') return '#16a34a'; // yeşil
    if (buyingDirection === 'down') return '#dc2626'; // kırmızı
    return '#1A1A1A'; // siyah (değişim yok)
  };

  const getSellingColor = () => {
    if (sellingDirection === 'up') return '#16a34a';
    if (sellingDirection === 'down') return '#dc2626';
    return '#1A1A1A';
  };

  // Ok ve yüzde rengi - satış fiyatının yönüne göre
  const getSpreadColor = () => {
    if (sellingDirection === 'up') return '#16a34a';
    if (sellingDirection === 'down') return '#dc2626';
    return '#9ca3af'; // gri (değişim yok)
  };

  const buyingColor = getBuyingColor();
  const sellingColor = getSellingColor();
  const spreadColor = getSpreadColor();

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
            <Text style={[styles.priceVal, { color: buyingColor }]}>{item.buying}</Text>
          </View>
          <View style={styles.colRight}>
            <Text style={[styles.priceValBold, { color: sellingColor }]}>{item.selling}</Text>
          </View>
        </View>

        {/* Alt satır: Yüzde ve Değişim üçgeni */}
        <View style={styles.bottomRow}>
          <View style={styles.colLeft} />
          <View style={styles.changeContainer}>
            <Text style={[styles.percentText, { color: spreadColor }]}>
              {percent}
            </Text>
            <FontAwesome5
              name={sellingDirection === 'up' ? 'caret-up' : (sellingDirection === 'down' ? 'caret-down' : 'minus')}
              size={sellingDirection ? 18 : 12}
              color={spreadColor}
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
