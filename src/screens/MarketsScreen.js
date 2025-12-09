import React, { useMemo, useState } from 'react';
import { View, StyleSheet, StatusBar, Text, TouchableOpacity, Animated, Dimensions, Modal, Linking, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import PriceList from '../components/PriceList';
import { useWebSocket } from '../hooks/useWebSocket';
import { palette, gradient } from '../../theme/colors';
import { typography } from '../../theme/fonts';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

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
  const { prices, isConnected } = useWebSocket();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-DRAWER_WIDTH));
  const [overlayOpacity] = useState(new Animated.Value(0));

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
    setDrawerVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setDrawerVisible(false));
  };

  const handleMenuPress = (action) => {
    closeDrawer();
    setTimeout(() => {
      if (action === 'whatsapp') {
        Linking.openURL('https://wa.me/905322904601');
      } else if (action === 'phone') {
        Linking.openURL('tel:+905322904601');
      } else if (action === 'markets' && navigation) {
        navigation.navigate('Piyasa');
      } else if (action === 'alarms' && navigation) {
        navigation.navigate('Alarmlar');
      } else if (action === 'favorites' && navigation) {
        navigation.navigate('Favorilerim');
      } else if (action === 'about' && navigation) {
        navigation.navigate('Hakkimizda');
      } else if (action === 'contact' && navigation) {
        navigation.navigate('Iletisim');
      } else if (action === 'home' && navigation) {
        navigation.navigate('AnaSayfa');
      }
    }, 300);
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

      {/* Drawer Menu */}
      <Modal
        visible={drawerVisible}
        transparent
        animationType="none"
        onRequestClose={closeDrawer}
      >
        <View style={styles.modalContainer}>
          <Animated.View 
            style={[
              styles.drawer,
              { transform: [{ translateX: slideAnim }] }
            ]}
          >
            <LinearGradient
              colors={gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.drawerGradient}
            >
              <View style={styles.drawerContentContainer}>
                
                {/* 1. Modern Header: Logo + Kapat Butonu */}
                <View style={[styles.modernDrawerHeader, { marginTop: insets.top }]}>
                  <Image 
                    source={require('../../assets/logo.png')} 
                    style={styles.modernLogo}
                    resizeMode="contain"
                  />
                  <TouchableOpacity onPress={closeDrawer} style={styles.closeButton}>
                    <FontAwesome5 name="times" size={20} color={palette.headerText} />
                  </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                {/* 2. Menü Listesi */}
                <View style={styles.menuList}>
                  <TouchableOpacity style={styles.modernMenuItem} onPress={() => handleMenuPress('home')}>
                    <View style={styles.menuIconBox}>
                      <FontAwesome5 name="home" size={18} color={palette.headerText} />
                    </View>
                    <Text style={styles.modernMenuText}>Ana Sayfa</Text>
                    <FontAwesome5 name="chevron-right" size={12} color="rgba(0,0,0,0.3)" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.modernMenuItem} onPress={() => handleMenuPress('markets')}>
                    <View style={styles.menuIconBox}>
                      <FontAwesome5 name="chart-line" size={18} color={palette.headerText} />
                    </View>
                    <Text style={styles.modernMenuText}>Piyasalar</Text>
                    <FontAwesome5 name="chevron-right" size={12} color="rgba(0,0,0,0.3)" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.modernMenuItem} onPress={() => handleMenuPress('favorites')}>
                    <View style={styles.menuIconBox}>
                      <FontAwesome5 name="star" size={18} color={palette.headerText} />
                    </View>
                    <Text style={styles.modernMenuText}>Favorilerim</Text>
                    <FontAwesome5 name="chevron-right" size={12} color="rgba(0,0,0,0.3)" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.modernMenuItem} onPress={() => handleMenuPress('alarms')}>
                    <View style={styles.menuIconBox}>
                      <FontAwesome5 name="bell" size={18} color={palette.headerText} />
                    </View>
                    <Text style={styles.modernMenuText}>Alarmlar</Text>
                    <FontAwesome5 name="chevron-right" size={12} color="rgba(0,0,0,0.3)" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.modernMenuItem} onPress={() => handleMenuPress('about')}>
                    <View style={styles.menuIconBox}>
                      <FontAwesome5 name="info-circle" size={18} color={palette.headerText} />
                    </View>
                    <Text style={styles.modernMenuText}>Kurumsal</Text>
                    <FontAwesome5 name="chevron-right" size={12} color="rgba(0,0,0,0.3)" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.modernMenuItem} onPress={() => handleMenuPress('contact')}>
                    <View style={styles.menuIconBox}>
                      <FontAwesome5 name="envelope" size={18} color={palette.headerText} />
                    </View>
                    <Text style={styles.modernMenuText}>İletişim</Text>
                    <FontAwesome5 name="chevron-right" size={12} color="rgba(0,0,0,0.3)" />
                  </TouchableOpacity>
                </View>

                {/* 3. Alt Footer: İletişim Butonları */}
                <View style={[styles.modernFooter, { paddingBottom: insets.bottom + 20 }]}>
                  <Text style={styles.footerTitle}>BİZE ULAŞIN</Text>
                  <View style={styles.footerButtons}>
                    <TouchableOpacity
                      style={styles.footerBtnWhatsapp}
                      onPress={() => handleMenuPress('whatsapp')}
                    >
                      <FontAwesome5 name="whatsapp" size={18} color="#F7DE00" />
                      <Text style={styles.footerBtnTextDark}>WhatsApp</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.footerBtnPhone}
                      onPress={() => handleMenuPress('phone')}
                    >
                      <FontAwesome5 name="phone" size={16} color="#F7DE00" />
                      <Text style={styles.footerBtnTextDark}>Ara</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.versionText}>v1.0.0 • Nomanoğlu Altın</Text>
                </View>

              </View>
            </LinearGradient>
          </Animated.View>

          <Animated.View 
            style={[
              styles.overlay,
              { opacity: overlayOpacity }
            ]}
          >
            <TouchableOpacity 
              style={{ flex: 1 }}
              activeOpacity={1}
              onPress={closeDrawer}
            />
          </Animated.View>
        </View>
      </Modal>
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
  logo: {
    color: '#FFFFFF',
    fontSize: 24,
    letterSpacing: 2,
    fontWeight: '400',
    fontFamily: 'serif',
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 11,
    letterSpacing: 3,
    marginTop: 2,
    fontWeight: '300',
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  // Drawer Styles
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  drawer: {
    width: DRAWER_WIDTH,
    backgroundColor: '#FFFFFF',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 16,
  },
  drawerGradient: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawerHeader: {
    paddingHorizontal: 20,
    alignItems: 'center',
    // justifyContent: 'center',
  },
  drawerLogoImage: {
    width: 180,
    height: 60,
    marginBottom: 5,
  },
  drawerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 4,
    fontWeight: '600',
    marginTop: 0,
  },
  logoCircleText: {
    fontSize: 36,
    fontWeight: '300',
    color: '#FFFFFF',
    fontFamily: 'serif',
  },
  drawerLogo: {
    fontSize: 26,
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: 3,
    fontFamily: 'serif',
    marginBottom: 4,
  },
  drawerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 2,
    fontWeight: '300',
  },
  menuList: {
    paddingTop: 10,
    paddingBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e8e8e8',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    color: '#2c3e50',
    marginLeft: 14,
    fontWeight: '500',
  },
  // --- YENİ TASARIM STİLLERİ ---
  drawerContentContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modernDrawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modernLogo: {
    width: 140,
    height: 40,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  modernMenuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  modernFooter: {
    padding: 20,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
  },
  footerTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.6)',
    marginBottom: 12,
    letterSpacing: 1,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  footerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 3,
  },
  footerBtnText: {
    color: '#1A1A1A',
    fontWeight: '600',
    fontSize: 14,
  },
  footerBtnWhatsapp: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F7DE00',
  },
  footerBtnPhone: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F7DE00',
  },
  footerBtnTextDark: {
    color: '#1A1A1A',
    fontWeight: '700',
    fontSize: 14,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: 'rgba(0,0,0,0.5)',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    marginHorizontal: 20,
    marginBottom: 10,
  },
});

export default MarketsScreen;

