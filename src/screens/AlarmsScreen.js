import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, StatusBar, TextInput, Alert, Image, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
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
            <FontAwesome5 name="bars" size={24} color={palette.headerText} />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.headerLogoImage}
              resizeMode="contain"
            />
          </View>

          <TouchableOpacity style={styles.iconButton} onPress={() => setModalVisible(true)}>
            <FontAwesome5 name="plus" size={24} color={palette.headerText} />
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

            // Tetiklenme tarihini formatla
            const formatTriggeredDate = (dateStr) => {
              if (!dateStr) return '';
              const date = new Date(dateStr);
              return date.toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
            };

            return (
              <View style={[
                styles.alarmCard,
                isTriggered && styles.alarmCardTriggered
              ]}>
                {/* Tetiklendi banner */}
                {isTriggered && (
                  <View style={styles.triggeredBanner}>
                    <FontAwesome5 name="check-circle" size={14} color="#FFFFFF" />
                    <Text style={styles.triggeredBannerText}>Tetiklendi</Text>
                    <Text style={styles.triggeredBannerDate}>
                      {formatTriggeredDate(item.triggeredAt)}
                    </Text>
                  </View>
                )}

                <View style={styles.alarmCardHeader}>
                  <View style={styles.alarmHeaderText}>
                    <Text style={[
                      styles.alarmCode,
                      isTriggered && styles.alarmCodeTriggered
                    ]}>{item.code}</Text>
                    <Text style={[
                      styles.alarmName,
                      isTriggered && styles.alarmNameTriggered
                    ]}>{item.name}</Text>
                  </View>
                  <View style={[
                    styles.alarmBadge,
                    isTriggered && styles.alarmBadgeTriggered
                  ]}>
                    <FontAwesome5
                      name={isAbove ? 'arrow-up' : 'arrow-down'}
                      size={10}
                      color={isTriggered ? '#9CA3AF' : (isAbove ? '#22C55E' : '#EF4444')}
                    />
                    <Text style={[
                      styles.alarmBadgeText,
                      { color: isTriggered ? '#9CA3AF' : (isAbove ? '#22C55E' : '#EF4444') }
                    ]}>
                      {isAbove ? 'Üstüne Çıktı' : 'Altına Düştü'}
                    </Text>
                  </View>
                </View>

                <View style={[
                  styles.alarmPriceContainer,
                  isTriggered && styles.alarmPriceContainerTriggered
                ]}>
                  <View style={styles.alarmPriceBox}>
                    <Text style={styles.alarmPriceBoxLabel}>
                      {isTriggered ? 'TETİKLENDİĞİ FİYAT' : 'GÜNCEL FİYAT'}
                    </Text>
                    <Text style={[
                      styles.alarmPriceBoxValue,
                      isTriggered && styles.alarmPriceBoxValueTriggered
                    ]}>{currentPrice}</Text>
                    <Text style={styles.alarmPriceBoxSub}>{item.priceType}</Text>
                  </View>
                  <View style={[
                    styles.alarmPriceDivider,
                    isTriggered && styles.alarmPriceDividerTriggered
                  ]}>
                    <FontAwesome5
                      name={isTriggered ? "check" : "exchange-alt"}
                      size={14}
                      color={isTriggered ? "#22C55E" : "#F7DE00"}
                    />
                  </View>
                  <View style={styles.alarmPriceBox}>
                    <Text style={styles.alarmPriceBoxLabel}>HEDEF FİYAT</Text>
                    <Text style={[
                      styles.alarmPriceBoxValue,
                      isTriggered ? styles.alarmPriceBoxValueTriggered : styles.alarmTargetValue
                    ]}>{item.targetPrice}</Text>
                    <Text style={styles.alarmPriceBoxSub}>{item.priceType}</Text>
                  </View>
                </View>

                <View style={styles.alarmCardFooter}>
                  <View style={styles.alarmStatusContainer}>
                    {isTriggered ? (
                      <>
                        <View style={styles.alarmStatusDotTriggered} />
                        <Text style={styles.alarmStatusTextTriggered}>Tamamlandı</Text>
                      </>
                    ) : (
                      <>
                        <View style={styles.alarmStatusDot} />
                        <Text style={styles.alarmStatusText}>Aktif</Text>
                      </>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.alarmDeleteButton}
                    onPress={() => deleteAlarm(item.id)}
                  >
                    <FontAwesome5 name="trash-alt" size={14} color="#EF4444" />
                    <Text style={styles.alarmDeleteText}>Sil</Text>
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
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(247, 222, 0, 0.15)',
  },
  alarmCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  alarmHeaderText: {
    flex: 1,
  },
  alarmCode: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },
  alarmName: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  alarmBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  alarmBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  alarmPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FAFAFA',
  },
  alarmPriceBox: {
    flex: 1,
    alignItems: 'center',
  },
  alarmPriceBoxLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 1,
    marginBottom: 6,
  },
  alarmPriceBoxValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  alarmTargetValue: {
    color: '#F7DE00',
  },
  alarmPriceBoxSub: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
  },
  alarmPriceDivider: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alarmCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  alarmStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alarmStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  alarmStatusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#22C55E',
  },
  alarmDeleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  alarmDeleteText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
  // Tetiklenen alarm stilleri
  alarmCardTriggered: {
    backgroundColor: '#F8FAF8',
    borderColor: 'rgba(34, 197, 94, 0.2)',
    opacity: 0.9,
  },
  triggeredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22C55E',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    gap: 8,
  },
  triggeredBannerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  triggeredBannerDate: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  alarmCodeTriggered: {
    color: '#6B7280',
  },
  alarmNameTriggered: {
    color: '#9CA3AF',
  },
  alarmBadgeTriggered: {
    backgroundColor: '#F3F4F6',
  },
  alarmPriceContainerTriggered: {
    backgroundColor: '#F3F4F6',
  },
  alarmPriceBoxValueTriggered: {
    color: '#6B7280',
  },
  alarmPriceDividerTriggered: {
    backgroundColor: '#E8F5E9',
  },
  alarmStatusDotTriggered: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
  },
  alarmStatusTextTriggered: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
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
