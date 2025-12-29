import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, StatusBar, TextInput, Alert, Image, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { palette, gradient } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import { sendTestNotification } from '../services/NotificationService';
import Sidebar from '../components/Sidebar';
import { useWebSocket } from '../hooks/useWebSocket';

const ALARMS_KEY = '@alarms';

// Helper to format prices
const formatPrice = (value) => {
  if (!value) return '0,0000';
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(value);
};

const AlarmsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const sidebarRef = useRef(null);
  const [alarms, setAlarms] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
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
    loadAlarms();
    // Sayfa her odaklandığında alarmları yenile
    if (navigation && navigation.addListener) {
      const unsubscribe = navigation.addListener('focus', loadAlarms);
      return unsubscribe;
    }
  }, [navigation]);

  const [selectedPrice, setSelectedPrice] = useState(null);
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState('above');
  const [priceType, setPriceType] = useState('selling');

  const loadAlarms = async () => {
    try {
      const stored = await AsyncStorage.getItem(ALARMS_KEY);
      if (stored) {
        setAlarms(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Alarmlar yüklenemedi:', error);
    }
  };

  const createAlarm = async () => {
    if (!selectedPrice || !targetPrice) {
      return;
    }

    try {
      const newAlarm = {
        id: Date.now().toString(),
        code: selectedPrice.code,
        name: selectedPrice.name,
        priceType: priceType === 'buying' ? 'Alış' : 'Satış',
        condition: condition === 'above' ? '>' : '<',
        targetPrice: targetPrice,
        createdAt: new Date().toISOString(),
      };

      const updated = [...alarms, newAlarm];
      await AsyncStorage.setItem(ALARMS_KEY, JSON.stringify(updated));
      setAlarms(updated);

      setSelectedPrice(null);
      setTargetPrice('');
      setCondition('above');
      setPriceType('selling');
      setModalVisible(false);
    } catch (error) {
      console.log('Alarm oluşturulamadı:', error);
    }
  };

  const deleteAlarm = async (id) => {
    try {
      const updated = alarms.filter(a => a.id !== id);
      await AsyncStorage.setItem(ALARMS_KEY, JSON.stringify(updated));
      setAlarms(updated);
    } catch (error) {
      console.log('Alarm silinemedi:', error);
    }
  };

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

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      Alert.alert(
        'Test Bildirimi Gönderildi',
        'Bildirim panelini kontrol edin!',
        [{ text: 'Tamam' }]
      );
    } catch (error) {
      Alert.alert('Hata', 'Bildirim gönderilemedi. Lütfen bildirim izinlerini kontrol edin.');
    }
  };

  const renderEmpty = () => (
    <View style={styles.empty}>
      <FontAwesome5 name="bell-slash" size={80} color="#e0e0e0" />
      <Text style={styles.emptyTitle}>Henüz alarm oluşturmadınız</Text>
      <Text style={styles.emptySubtitle}>Sağ üstteki + simgesine tıklayarak alarm oluşturabilirsiniz</Text>

      <TouchableOpacity style={styles.createButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.createButtonText}>ALARM OLUŞTUR</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.testButton} onPress={handleTestNotification}>
        <FontAwesome5 name="bell" size={16} color={palette.headerGradientStart} />
        <Text style={styles.testButtonText}>Test Bildirimi Gönder</Text>
      </TouchableOpacity>
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

          <TouchableOpacity style={styles.iconButton} onPress={() => setModalVisible(true)}>
            <AntDesign name="plus" size={24} color={palette.headerText} />
          </TouchableOpacity>
        </View>

      </LinearGradient>

      {alarms.length === 0 ? (
        <View style={styles.emptyWrapper}>
          {renderEmpty()}
        </View>
      ) : (
        <FlatList
          data={alarms}
          renderItem={({ item }) => {
            const priceInfo = allPrices.find(p => p.code === item.code);
            const currentPrice = priceInfo
              ? (item.priceType === 'Alış' ? priceInfo.buying : priceInfo.selling)
              : '-';
            const isAbove = item.condition === '>';
            const isTriggered = item.triggered === true;

            return (
              <View style={styles.alarmCard}>
                <View style={styles.alarmCardContent}>
                  {/* Sol - Ürün İsmi ve Koşul */}
                  <View style={styles.alarmInfo}>
                    <Text style={styles.alarmName}>{item.name}</Text>
                    <View style={styles.alarmCondition}>
                      <Text style={styles.alarmPriceType}>{item.priceType}</Text>
                      <FontAwesome5
                        name={isAbove ? 'arrow-up' : 'arrow-down'}
                        size={10}
                        color={isAbove ? '#16a34a' : '#dc2626'}
                      />
                      <Text style={[
                        styles.alarmConditionText,
                        { color: isAbove ? '#16a34a' : '#dc2626' }
                      ]}>
                        {isAbove ? 'üstüne çıkarsa' : 'altına düşerse'}
                      </Text>
                    </View>
                  </View>

                  {/* Orta - Fiyatlar */}
                  <View style={styles.alarmPrices}>
                    <View style={styles.alarmPriceItem}>
                      <Text style={styles.alarmPriceLabel}>GÜNCEL</Text>
                      <Text style={styles.alarmPriceValue}>{currentPrice}</Text>
                    </View>
                    <View style={styles.alarmPriceSeparator} />
                    <View style={styles.alarmPriceItem}>
                      <Text style={styles.alarmPriceLabel}>HEDEF</Text>
                      <Text style={styles.alarmPriceValue}>{item.targetPrice}</Text>
                    </View>
                  </View>

                  {/* Sağ - Sil Butonu */}
                  <TouchableOpacity
                    style={styles.alarmDeleteBtn}
                    onPress={() => deleteAlarm(item.id)}
                  >
                    <FontAwesome5 name="times" size={14} color="#999" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
        />
      )}

      {/* Bottom Tab Bar */}
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

      {/* Sidebar */}
      <Sidebar ref={sidebarRef} navigation={navigation} />

      {/* Create Alarm Modal - Backend fiyatlarıyla */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.createModalContainer}>
          <View style={[styles.createModalContent, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
            <View style={styles.createModalHeader}>
              <Text style={styles.createModalTitle}>Alarm Oluştur</Text>
              <TouchableOpacity onPress={() => {
                setModalVisible(false);
                setSelectedPrice(null);
                setTargetPrice('');
                setCondition('above');
                setPriceType('selling');
              }}>
                <FontAwesome5 name="times" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.createModalBody} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={true}>
              {/* Select Price */}
              <Text style={styles.formLabel}>Fiyat Seçin</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.priceSelector}
              >
                {allPrices.map((price, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.priceChip,
                      selectedPrice?.code === price.code && styles.priceChipSelected
                    ]}
                    onPress={() => setSelectedPrice(price)}
                  >
                    <Text style={[
                      styles.priceChipText,
                      selectedPrice?.code === price.code && styles.priceChipTextSelected
                    ]}>
                      {price.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {allPrices.length === 0 && (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Fiyatlar yükleniyor...</Text>
                </View>
              )}

              {/* Show current prices if a currency is selected */}
              {selectedPrice && (
                <View style={styles.currentPriceContainer}>
                  <View style={styles.currentPriceItem}>
                    <Text style={styles.currentPriceLabel}>Alış</Text>
                    <Text style={styles.currentPriceValue}>{selectedPrice.buying}</Text>
                  </View>
                  <View style={styles.priceDivider} />
                  <View style={styles.currentPriceItem}>
                    <Text style={styles.currentPriceLabel}>Satış</Text>
                    <Text style={styles.currentPriceValue}>{selectedPrice.selling}</Text>
                  </View>
                </View>
              )}

              {/* Price Type */}
              <Text style={styles.formLabel}>Fiyat Tipi</Text>
              <View style={styles.conditionContainer}>
                <TouchableOpacity
                  style={[
                    styles.conditionButton,
                    priceType === 'buying' && styles.conditionButtonSelected
                  ]}
                  onPress={() => setPriceType('buying')}
                >
                  <FontAwesome5
                    name="arrow-down"
                    size={16}
                    color={priceType === 'buying' ? '#FFFFFF' : palette.headerGradientStart}
                  />
                  <Text style={[
                    styles.conditionText,
                    priceType === 'buying' && styles.conditionTextSelected
                  ]}>
                    Alış Fiyatı
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.conditionButton,
                    priceType === 'selling' && styles.conditionButtonSelected
                  ]}
                  onPress={() => setPriceType('selling')}
                >
                  <FontAwesome5
                    name="arrow-up"
                    size={16}
                    color={priceType === 'selling' ? '#FFFFFF' : palette.headerGradientStart}
                  />
                  <Text style={[
                    styles.conditionText,
                    priceType === 'selling' && styles.conditionTextSelected
                  ]}>
                    Satış Fiyatı
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Condition */}
              <Text style={styles.formLabel}>Koşul</Text>
              <View style={styles.conditionContainer}>
                <TouchableOpacity
                  style={[
                    styles.conditionButton,
                    condition === 'above' && styles.conditionButtonSelected
                  ]}
                  onPress={() => setCondition('above')}
                >
                  <FontAwesome5
                    name="arrow-up"
                    size={16}
                    color={condition === 'above' ? '#FFFFFF' : palette.headerGradientStart}
                  />
                  <Text style={[
                    styles.conditionText,
                    condition === 'above' && styles.conditionTextSelected
                  ]}>
                    Üstüne Çıkarsa
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.conditionButton,
                    condition === 'below' && styles.conditionButtonSelected
                  ]}
                  onPress={() => setCondition('below')}
                >
                  <FontAwesome5
                    name="arrow-down"
                    size={16}
                    color={condition === 'below' ? '#FFFFFF' : palette.headerGradientStart}
                  />
                  <Text style={[
                    styles.conditionText,
                    condition === 'below' && styles.conditionTextSelected
                  ]}>
                    Altına Düşerse
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Target Price */}
              <Text style={styles.formLabel}>Hedef Fiyat</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Örn: 43,500"
                value={targetPrice}
                onChangeText={setTargetPrice}
                keyboardType="decimal-pad"
                placeholderTextColor="#999"
              />
            </ScrollView>

            {/* Fixed Create Button */}
            <View style={styles.fixedButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.createAlarmButton,
                  (!selectedPrice || !targetPrice) && styles.createAlarmButtonDisabled
                ]}
                onPress={createAlarm}
                disabled={!selectedPrice || !targetPrice}
              >
                <FontAwesome5 name="bell" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.createAlarmButtonText}>ALARM OLUŞTUR</Text>
              </TouchableOpacity>
            </View>
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
  emptyWrapper: {
    flex: 1,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  createButton: {
    backgroundColor: palette.headerGradientStart,
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: palette.headerGradientStart,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 15,
    gap: 8,
  },
  testButtonText: {
    color: palette.headerGradientStart,
    fontSize: 14,
    fontWeight: '600',
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
  alarmCard: {
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
  alarmCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  alarmInfo: {
    flex: 1,
    marginRight: 12,
  },
  alarmName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.3,
  },
  alarmCondition: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  alarmPriceType: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888',
  },
  alarmConditionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  alarmPrices: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alarmPriceItem: {
    alignItems: 'center',
    minWidth: 50,
  },
  alarmPriceLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#888',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  alarmPriceValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  alarmPriceSeparator: {
    width: 1,
    height: 24,
    backgroundColor: '#E8E8E8',
    marginHorizontal: 10,
  },
  alarmDeleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  createModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  createModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
  },
  createModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  createModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  createModalBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    marginTop: 10,
  },
  priceSelector: {
    marginBottom: 10,
  },
  priceChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  priceChipSelected: {
    backgroundColor: palette.headerGradientStart,
    borderColor: palette.headerGradientStart,
  },
  priceChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  priceChipTextSelected: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#888',
  },
  conditionContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  conditionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 8,
  },
  conditionButtonSelected: {
    backgroundColor: palette.headerGradientStart,
    borderColor: palette.headerGradientStart,
  },
  conditionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  conditionTextSelected: {
    color: '#FFFFFF',
  },
  priceInput: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  fixedButtonContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  createAlarmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.headerGradientStart,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: palette.headerGradientStart,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createAlarmButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  createAlarmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  currentPriceContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'space-around',
  },
  currentPriceItem: {
    alignItems: 'center',
    flex: 1,
  },
  currentPriceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  currentPriceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.headerGradientStart,
  },
  priceDivider: {
    width: 1,
    backgroundColor: '#d0d0d0',
    marginHorizontal: 10,
  },
});

export default AlarmsScreen;
