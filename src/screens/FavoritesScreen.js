import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, StatusBar, FlatList, Image, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { palette, gradient } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import Sidebar from '../components/Sidebar';
import { useWebSocket } from '../hooks/useWebSocket';

const FAVORITES_KEY = '@favorites';

// Helper to format prices
const formatPrice = (value) => {
  if (!value) return '0,0000';
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(value);
};

const FavoritesScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const sidebarRef = useRef(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const { prices, isConnected } = useWebSocket();

  // Backend'den gelen fiyatları formatla
  const allPrices = useMemo(() => {
    if (!prices || prices.length === 0) return [];

    return prices.map(p => ({
      code: p.code,
      name: p.name || p.code,
      buying: formatPrice(p.calculatedAlis),
      selling: formatPrice(p.calculatedSatis),
    }));
  }, [prices]);

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

  // Favorileri güncel fiyatlarla eşleştir
  const favoritesWithPrices = useMemo(() => {
    return favorites.map(fav => {
      const livePrice = allPrices.find(p => p.code === fav.code);
      if (livePrice) {
        return { ...fav, buying: livePrice.buying, selling: livePrice.selling };
      }
      return fav;
    });
  }, [favorites, allPrices]);

  const openDrawer = () => {
    sidebarRef.current?.open();
  };

  const goToHome = () => {
    navigation.navigate('MainTabs', { screen: 'AnaSayfa' });
  };

  const openInstagram = () => {
    Linking.openURL('https://www.instagram.com/nomanoglukuyumcu/');
  };

  const openTikTok = () => {
    Linking.openURL('https://www.tiktok.com/@nomanoglukuyumcu');
  };

  const openWebsite = () => {
    Linking.openURL('https://www.nomanoglu.com.tr/');
  };

  const renderFavoriteItem = ({ item }) => {
    return (
      <View style={styles.favoriteCard}>
        <View style={styles.favoriteCardContent}>
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
      <Text style={styles.emptyText}>Sağ üstteki + butonuna basarak favorilere ekleyebilirsiniz</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={palette.headerGradientStart} />

      {/* Header - Piyasalar sayfasıyla aynı */}
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
        data={favoritesWithPrices}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item.code}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          { padding: 16 }
        ]}
      />

      {/* Bottom Tab Bar - Same as other screens */}
      <View style={[styles.bottomTabBar, { paddingBottom: insets.bottom > 0 ? insets.bottom + 4 : 8 }]}>
        <TouchableOpacity style={styles.tabItem} onPress={goToHome}>
          <FontAwesome5 name="home" size={20} color={palette.navInactive} />
          <Text style={styles.tabLabel}>Ana Sayfa</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={openInstagram}>
          <FontAwesome5 name="instagram" size={20} color={palette.navInactive} />
          <Text style={styles.tabLabel}>Instagram</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={openTikTok}>
          <FontAwesome5 name="tiktok" size={20} color={palette.navInactive} />
          <Text style={styles.tabLabel}>TikTok</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={openWebsite}>
          <FontAwesome5 name="globe" size={20} color={palette.navInactive} />
          <Text style={styles.tabLabel}>Web Sitesi</Text>
        </TouchableOpacity>
      </View>

      {/* Sidebar Component */}
      <Sidebar ref={sidebarRef} navigation={navigation} />

      {/* Add to Favorites Modal - Backend fiyatlarıyla */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.addModalContainer}>
          <View style={[styles.addModalContent, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
            <View style={styles.addModalHeader}>
              <Text style={styles.addModalTitle}>Favorilere Ekle</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <FontAwesome5 name="times" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.priceListScroll}>
              {allPrices.filter(p => !favorites.find(f => f.code === p.code)).map((price, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.priceOption}
                  onPress={() => addToFavorites(price)}
                >
                  <View>
                    <Text style={styles.priceOptionCode}>{price.name}</Text>
                    <Text style={styles.priceOptionName}>{price.code}</Text>
                  </View>
                  <View style={styles.priceOptionRight}>
                    <Text style={styles.priceOptionValue}>{price.selling}</Text>
                    <FontAwesome5 name="plus-circle" size={20} color={palette.headerGradientStart} />
                  </View>
                </TouchableOpacity>
              ))}
              {allPrices.length === 0 && (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Fiyatlar yükleniyor...</Text>
                </View>
              )}
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
    paddingBottom: 15,
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
  listContent: {
    flexGrow: 1,
  },
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
  priceLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#888',
    marginBottom: 4,
    letterSpacing: 0.5,
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
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
    paddingVertical: 8,
  },
  tabLabel: {
    ...typography.navLabel,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    color: palette.navInactive,
  },
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#888',
  },
});

export default FavoritesScreen;
