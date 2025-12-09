import React, { useMemo, useRef } from 'react';
import { View, StyleSheet, StatusBar, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import PriceList from '../components/PriceList';
import { useWebSocket } from '../hooks/useWebSocket';
import { palette, gradient } from '../../theme/colors';
import Sidebar from '../components/Sidebar';

// Helper to format prices
const formatPrice = (value) => {
  if (!value) return '0,0000';
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(value);
};

// Initial Mock Data
const INITIAL_DATA = [
  { code: 'USDTRY', name: 'Amerikan Doları', buying: '42,300', selling: '42,430', percent: '%0.00', time: '14:15' },
  { code: 'EURTRY', name: 'Euro', buying: '48,934', selling: '49,200', percent: '%0.00', time: '14:15' },
  { code: 'EURUSD', name: 'EUR/USD', buying: '1,1568', selling: '1,1595', percent: '%0.00', time: '14:15' },
  { code: 'GBPTRY', name: 'İngiliz Sterlini', buying: '55,650', selling: '56,110', percent: '%0.00', time: '14:15' },
  { code: 'CHFTRY', name: 'İsviçre Frangı', buying: '52,004', selling: '52,866', percent: '%0.00', time: '14:15' },
  { code: 'AUDTRY', name: 'Avustralya Doları', buying: '26,861', selling: '27,724', percent: '%0.00', time: '14:15' },
  { code: 'CADTRY', name: 'Kanada Doları', buying: '29,735', selling: '31,714', percent: '%0.00', time: '14:15' },
  { code: 'SARTRY', name: 'Suudi Arabistan Riyali', buying: '11,117', selling: '11,657', percent: '%0.00', time: '14:15' },
  { code: 'JPYTRY', name: 'Japon Yeni', buying: '0,2690', selling: '0,2712', percent: '%0.00', time: '14:15' },
  { code: 'CNYTR', name: 'Çin Yuanı', buying: '5,845', selling: '5,912', percent: '%0.00', time: '14:15' },
];

const MarketsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { prices } = useWebSocket();
  const sidebarRef = useRef(null);

  const displayData = useMemo(() => {
    if (!prices || prices.length === 0) return INITIAL_DATA;

    return prices.map(p => ({
      code: p.code,
      name: p.name || p.code,
      buying: formatPrice(p.calculatedAlis),
      selling: formatPrice(p.calculatedSatis),
      percent: '%0.00',
      time: '14:15'
    }));
  }, [prices]);

  const openDrawer = () => {
    sidebarRef.current?.open();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.headerGradientStart} />

      {/* Fixed Header with Menu */}
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.header, { paddingTop: insets.top > 0 ? insets.top : 40 }]}
      >
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconButton} onPress={openDrawer}>
            <FontAwesome5 name="bars" size={24} color={palette.headerText} />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.headerLogoImage}
              resizeMode="contain"
            />
          </View>

          <View style={{ width: 32 }} />
        </View>
      </LinearGradient>

      {/* Price List */}
      <PriceList data={displayData} topRates={[]} showHeader={false} />

      {/* Sidebar Component */}
      <Sidebar ref={sidebarRef} navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.screenBackground,
  },
  header: {
    paddingBottom: 0,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 0,
    minHeight: 10,
  },
  iconButton: {
    padding: 5,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: -60,
  },
  headerLogoImage: {
    width: 180,
    height: 180,
  },
});

export default MarketsScreen;
