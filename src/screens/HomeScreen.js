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

    // Backend'den gelen fiyat değişim yüzdesini kullan
    return prices.map(p => {
      return {
        code: p.code,
        name: p.name || p.code,
        buying: formatPrice(p.calculatedAlis),
        selling: formatPrice(p.calculatedSatis),
        percent: `%${p.changePercent || '0.00'}`,
        isPositive: p.isPositive,
        hasChange: p.hasChange || false,
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
      // Favoriler varsa tüm favorileri göster
      codesToShow = favorites.map(f => f.code);
    } else {
      // Favori yoksa varsayılan ürünleri göster (Has, Çeyrek, Yarım)
      codesToShow = DEFAULT_SLIDER_CODES;
    }

    // Seçilen kodlara göre fiyatları bul ve formatla
    return codesToShow
      .map(code => {
        const p = prices.find(price => price.code === code);
        if (!p) return null;

        return {
          symbol: p.code,
          name: p.name || p.code,
          buying: formatPrice(p.calculatedAlis),
          selling: formatPrice(p.calculatedSatis),
          price: formatPrice(p.calculatedSatis),
          percent: `%${p.changePercent || '0.00'}`,
          isPositive: p.isPositive
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
