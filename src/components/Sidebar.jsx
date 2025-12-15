import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Dimensions, Linking, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

const Sidebar = forwardRef(({ navigation }, ref) => {
  const insets = useSafeAreaInsets();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

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

  // Expose open/close methods to parent
  useImperativeHandle(ref, () => ({
    open: openDrawer,
    close: closeDrawer,
  }));

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
        navigation.navigate('MainTabs', { screen: 'AnaSayfa' });
      }
    }, 300);
  };

  return (
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
  );
});

const styles = StyleSheet.create({
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
  drawerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
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

export default Sidebar;
