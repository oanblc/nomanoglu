import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, SectionList, Pressable, Animated } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import Header from './Header'; // Import the Blue Header

const ListHeader = () => (
  <View style={styles.listHeader}>
    <View style={styles.headerName}>
      <Text style={styles.listHeaderText}>Birim</Text>
    </View>
    <View style={styles.headerTime}>
      <Text style={styles.listHeaderText}></Text>
    </View>
    <View style={styles.headerMid}>
      <Text style={styles.listHeaderText}>Alış</Text>
    </View>
    <View style={styles.headerRight}>
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

  // Renk belirleme - varsayılan siyah, sadece anlık değişimde renk değişsin
  const getBuyingColor = () => {
    return '#1A1A1A'; // Her zaman siyah (HAREM gibi)
  };

  const getSellingColor = () => {
    return '#1A1A1A'; // Her zaman siyah (HAREM gibi)
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
    outputRange: ['#ffffff', 'rgba(247, 222, 0, 0.25)'] // Beyaz → Hafif sarı
  });

  // Saat bilgisini formatla - son güncelleme zamanı
  const formatTime = () => {
    // Şu anki zamanı al (son güncelleme zamanı olarak)
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <Pressable
      style={({ pressed }) => [
        pressed && styles.itemPressed,
      ]}
    >
      <Animated.View style={[styles.itemContainer, { backgroundColor }]}>
        {/* Sol: Ürün adı 2 satırda, saat ve fiyatlarla aynı hizada */}
        <View style={styles.nameSection}>
          <Text style={styles.productName} numberOfLines={2}>{item.name?.toUpperCase()}</Text>
          <View style={styles.emptyRow} />
        </View>

        {/* Saat: Fiyat adıyla aynı hizada */}
        <View style={styles.timeSection}>
          <View style={styles.timeContent}>
            <Ionicons name="time-outline" size={12} color="#9ca3af" />
            <Text style={styles.updateTime}>{formatTime()}</Text>
          </View>
          <View style={styles.emptyRow} />
        </View>

        {/* Alış: Satışla aynı hizada */}
        <View style={styles.midSection}>
          <Text style={[styles.priceVal, { color: buyingColor }]}>{item.buying}</Text>
          <View style={styles.emptyRow} />
        </View>

        {/* Sağ: Satış (üst) + Değişim (alt) */}
        <View style={styles.rightSection}>
          <Text style={[styles.priceValBold, { color: sellingColor }]}>{item.selling}</Text>
          <View style={styles.changeRow}>
            <Text style={[styles.percentText, { color: spreadColor }]}>
              {percent}
            </Text>
            <FontAwesome5
              name={sellingDirection === 'up' ? 'caret-up' : (sellingDirection === 'down' ? 'caret-down' : 'minus')}
              size={sellingDirection ? 12 : 8}
              color={spreadColor}
              style={{ marginLeft: 3 }}
            />
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
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  listHeaderText: {
    color: '#666666',
    fontSize: 12,
    fontWeight: '600',
  },
  headerName: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTime: {
    width: 50,
    justifyContent: 'center',
  },
  headerMid: {
    width: 95,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerRight: {
    width: 95,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  nameSection: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8,
  },
  timeSection: {
    width: 55,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  timeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  midSection: {
    width: 95,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  rightSection: {
    width: 95,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  productName: {
    color: '#1A1A1A',
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 21,
    fontFamily: 'Roboto_400Regular',
  },
  updateTime: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '400',
    marginLeft: 3,
  },
  priceVal: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: '400',
    fontFamily: 'Roboto_400Regular',
  },
  priceValBold: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: '400',
    fontFamily: 'Roboto_400Regular',
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  percentText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyRow: {
    height: 16,
    marginTop: 2,
  },
  itemPressed: {
    backgroundColor: '#f3f4f6',
  },
});

export default PriceList;
