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
        <StatusBar barStyle="dark-content" backgroundColor={palette.headerGradientStart} />
        
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
            <View style={styles.drawerContainer}>
              {/* Header - Sarı Arka Plan */}
              <LinearGradient
                colors={['#F7DE00', '#F7DE00']}
                style={[styles.drawerHeader, { paddingTop: insets.top + 12 }]}
              >
                <View style={styles.drawerHeaderRow}>
                  <Image
                    source={require('../../assets/logo.png')}
                    style={styles.drawerLogoImg}
                    resizeMode="contain"
                  />
                  <TouchableOpacity onPress={closeDrawer} style={styles.closeBtnSmall}>
                    <FontAwesome5 name="times" size={14} color="#1A1A1A" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>

              {/* Menu - Liste */}
              <View style={styles.menuContainer}>
                {/* Navigation Items - Alt Alta */}
                <View style={styles.menuList}>
                  <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuPress('home')}>
                    <View style={styles.menuIconBox}>
                      <FontAwesome5 name="home" size={16} color="#F7DE00" />
                    </View>
                    <Text style={styles.menuItemText}>Ana Sayfa</Text>
                    <FontAwesome5 name="chevron-right" size={12} color="#D1D5DB" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuPress('markets')}>
                    <View style={styles.menuIconBox}>
                      <FontAwesome5 name="chart-line" size={16} color="#F7DE00" />
                    </View>
                    <Text style={styles.menuItemText}>Piyasalar</Text>
                    <FontAwesome5 name="chevron-right" size={12} color="#D1D5DB" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuPress('favorites')}>
                    <View style={styles.menuIconBox}>
                      <FontAwesome5 name="star" size={16} color="#F7DE00" />
                    </View>
                    <Text style={styles.menuItemText}>Favoriler</Text>
                    <FontAwesome5 name="chevron-right" size={12} color="#D1D5DB" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuPress('alarms')}>
                    <View style={styles.menuIconBox}>
                      <FontAwesome5 name="bell" size={16} color="#F7DE00" />
                    </View>
                    <Text style={styles.menuItemText}>Alarmlar</Text>
                    <FontAwesome5 name="chevron-right" size={12} color="#D1D5DB" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuPress('about')}>
                    <View style={styles.menuIconBox}>
                      <FontAwesome5 name="building" size={16} color="#6B7280" />
                    </View>
                    <Text style={styles.menuItemText}>Hakkımızda</Text>
                    <FontAwesome5 name="chevron-right" size={12} color="#D1D5DB" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuPress('contact')}>
                    <View style={styles.menuIconBox}>
                      <FontAwesome5 name="envelope" size={16} color="#6B7280" />
                    </View>
                    <Text style={styles.menuItemText}>İletişim</Text>
                    <FontAwesome5 name="chevron-right" size={12} color="#D1D5DB" />
                  </TouchableOpacity>
                </View>

                {/* Contact Buttons */}
                <View style={styles.contactSection}>
                  <TouchableOpacity
                    style={styles.contactBtn}
                    onPress={() => handleMenuPress('whatsapp')}
                  >
                    <FontAwesome5 name="whatsapp" size={16} color="#1A1A1A" />
                    <Text style={[styles.contactBtnLabel, { color: '#1A1A1A' }]}>WhatsApp</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.contactBtn, styles.contactBtnAlt]}
                    onPress={() => handleMenuPress('phone')}
                  >
                    <FontAwesome5 name="phone-alt" size={14} color="#FFF" />
                    <Text style={styles.contactBtnLabel}>Ara</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Footer */}
              <View style={[styles.drawerFooterCompact, { paddingBottom: insets.bottom + 8 }]}>
                <Text style={styles.footerText}>v1.0.0 • © 2024 Nomanoğlu</Text>
              </View>
            </View>
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
    borderTopColor: 'rgba(0,0,0,0.1)',
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
    borderRightColor: 'rgba(0,0,0,0.15)',
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
    color: 'rgba(0,0,0,0.6)',
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
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 1,
  },
  addButton: {
    width: 110,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
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
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 20,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  // Modern Drawer Styles
  drawerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  drawerHeaderSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  drawerHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  drawerLogo: {
    width: 140,
    height: 45,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(26, 26, 26, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerTagline: {
    fontSize: 12,
    color: '#1A1A1A',
    fontWeight: '500',
    opacity: 0.7,
  },
  menuScrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  menuScrollContent: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  menuSection: {
    marginBottom: 24,
  },
  menuSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactCard: {
    backgroundColor: '#F7DE00',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  contactCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  contactBtns: {
    flexDirection: 'row',
    gap: 10,
  },
  contactBtnWhatsapp: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  contactBtnCall: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  contactBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  drawerFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    alignItems: 'center',
  },
  footerVersion: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 2,
  },
  footerCopyright: {
    fontSize: 10,
    color: '#9CA3AF',
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
  // Compact Sidebar Styles
  drawerHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  drawerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  drawerLogoImg: {
    width: 125,
    height: 45,
  },
  closeBtnSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(26, 26, 26, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
    justifyContent: 'space-between',
  },
  menuList: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    marginBottom: 6,
  },
  menuIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  contactSection: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7DE00',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  contactBtnAlt: {
    backgroundColor: '#1A1A1A',
  },
  contactBtnLabel: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  drawerFooterCompact: {
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  footerText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});

export default Header;
