import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Modal, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.28;
const CARD_MARGIN = 8;

const FeaturedSlider = ({ prices }) => {
  const scrollViewRef = useRef(null);
  const currentIndex = useRef(0);
  const [featuredCodes, setFeaturedCodes] = useState(['USDTRY', 'EURTRY', 'JPYTRY']);
  const [modalVisible, setModalVisible] = useState(false);
  const [longPressCode, setLongPressCode] = useState(null);

  useEffect(() => {
    loadFeatured();
  }, []);

  const loadFeatured = async () => {
    try {
      const saved = await AsyncStorage.getItem('featuredPrices');
      if (saved) {
        setFeaturedCodes(JSON.parse(saved));
      }
    } catch (error) {
      console.log('Featured yükleme hatası:', error);
    }
  };

  const saveFeatured = async (codes) => {
    try {
      await AsyncStorage.setItem('featuredPrices', JSON.stringify(codes));
      setFeaturedCodes(codes);
    } catch (error) {
      console.log('Featured kaydetme hatası:', error);
    }
  };

  const addFeatured = (code) => {
    if (featuredCodes.length >= 5) {
      alert('En fazla 5 fiyat ekleyebilirsiniz!');
      return;
    }
    if (!featuredCodes.includes(code)) {
      const newCodes = [...featuredCodes, code];
      saveFeatured(newCodes);
    }
    setModalVisible(false);
  };

  const removeFeatured = (code) => {
    const newCodes = featuredCodes.filter(c => c !== code);
    saveFeatured(newCodes);
  };

  const featured = featuredCodes.map(code => 
    prices.find(p => p.code === code) || { code, name: code, calculatedSatis: 0, direction: {} }
  );

  useEffect(() => {
    if (featured.length === 0) return;
    const interval = setInterval(() => {
      currentIndex.current = (currentIndex.current + 1) % featured.length;
      scrollViewRef.current?.scrollTo({
        x: currentIndex.current * (CARD_WIDTH + CARD_MARGIN * 2),
        animated: true,
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [featured.length]);

  const formatPrice = (price) => {
    if (!price) return '0';
    const formatted = new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
    return formatted.replace(/\./g, ',');
  };

  return (
    <>
      <LinearGradient
        colors={['#4c1d95', '#5b21b6', '#6d28d9', '#7c3aed']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
      >
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled={false}
          decelerationRate="fast"
          snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
          snapToAlignment="center"
          contentContainerStyle={styles.scrollContent}
        >
          {featured.map((item) => (
            <TouchableOpacity
              key={item.code}
              onLongPress={() => setLongPressCode(item.code)}
              onPressOut={() => {
                setTimeout(() => setLongPressCode(null), 2000);
              }}
              activeOpacity={0.9}
            >
              <View style={[styles.card, { width: CARD_WIDTH }]}>
                {/* HAREM Glassmorphism Effect */}
                <View style={styles.glassCard}>
                  {longPressCode === item.code && (
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => {
                        removeFeatured(item.code);
                        setLongPressCode(null);
                      }}
                    >
                      <Ionicons name="close-circle" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                  <Text style={styles.cardCode}>{item.code}</Text>
                  <Text style={styles.cardPrice}>{formatPrice(item.calculatedSatis)}</Text>
                  <Text style={styles.cardChange}>%0.00</Text>
                  <View style={styles.cardBar} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
          
          {featuredCodes.length < 5 && (
            <TouchableOpacity 
              style={[styles.card, styles.addCard, { width: CARD_WIDTH }]}
              onPress={() => setModalVisible(true)}
            >
              <View style={styles.glassCard}>
                <Ionicons name="add-circle-outline" size={36} color="rgba(255,255,255,0.9)" />
                <Text style={styles.addText}>Ekle</Text>
              </View>
            </TouchableOpacity>
          )}
        </ScrollView>
      </LinearGradient>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Fiyat Ekle</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#1e293b" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={prices}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.priceItem,
                    featuredCodes.includes(item.code) && styles.priceItemDisabled
                  ]}
                  onPress={() => addFeatured(item.code)}
                  disabled={featuredCodes.includes(item.code)}
                >
                  <View style={styles.priceItemLeft}>
                    <Text style={styles.priceItemCode}>{item.code}</Text>
                    <Text style={styles.priceItemName}>{item.name}</Text>
                  </View>
                  <Text style={styles.priceItemPrice}>₺{formatPrice(item.calculatedSatis)}</Text>
                  {featuredCodes.includes(item.code) && (
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  scrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    marginHorizontal: CARD_MARGIN,
    position: 'relative',
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 2,
  },
  cardCode: {
    fontSize: 12,
    fontWeight: '500',
    color: '#c7d2fe',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  cardPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardChange: {
    fontSize: 11,
    color: '#6ee7b7',
    fontWeight: '400',
    marginBottom: 8,
  },
  cardBar: {
    width: 50,
    height: 2,
    backgroundColor: '#34d399',
    borderRadius: 1,
  },
  addCard: {
    justifyContent: 'center',
  },
  addText: {
    fontSize: 13,
    color: '#FFFFFF',
    marginTop: 8,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  priceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  priceItemDisabled: {
    opacity: 0.5,
  },
  priceItemLeft: {
    flex: 1,
  },
  priceItemCode: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  priceItemName: {
    fontSize: 12,
    color: '#64748b',
  },
  priceItemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7c3aed',
    marginRight: 12,
  },
});

export default FeaturedSlider;
