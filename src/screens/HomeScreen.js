import React, { useMemo } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import PriceList from '../components/PriceList';
import { useWebSocket } from '../hooks/useWebSocket';
import { palette } from '../../theme/colors';

// Helper to format prices
const formatPrice = (value) => {
  if (!value) return '0,0000';
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 0, 
    maximumFractionDigits: 4,
  }).format(value);
};

// Initial Mock Data from HTML
const INITIAL_DATA = [
  { code: 'USDTRY', name: 'Amerikan Doları', buying: '42,300', selling: '42,430', percent: '%0.00', time: '14:15' },
  { code: 'EURTRY', name: 'Euro', buying: '48,934', selling: '49,200', percent: '%0.00', time: '14:15' },
  { code: 'EURUSD', name: 'EUR/USD', buying: '1,1568', selling: '1,1595', percent: '%0.00', time: '14:15' },
  { code: 'GBPTRY', name: 'İngiliz Sterlini', buying: '55,650', selling: '56,110', percent: '%0.00', time: '14:15' },
  { code: 'CHFTRY', name: 'İsviçre Frangı', buying: '52,004', selling: '52,866', percent: '%0.00', time: '14:15' },
  { code: 'AUDTRY', name: 'Avustralya Doları', buying: '26,861', selling: '27,724', percent: '%0.00', time: '14:15' },
  { code: 'CADTRY', name: 'Kanada Doları', buying: '29,735', selling: '31,714', percent: '%0.00', time: '14:15' },
  { code: 'SARTRY', name: 'Suudi Arabistan Riyali', buying: '11,117', selling: '11,657', percent: '%0.00', time: '14:15' },
];

const HomeScreen = ({ navigation }) => {
  const { prices, isConnected } = useWebSocket();

  // Combine live data with initial structure or just use live data if available
  const displayData = useMemo(() => {
    if (!prices || prices.length === 0) return INITIAL_DATA;

    // Map live prices to our format
    return prices.map(p => ({
      code: p.code,
      name: p.name || p.code, // Fallback name
      buying: formatPrice(p.calculatedAlis),
      selling: formatPrice(p.calculatedSatis),
      percent: '%0.00', // Calculation needed if change is available
      time: '14:15' // Static for now or use real time
    }));
  }, [prices]);

  // Top rates for Hero section (USD, EUR, JPY usually)
  const topRates = useMemo(() => {
    const targets = ['USDTRY', 'EURTRY', 'JPYTRY'];
    return targets.map(code => {
      const item = displayData.find(d => d.code === code);
      return {
        symbol: code,
        price: item ? item.selling : '0,0000',
        percent: item ? item.percent : '%0.00'
      };
    });
  }, [displayData]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={palette.headerGradientStart} />
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
