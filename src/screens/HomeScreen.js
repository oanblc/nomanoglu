import React, { useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PriceList from '../components/PriceList';
import { useWebSocket } from '../hooks/useWebSocket';
import { palette } from '../../theme/colors';

const FAVORITES_KEY = '@favorites';

// Varsayılan slider ürünleri (favori yoksa gösterilecek)
const DEFAULT_SLIDER_CODES = ['HAS ALTIN', 'ÇEYREK ALTIN', 'YARIM ALTIN'];

// Helper to format prices
const formatPrice = (value) => {
  if (!value) return '0,0000';
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(value);
};

// Alış-Satış farkını yüzde olarak hesapla (spread)
const calculateSpreadPercent = (alis, satis) => {
  if (!alis || !satis || alis === 0) return { percent: '0.00', isPositive: true };
  const spread = ((satis - alis) / alis) * 100;
  return {
    percent: Math.abs(spread).toFixed(2),
    isPositive: spread >= 0
  };
};

// Initial placeholder - Backend'den yüklenecek
const INITIAL_DATA = [];

const HomeScreen = ({ navigation }) => {
  const { prices, isConnected } = useWebSocket();
  const [favorites, setFavorites] = useState([]);

  // Favorileri yükle
  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Favoriler yüklenemedi:', error);
    }
  };

  useEffect(() => {
    loadFavorites();
    // Sayfa her odaklandığında favorileri yenile
    if (navigation && navigation.addListener) {
      const unsubscribe = navigation.addListener('focus', loadFavorites);
      return unsubscribe;
    }
  }, [navigation]);

  // Combine live data with initial structure or just use live data if available
  const displayData = useMemo(() => {
    if (!prices || prices.length === 0) return INITIAL_DATA;

    // Alış-satış farkı (spread) yüzdesini hesapla - slider ile aynı mantık
    return prices.map(p => {
      const spreadInfo = calculateSpreadPercent(p.calculatedAlis, p.calculatedSatis);
      return {
        code: p.code,
        name: p.name || p.code,
        buying: formatPrice(p.calculatedAlis),
        selling: formatPrice(p.calculatedSatis),
        percent: `%${spreadInfo.percent}`,
        isPositive: spreadInfo.isPositive,
        hasChange: true,
        time: '14:15'
      };
    });
  }, [prices]);

  // Top rates for Hero section - Favoriler veya varsayılan ürünler
  const topRates = useMemo(() => {
    if (!prices || prices.length === 0) return [];

    // Hangi kodları göstereceğimizi belirle
    let codesToShow;
    if (favorites.length > 0) {
      // Favoriler varsa ilk 3 favoriyi göster
      codesToShow = favorites.slice(0, 3).map(f => f.code);
    } else {
      // Favori yoksa varsayılan ürünleri göster (Has, Çeyrek, Yarım)
      codesToShow = DEFAULT_SLIDER_CODES;
    }

    // Seçilen kodlara göre fiyatları bul ve formatla
    return codesToShow
      .map(code => {
        const p = prices.find(price => price.code === code);
        if (!p) return null;

        const spreadInfo = calculateSpreadPercent(p.calculatedAlis, p.calculatedSatis);
        return {
          symbol: p.code,
          name: p.name || p.code,
          buying: formatPrice(p.calculatedAlis),
          selling: formatPrice(p.calculatedSatis),
          price: formatPrice(p.calculatedSatis),
          percent: `%${spreadInfo.percent}`,
          isPositive: spreadInfo.isPositive
        };
      })
      .filter(Boolean); // null değerleri filtrele
  }, [prices, favorites]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.headerGradientStart} />
      <PriceList data={displayData} topRates={topRates} navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.screenBackground,
  },
});

export default HomeScreen;
