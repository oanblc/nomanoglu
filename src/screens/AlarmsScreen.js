import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, StatusBar, TextInput, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { palette, gradient } from '../../theme/colors';
import { sendTestNotification } from '../services/NotificationService';
import Sidebar from '../components/Sidebar';

const ALARMS_KEY = '@alarms';

const AlarmsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const sidebarRef = useRef(null);
  const [alarms, setAlarms] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadAlarms();
  }, []);

  const [selectedPrice, setSelectedPrice] = useState(null);
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState('above'); // 'above' or 'below'
  const [priceType, setPriceType] = useState('selling'); // 'buying' or 'selling'

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

  const ALL_PRICES = [
    { code: 'USDTRY', name: 'Amerikan Doları', buying: '42,300', selling: '42,430' },
    { code: 'EURTRY', name: 'Euro', buying: '48,934', selling: '49,200' },
    { code: 'GBPTRY', name: 'İngiliz Sterlini', buying: '55,650', selling: '56,110' },
    { code: 'CHFTRY', name: 'İsviçre Frangı', buying: '52,004', selling: '52,866' },
    { code: 'JPYTRY', name: 'Japon Yeni', buying: '0,2690', selling: '0,2712' },
    { code: 'ALTIN', name: 'Gram Altın', buying: '3,240', selling: '3,245' },
    { code: 'GUMUSTRY', name: 'Gümüş', buying: '42,10', selling: '42,15' },
  ];

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
      
      // Reset form
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

          <TouchableOpacity style={styles.iconButton} onPress={() => setModalVisible(true)}>
            <FontAwesome5 name="plus" size={24} color={palette.headerText} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {alarms.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={alarms}
          renderItem={({ item }) => {
            const priceInfo = ALL_PRICES.find(p => p.code === item.code);
            const currentPrice = priceInfo
              ? (item.priceType === 'Alış' ? priceInfo.buying : priceInfo.selling)
              : '-';
            const isAbove = item.condition === '>';

            return (
              <View style={styles.alarmCard}>
                {/* Üst Kısım - Kod ve İkon */}
                <View style={styles.alarmCardHeader}>
                  <View style={styles.alarmIconContainer}>
                    <LinearGradient
                      colors={[palette.headerGradientStart, palette.headerGradientEnd]}
                      style={styles.alarmIconGradient}
                    >
                      <FontAwesome5
                        name={item.code.includes('ALTIN') || item.code.includes('GUMUS') ? 'coins' : 'dollar-sign'}
                        size={16}
                        color={palette.headerText}
                      />
                    </LinearGradient>
                  </View>
                  <View style={styles.alarmHeaderText}>
                    <Text style={styles.alarmCode}>{item.code}</Text>
                    <Text style={styles.alarmName}>{item.name}</Text>
                  </View>
                  <View style={styles.alarmBadge}>
                    <FontAwesome5
                      name={isAbove ? 'arrow-up' : 'arrow-down'}
                      size={10}
                      color={isAbove ? '#22C55E' : '#EF4444'}
                    />
                    <Text style={[styles.alarmBadgeText, { color: isAbove ? '#22C55E' : '#EF4444' }]}>
                      {isAbove ? 'Üstüne Çıkarsa' : 'Altına Düşerse'}
                    </Text>
                  </View>
                </View>

                {/* Fiyat Bilgileri */}
                <View style={styles.alarmPriceContainer}>
                  <View style={styles.alarmPriceBox}>
                    <Text style={styles.alarmPriceBoxLabel}>GÜNCEL FİYAT</Text>
                    <Text style={styles.alarmPriceBoxValue}>{currentPrice}</Text>
                    <Text style={styles.alarmPriceBoxSub}>{item.priceType}</Text>
                  </View>
                  <View style={styles.alarmPriceDivider}>
                    <FontAwesome5 name="exchange-alt" size={14} color="#F7DE00" />
                  </View>
                  <View style={styles.alarmPriceBox}>
                    <Text style={styles.alarmPriceBoxLabel}>HEDEF FİYAT</Text>
                    <Text style={[styles.alarmPriceBoxValue, styles.alarmTargetValue]}>{item.targetPrice}</Text>
                    <Text style={styles.alarmPriceBoxSub}>{item.priceType}</Text>
                  </View>
                </View>

                {/* Alt Kısım - Aksiyon */}
                <View style={styles.alarmCardFooter}>
                  <View style={styles.alarmStatusContainer}>
                    <View style={styles.alarmStatusDot} />
                    <Text style={styles.alarmStatusText}>Aktif</Text>
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
          contentContainerStyle={{ padding: 16, paddingBottom: 60 + insets.bottom + 10 }}
        />
      )}

      {/* Sidebar */}
      <Sidebar ref={sidebarRef} navigation={navigation} />

      {/* Create Alarm Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.createModalContainer}>
          <View style={styles.createModalContent}>
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
            
            <ScrollView style={styles.createModalBody}>
              {/* Select Price */}
              <Text style={styles.formLabel}>Fiyat Seçin</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.priceSelector}
              >
                {ALL_PRICES.map((price, index) => (
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
                      {price.code}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

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
    backgroundColor: '#FFFFFF',
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
  // Premium Alarm Card Styles
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
  alarmIconContainer: {
    marginRight: 12,
  },
  alarmIconGradient: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
  // Legacy styles (keeping for compatibility)
  alarmItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'transparent',
  },
  alarmLeft: {
    flex: 1,
  },
  alarmCenter: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  alarmPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  alarmPriceLabel: {
    fontSize: 10,
    color: '#888',
    fontWeight: '700',
    marginRight: 6,
  },
  alarmPriceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.headerGradientStart,
  },
  alarmActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alarmCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  alarmCondition: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  alarmTarget: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.headerGradientStart,
  },
  deleteButton: {
    padding: 8,
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
    height: '85%',
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
    padding: 20,
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
    paddingBottom: 30,
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
