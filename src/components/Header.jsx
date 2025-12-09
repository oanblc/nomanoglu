import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Modal, Animated, Dimensions, Linking, ScrollView, Platform, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { palette, gradient } from '../../theme/colors';
import { typography } from '../../theme/fonts';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

const ALARMS_KEY = '@alarms';

// Tüm mevcut fiyatlar (Hero kartları için Alış / Satış)
const ALL_PRICES = [
  { symbol: 'USDTRY', name: 'Dolar', buying: '42,300', selling: '42,430', percent: '%0.00' },
  { symbol: 'EURTRY', name: 'Euro', buying: '48,934', selling: '49,200', percent: '%0.00' },
  { symbol: 'JPYTRY', name: 'Japon Yeni', buying: '0,2690', selling: '0,2712', percent: '%0.00' },
  { symbol: 'GBPTRY', name: 'Sterlin', buying: '55,650', selling: '56,110', percent: '%0.00' },
  { symbol: 'CHFTRY', name: 'İsviçre Frangı', buying: '52,004', selling: '52,866', percent: '%0.00' },
  { symbol: 'ALTIN', name: 'Gram Altın', buying: '3,240', selling: '3,245', percent: '%0.00' },
  { symbol: 'GUMUSTRY', name: 'Gümüş', buying: '42,10', selling: '42,15', percent: '%0.00' },
];

const Header = ({ topRates = [], navigation }) => {
  const insets = useSafeAreaInsets();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [priceModalVisible, setPriceModalVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-DRAWER_WIDTH));
  const [overlayOpacity] = useState(new Animated.Value(0));
  const [selectedPrices, setSelectedPrices] = useState([
    ALL_PRICES[0], // USD
    ALL_PRICES[1], // EUR
    ALL_PRICES[2], // JPY
  ]);

  const [alarmCount, setAlarmCount] = useState(0);

  const loadAlarmCount = async () => {
    try {
      const stored = await AsyncStorage.getItem(ALARMS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setAlarmCount(Array.isArray(parsed) ? parsed.length : 0);
      } else {
        setAlarmCount(0);
      }
    } catch (error) {
      console.log('Alarm sayısı okunamadı:', error);
    }
  };

  useEffect(() => {
    loadAlarmCount();
    if (navigation && navigation.addListener) {
      const unsubscribe = navigation.addListener('focus', loadAlarmCount);
      return unsubscribe;
    }
  }, [navigation]);

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
      } else if (action === 'contact' && navigation) {
        navigation.navigate('Iletisim');
      } else if (action === 'about' && navigation) {
        navigation.navigate('Hakkimizda');
      } else if (action === 'home' && navigation) {
        navigation.navigate('AnaSayfa');
      }
    }, 300);
  };

  const handlePriceSelect = (price) => {
    if (selectedPrices.length < 4) {
      setSelectedPrices([...selectedPrices, price]);
    }
    setPriceModalVisible(false);
  };

  const handleRemovePrice = (index) => {
    const newPrices = selectedPrices.filter((_, i) => i !== index);
    setSelectedPrices(newPrices);
  };

  return (
    <>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.container, { paddingTop: insets.top > 0 ? insets.top : 40 }]}
      >
        <StatusBar barStyle="light-content" backgroundColor={palette.headerGradientStart} />
        
        {/* Top Bar */}
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
          
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation && navigation.navigate('Alarmlar')}
          >
            <FontAwesome5 name="bell" size={24} color={palette.headerText} />
            {alarmCount > 0 && (
              <View style={styles.alarmBadge}>
                <Text style={styles.alarmBadgeText}>
                  {alarmCount > 99 ? '99+' : alarmCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Hero Rates - Scrollable */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.heroRatesScroll}
          contentContainerStyle={styles.heroRatesContent}
        >
          {selectedPrices.map((rate, index) => (
            <TouchableOpacity
              key={index}
              style={styles.heroCard}
              onLongPress={() => handleRemovePrice(index)}
            >
              <Text style={[styles.heroSymbol, typography.heroSymbol]}>{rate.symbol}</Text>

              <View style={styles.heroPricesRow}>
                <View style={styles.heroPriceCol}>
                  <Text style={styles.heroPriceLabel}>Alış</Text>
                  <Text style={styles.heroPriceText} numberOfLines={1}>
                    {rate.buying}
                  </Text>
                </View>
                <View style={styles.heroPriceCol}>
                  <Text style={styles.heroPriceLabel}>Satış</Text>
                  <Text style={styles.heroPriceText} numberOfLines={1}>
                    {rate.selling}
                  </Text>
                </View>
              </View>

              {/* Alış altında yüzde, Satış altında çizgi – aynı satırda ortalı */}
              <View style={styles.heroFooterRow}>
                <View style={styles.heroPriceCol}>
                  <Text style={styles.percentGreen}>{rate.percent}</Text>
                </View>
                <View style={[styles.heroPriceCol, styles.heroFooterRightCol]}>
                  <View style={styles.greenBar} />
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* Add Price Button */}
          {selectedPrices.length < 4 && (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setPriceModalVisible(true)}
            >
              <FontAwesome5 name="plus" size={20} color={palette.headerText} />
              <Text style={styles.addButtonText}>Ekle</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </LinearGradient>

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
              {/* Drawer İçeriği - YENİ TASARIM */}
              <View style={styles.drawerContentContainer}>
                
                {/* 1. Modern Header: Logo + Kapat Butonu */}
                <View style={[styles.modernDrawerHeader, { marginTop: insets.top }]}>
                  <Image 
                    source={require('../../assets/logo.png')} 
                    style={styles.modernLogo}
                    resizeMode="contain"
                  />
                  <TouchableOpacity onPress={closeDrawer} style={styles.closeButton}>
                    <FontAwesome5 name="times" size={18} color="rgba(255,255,255,0.85)" />
                  </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                {/* 2. Menü Listesi */}
                <View style={styles.menuList}>
                  
                  {/* Menü Öğeleri */}
                  <TouchableOpacity style={styles.modernMenuItem} onPress={() => handleMenuPress('home')}>
                    <View style={styles.menuIconBox}>
                      <FontAwesome5 name="home" size={18} color="#FFFFFF" />
                    </View>
                    <Text style={styles.modernMenuText}>Ana Sayfa</Text>
                    <FontAwesome5 name="chevron-right" size={12} color="rgba(255,255,255,0.5)" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.modernMenuItem} onPress={() => handleMenuPress('markets')}>
                    <View style={styles.menuIconBox}>
                      <FontAwesome5 name="chart-line" size={18} color="#FFFFFF" />
                    </View>
                    <Text style={styles.modernMenuText}>Piyasalar</Text>
                    <FontAwesome5 name="chevron-right" size={12} color="rgba(255,255,255,0.5)" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.modernMenuItem} onPress={() => handleMenuPress('favorites')}>
                    <View style={styles.menuIconBox}>
                      <FontAwesome5 name="star" size={18} color="#FFFFFF" />
                    </View>
                    <Text style={styles.modernMenuText}>Favorilerim</Text>
                    <FontAwesome5 name="chevron-right" size={12} color="rgba(255,255,255,0.5)" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.modernMenuItem} onPress={() => handleMenuPress('alarms')}>
                    <View style={styles.menuIconBox}>
                      <FontAwesome5 name="bell" size={18} color="#FFFFFF" />
                    </View>
                    <Text style={styles.modernMenuText}>Alarmlar</Text>
                    <FontAwesome5 name="chevron-right" size={12} color="rgba(255,255,255,0.5)" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.modernMenuItem} onPress={() => handleMenuPress('about')}>
                    <View style={styles.menuIconBox}>
                      <FontAwesome5 name="info-circle" size={18} color="#FFFFFF" />
                    </View>
                    <Text style={styles.modernMenuText}>Kurumsal</Text>
                    <FontAwesome5 name="chevron-right" size={12} color="rgba(255,255,255,0.5)" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.modernMenuItem} onPress={() => handleMenuPress('contact')}>
                    <View style={styles.menuIconBox}>
                      <FontAwesome5 name="envelope" size={18} color="#FFFFFF" />
                    </View>
                    <Text style={styles.modernMenuText}>İletişim</Text>
                    <FontAwesome5 name="chevron-right" size={12} color="rgba(255,255,255,0.5)" />
                  </TouchableOpacity>
                  
                </View>

                {/* 3. Alt Footer: İletişim Butonları */}
                <View style={[styles.modernFooter, { paddingBottom: insets.bottom + 20 }]}>
                  <Text style={styles.footerTitle}>BİZE ULAŞIN</Text>
                <View style={styles.footerButtons}>
                  <TouchableOpacity 
                    style={[styles.footerBtn, { backgroundColor: palette.headerGradientEnd }]} 
                    onPress={() => handleMenuPress('whatsapp')}
                  >
                    <FontAwesome5 name="whatsapp" size={20} color="#fff" />
                    <Text style={styles.footerBtnText}>WhatsApp</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.footerBtn, { backgroundColor: palette.headerGradientEnd }]} 
                    onPress={() => handleMenuPress('phone')}
                  >
                    <FontAwesome5 name="phone" size={18} color="#fff" />
                    <Text style={styles.footerBtnText}>Ara</Text>
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

      {/* Price Selection Modal */}
      <Modal
        visible={priceModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPriceModalVisible(false)}
      >
        <View style={styles.priceModalContainer}>
          <View style={styles.priceModalContent}>
            <View style={styles.priceModalHeader}>
              <Text style={styles.priceModalTitle}>Fiyat Seçin</Text>
              <TouchableOpacity onPress={() => setPriceModalVisible(false)}>
                <FontAwesome5 name="times" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.priceList}>
              {ALL_PRICES.filter(p => !selectedPrices.find(sp => sp.symbol === p.symbol)).map((price, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.priceOption}
                  onPress={() => handlePriceSelect(price)}
                >
                  <View>
                    <Text style={styles.priceOptionSymbol}>{price.symbol}</Text>
                    <Text style={styles.priceOptionName}>{price.name}</Text>
                  </View>
                  <View>
                    <Text style={styles.priceOptionValue}>Alış: {price.buying}</Text>
                    <Text style={styles.priceOptionValue}>Satış: {price.selling}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
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
    color: palette.headerText,
  },
  subtitle: {
    color: palette.headerText,
    fontSize: 11,
    letterSpacing: 3,
    marginTop: 2,
    fontWeight: '300',
  },
  iconButton: {
    padding: 5,
    position: 'relative',
  },
  alarmBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: palette.headerGradientEnd,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  alarmBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  heroRatesScroll: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  heroRatesContent: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  heroCard: {
    width: 135,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
    borderRightWidth: 1.5,
    borderRightColor: 'rgba(255,255,255,0.35)', // üst kartlar arası ayraç daha belirgin
  },
  heroSymbol: {
    color: palette.heroSymbol,
    marginBottom: 6,
  },
  heroPricesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  heroPriceCol: {
    flex: 1,
  },
  heroPriceLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  heroPriceText: {
    color: palette.headerText,
    fontSize: 15,
    fontWeight: '600',
  },
  heroFooterRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroFooterRightCol: {
    alignItems: 'flex-start',
  },
  percentGreen: {
    color: palette.percentGreen,
    fontSize: 12,
  },
  greenBar: {
    height: 2,
    width: 22,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 1,
  },
  addButton: {
    width: 110,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  addButtonText: {
    color: palette.headerText,
    fontSize: 12,
    marginTop: 5,
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
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  drawerGradient: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  drawerHeader: {
    paddingHorizontal: 20,
    alignItems: 'center',
    // justifyContent: 'center', // Inline style ile yönetiliyor
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
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  modernLogo: {
    width: 180,
    height: 52,
    tintColor: '#FFFFFF',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginBottom: 4,
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  modernMenuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modernFooter: {
    padding: 20,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
  },
  footerTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
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
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  // Price Modal Styles
  priceModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  priceModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  priceModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  priceModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  priceList: {
    padding: 10,
  },
  priceOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  priceOptionSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  priceOptionName: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  priceOptionValue: {
    fontSize: 18,
    fontWeight: '500',
    color: palette.headerGradientStart,
  },
});

export default Header;
