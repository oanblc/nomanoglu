import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, StatusBar, FlatList, Image, Linking, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
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

// Türkçe format fiyatı sayıya çevir
const parseTurkishNumber = (str) => {
  if (!str) return 0;
  return parseFloat(str.toString().replace(/\./g, '').replace(',', '.'));
};

// Favori item component - fiyat değişim takibi için
const FavoriteItem = ({ item, onRemove }) => {
  const prevBuying = useRef(item.buying);
  const prevSelling = useRef(item.selling);
  const [buyingColor, setBuyingColor] = useState('#1A1A1A');
  const [sellingColor, setSellingColor] = useState('#1A1A1A');

  useEffect(() => {
    const currentBuying = parseTurkishNumber(item.buying);
    const currentSelling = parseTurkishNumber(item.selling);
    const oldBuying = parseTurkishNumber(prevBuying.current);
    const oldSelling = parseTurkishNumber(prevSelling.current);

    // Alış değişimi
    if (currentBuying > oldBuying) {
      setBuyingColor('#16a34a'); // yeşil
    } else if (currentBuying < oldBuying) {
      setBuyingColor('#dc2626'); // kırmızı
    }

    // Satış değişimi
    if (currentSelling > oldSelling) {
      setSellingColor('#16a34a'); // yeşil
    } else if (currentSelling < oldSelling) {
      setSellingColor('#dc2626'); // kırmızı
    }

    prevBuying.current = item.buying;
    prevSelling.current = item.selling;
  }, [item.buying, item.selling]);

  return (
    <View style={styles.favoriteCard}>
      <View style={styles.favoriteCardContent}>
        <View style={styles.favoriteInfo}>
          <Text style={styles.favoriteCode}>{item.name}</Text>
        </View>

        {/* Sağ - Fiyatlar */}
        <View style={styles.favoritePrices}>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>ALIŞ</Text>
            <Text style={[styles.priceValue, { color: buyingColor }]}>{item.buying}</Text>
          </View>
          <View style={styles.priceSeparator} />
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>SATIŞ</Text>
            <Text style={[styles.priceValue, { color: sellingColor }]}>{item.selling}</Text>
          </View>
        </View>

        {/* Sil Butonu */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => onRemove(item.code)}
        >
          <FontAwesome5 name="times" size={14} color="#999" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const FavoritesScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const sidebarRef = useRef(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
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

  // Arama ile filtrelenmiş ve favorilerde olmayan fiyatlar
  const filteredPrices = useMemo(() => {
    const notInFavorites = allPrices.filter(p => !favorites.find(f => f.code === p.code));
    if (!searchQuery || !searchQuery.trim()) return notInFavorites;
    const query = searchQuery.toLowerCase().trim();
    return notInFavorites.filter(p =>
      p.name?.toLowerCase().includes(query) ||
      p.code?.toLowerCase().includes(query)
    );
  }, [allPrices, favorites, searchQuery]);

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
    return <FavoriteItem item={item} onRemove={removeFavorite} />;
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
            <Ionicons name="menu" size={28} color={palette.headerText} />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.headerLogoImage}
              resizeMode="contain"
            />
          </View>

          <TouchableOpacity style={styles.iconButton} onPress={() => setAddModalVisible(true)}>
            <AntDesign name="plus" size={24} color={palette.headerText} />
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
              <TouchableOpacity onPress={() => {
                setAddModalVisible(false);
                setSearchQuery('');
              }}>
                <FontAwesome5 name="times" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Arama Kutusu */}
            <View style={styles.searchContainer}>
              <FontAwesome5 name="search" size={14} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Ürün ara..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClear}>
                  <FontAwesome5 name="times" size={12} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={styles.priceListScroll}>
              {filteredPrices.map((price, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.priceListItem}
                  onPress={() => {
                    addToFavorites(price);
                    setSearchQuery('');
                  }}
                >
                  <View style={styles.priceListInfo}>
                    <Text style={styles.priceListName}>{price.name}</Text>
                    <Text style={styles.priceListValues}>
                      A: {price.buying} / S: {price.selling}
                    </Text>
                  </View>
                  <FontAwesome5 name="plus-circle" size={20} color={palette.headerGradientStart} />
                </TouchableOpacity>
              ))}
              {allPrices.length === 0 && (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Fiyatlar yükleniyor...</Text>
                </View>
              )}
              {filteredPrices.length === 0 && allPrices.length > 0 && (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>
                    {searchQuery ? 'Sonuç bulunamadı' : 'Tüm ürünler favorilerde'}
                  </Text>
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
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  searchClear: {
    padding: 4,
  },
  priceListScroll: {
    paddingHorizontal: 10,
  },
  priceListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#eee',
  },
  priceListInfo: {
    flex: 1,
  },
  priceListName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  priceListValues: {
    fontSize: 11,
    color: '#888',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#888',
  },
});

export default FavoritesScreen;
