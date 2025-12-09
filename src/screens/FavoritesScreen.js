import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Modal, Linking, ScrollView, StatusBar, FlatList, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { palette, gradient } from '../../theme/colors';
import { typography } from '../../theme/fonts';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;
const FAVORITES_KEY = '@favorites';

const FavoritesScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-DRAWER_WIDTH));
  const [overlayOpacity] = useState(new Animated.Value(0));
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

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

  const removeFavorite = async (code) => {
    try {
      const updated = favorites.filter(f => f.code !== code);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      setFavorites(updated);
    } catch (error) {
      console.log('Favori silinemedi:', error);
    }
  };

  const addToFavorites = async (item) => {
    try {
      const exists = favorites.find(f => f.code === item.code);
      if (!exists) {
        const updated = [...favorites, item];
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
        setFavorites(updated);
      }
      setAddModalVisible(false);
    } catch (error) {
      console.log('Favori eklenemedi:', error);
    }
  };

  // Tüm mevcut fiyatlar
  const ALL_PRICES = [
    { code: 'USDTRY', name: 'Amerikan Doları', buying: '42,300', selling: '42,430' },
    { code: 'EURTRY', name: 'Euro', buying: '48,934', selling: '49,200' },
    { code: 'GBPTRY', name: 'İngiliz Sterlini', buying: '55,650', selling: '56,110' },
    { code: 'CHFTRY', name: 'İsviçre Frangı', buying: '52,004', selling: '52,866' },
    { code: 'JPYTRY', name: 'Japon Yeni', buying: '0,2690', selling: '0,2712' },
    { code: 'ALTIN', name: 'Gram Altın', buying: '3,240', selling: '3,245' },
    { code: 'GUMUSTRY', name: 'Gümüş', buying: '42,10', selling: '42,15' },
  ];

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
      } else if (action === 'about' && navigation) {
        navigation.navigate('Hakkimizda');
      } else if (action === 'contact' && navigation) {
        navigation.navigate('Iletisim');
      } else if (action === 'home' && navigation) {
        navigation.navigate('AnaSayfa');
      }
    }, 300);
  };

  const renderFavoriteItem = ({ item }) => {
    const isGold = item.code.includes('ALTIN') || item.code.includes('GUMUS');

    return (
      <View style={styles.favoriteCard}>
        <View style={styles.favoriteCardContent}>
          {/* Sol - İkon ve Bilgi */}
          <LinearGradient
            colors={[palette.headerGradientStart, palette.headerGradientEnd]}
            style={styles.favoriteIconGradient}
          >
            <FontAwesome5
              name={isGold ? 'coins' : 'dollar-sign'}
              size={14}
              color={palette.headerText}
            />
          </LinearGradient>

          <View style={styles.favoriteInfo}>
            <Text style={styles.favoriteCode}>{item.code}</Text>
            <Text style={styles.favoriteName}>{item.name}</Text>
          </View>

          {/* Sağ - Fiyatlar */}
          <View style={styles.favoritePrices}>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>ALIŞ</Text>
              <Text style={styles.priceValue}>{item.buying}</Text>
            </View>
            <View style={styles.priceSeparator} />
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>SATIŞ</Text>
              <Text style={[styles.priceValue, styles.sellPrice]}>{item.selling}</Text>
            </View>
          </View>

          {/* Sil Butonu */}
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => removeFavorite(item.code)}
          >
            <FontAwesome5 name="times" size={14} color="#999" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <FontAwesome5 name="star" size={80} color="#e0e0e0" />
      <Text style={styles.emptyTitle}>Henüz favori eklemediniz</Text>
      <Text style={styles.emptyText}>Fiyat listesinde bir fiyata uzun basarak favorilere ekleyebilirsiniz</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.headerGradientStart} />

      {/* Fixed Header */}
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

          <TouchableOpacity style={styles.iconButton} onPress={() => setAddModalVisible(true)}>
            <FontAwesome5 name="plus" size={24} color={palette.headerText} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Favorites List */}
      <FlatList
        data={favorites}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item.code}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          { padding: 16, paddingBottom: 60 + insets.bottom + 10 }
        ]}
      />

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

      {/* Add to Favorites Modal */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.addModalContainer}>
          <View style={styles.addModalContent}>
            <View style={styles.addModalHeader}>
              <Text style={styles.addModalTitle}>Favorilere Ekle</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <FontAwesome5 name="times" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.priceListScroll}>
              {ALL_PRICES.filter(p => !favorites.find(f => f.code === p.code)).map((price, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.priceOption}
                  onPress={() => addToFavorites(price)}
                >
                  <View>
                    <Text style={styles.priceOptionCode}>{price.code}</Text>
                    <Text style={styles.priceOptionName}>{price.name}</Text>
                  </View>
                  <View style={styles.priceOptionRight}>
                    <Text style={styles.priceOptionValue}>{price.selling}</Text>
                    <FontAwesome5 name="plus-circle" size={20} color={palette.headerGradientStart} />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
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
  listContent: {
    flexGrow: 1,
  },
  // Compact Favorite Card Styles
  favoriteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(247, 222, 0, 0.12)',
  },
  favoriteCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  favoriteIconGradient: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  favoriteInfo: {
    flex: 1,
    marginRight: 12,
  },
  favoriteCode: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.3,
  },
  favoriteName: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  favoritePrices: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceItem: {
    alignItems: 'center',
    minWidth: 50,
  },
  priceValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  sellPrice: {
    color: '#F7DE00',
  },
  priceSeparator: {
    width: 1,
    height: 24,
    backgroundColor: '#E8E8E8',
    marginHorizontal: 10,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  // Legacy styles
  favoriteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#FFFFFF',
  },
  favoriteLeft: {
    flex: 1,
  },
  favoriteCenter: {
    flexDirection: 'row',
    gap: 20,
    marginRight: 12,
  },
  priceColumn: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#888',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  favoritePrice: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.headerGradientStart,
  },
  removeButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
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
    tintColor: '#FFFFFF',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
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
  // --- YENİ TASARIM STİLLERİ (Header ile aynı) ---
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
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.1)',
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
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  modernMenuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  modernFooter: {
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  footerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.6)',
    marginBottom: 8,
    letterSpacing: 1,
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  footerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
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
    marginLeft: 8,
  },
  versionText: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 11,
    color: 'rgba(0,0,0,0.5)',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    marginHorizontal: 18,
    marginBottom: 8,
  },
  // Add Modal Styles
  addModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  addModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  addModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  addModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  priceListScroll: {
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
  priceOptionCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  priceOptionName: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  priceOptionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceOptionValue: {
    fontSize: 18,
    fontWeight: '500',
    color: palette.headerGradientStart,
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
    borderColor: '#25D366',
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
});

export default FavoritesScreen;
