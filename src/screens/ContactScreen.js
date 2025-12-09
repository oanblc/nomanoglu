import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Modal, Animated, Dimensions, StatusBar, Image, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, gradient } from '../../theme/colors';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

const BRANCHES = [
  { city: 'Adana', count: 5, phone: '+905322904601' },
  { city: 'Mersin', count: 4, phone: '+905322904601' },
  { city: 'Osmaniye', count: 3, phone: '+905322904601' },
  { city: 'Kahramanmaraş', count: 4, phone: '+905322904601' },
  { city: 'İstanbul', count: 3, phone: '+905322904601' },
];

const ContactScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-DRAWER_WIDTH));
  const [overlayOpacity] = useState(new Animated.Value(0));

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

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
        navigation.navigate('MainTabs', { screen: 'Piyasa' });
      } else if (action === 'favorites' && navigation) {
        navigation.navigate('MainTabs', { screen: 'Favorilerim' });
      } else if (action === 'alarms' && navigation) {
        navigation.navigate('MainTabs', { screen: 'Alarmlar' });
      } else if (action === 'home' && navigation) {
        navigation.navigate('MainTabs', { screen: 'AnaSayfa' });
      } else if (action === 'about' && navigation) {
        navigation.navigate('Hakkimizda');
      } else if (action === 'contact' && navigation) {
        navigation.navigate('Iletisim');
      }
    }, 300);
  };

  const handleCall = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/905322904601');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:info@nomanoglu.com');
  };

  const handleFormSubmit = () => {
    if (!name.trim() || !phone.trim() || !message.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen ad, telefon ve mesaj alanlarını doldurun.');
      return;
    }

    const body = `Ad Soyad: ${name}\nTelefon: ${phone}\nE-posta: ${email || '-'}\n\nMesaj:\n${message}`;

    const mailtoUrl = `mailto:info@nomanoglu.com?subject=${encodeURIComponent(
      'Mobil Uygulama İletişim Formu'
    )}&body=${encodeURIComponent(body)}`;

    Linking.openURL(mailtoUrl);
    Alert.alert('Teşekkürler', 'Mesajınız e-posta uygulamanız üzerinden gönderilecektir.');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={palette.headerGradientStart} />
      
      {/* Fixed Header */}
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.header, { paddingTop: insets.top > 0 ? insets.top : 40 }]}
      >
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconButton} onPress={openDrawer}>
            <FontAwesome5 name="bars" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={styles.headerLogoImage}
              resizeMode="contain"
            />
          </View>
          
          <View style={{ width: 32 }} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 60 + insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Contact Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <View style={styles.titleLine} />
            <Text style={styles.sectionTitle}>Hızlı İletişim</Text>
            <View style={styles.titleLine} />
          </View>
          
          <TouchableOpacity style={styles.contactCard} onPress={handleWhatsApp}>
            <View style={[styles.contactIcon, { backgroundColor: '#e8f5e9' }]}>
              <FontAwesome5 name="whatsapp" size={24} color="#25D366" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>WhatsApp Destek</Text>
              <Text style={styles.contactSubtitle}>Hızlı yanıt alın</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={18} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={() => handleCall('+905322904601')}>
            <View style={[styles.contactIcon, { backgroundColor: '#fff3e0' }]}>
              <FontAwesome5 name="phone" size={24} color={palette.headerGradientStart} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Telefon</Text>
              <Text style={styles.contactSubtitle}>+90 532 290 46 01</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={18} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={handleEmail}>
            <View style={[styles.contactIcon, { backgroundColor: '#e3f2fd' }]}>
              <FontAwesome5 name="envelope" size={24} color="#1976d2" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>E-posta</Text>
              <Text style={styles.contactSubtitle}>info@nomanoglu.com</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={18} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Branches Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWithBadge}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.titleLine} />
              <Text style={styles.sectionTitle}>Şubelerimiz</Text>
              <View style={styles.titleLine} />
            </View>
            <View style={styles.totalBadge}>
              <FontAwesome5 name="store" size={12} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.totalBadgeText}>19 Şube</Text>
            </View>
          </View>

          {BRANCHES.map((branch, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.branchCard}
              onPress={() => handleCall(branch.phone)}
            >
              <View style={styles.branchLeft}>
                <View style={styles.branchIcon}>
                  <FontAwesome5 name="store" size={20} color={palette.headerGradientStart} />
                </View>
                <View style={styles.branchInfo}>
                  <Text style={styles.branchCity}>{branch.city}</Text>
                  <Text style={styles.branchCount}>{branch.count} Şube</Text>
                </View>
              </View>
              <FontAwesome5 name="phone" size={18} color={palette.headerGradientStart} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact Form Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <View style={styles.titleLine} />
            <Text style={styles.sectionTitle}>İletişim Formu</Text>
            <View style={styles.titleLine} />
          </View>
          <View style={styles.formCard}>
            <TextInput
              style={styles.input}
              placeholder="Ad Soyad"
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Telefon"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            <TextInput
              style={styles.input}
              placeholder="E-posta (opsiyonel)"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Mesajınız"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={message}
              onChangeText={setMessage}
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleFormSubmit}>
              <Text style={styles.submitButtonText}>Gönder</Text>
            </TouchableOpacity>

            <Text style={styles.formHint}>
              Bu formu gönderdiğinizde mesajınız varsayılan e-posta uygulamanız üzerinden
              `info@nomanoglu.com` adresine iletilir.
            </Text>
          </View>
        </View>

        {/* Social Media Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <View style={styles.titleLine} />
            <Text style={styles.sectionTitle}>Sosyal Medya</Text>
            <View style={styles.titleLine} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => Linking.openURL('https://facebook.com/nomanoglu')}
            >
              <FontAwesome5 name="facebook-f" size={24} color={palette.headerGradientStart} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => Linking.openURL('https://instagram.com/nomanoglu')}
            >
              <FontAwesome5 name="instagram" size={24} color={palette.headerGradientStart} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => Linking.openURL('https://twitter.com/nomanoglu')}
            >
              <FontAwesome5 name="twitter" size={24} color={palette.headerGradientStart} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => Linking.openURL('https://linkedin.com/company/nomanoglu')}
            >
              <FontAwesome5 name="linkedin-in" size={24} color={palette.headerGradientStart} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => Linking.openURL('https://youtube.com/@nomanoglu')}
            >
              <FontAwesome5 name="youtube" size={24} color={palette.headerGradientStart} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

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
                    <FontAwesome5 name="times" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                {/* 2. Menü Listesi */}
                <View style={styles.menuList}>
                  
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleLine: {
    flex: 1,
    height: 2,
    backgroundColor: palette.headerGradientStart,
    opacity: 0.3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.headerGradientStart,
    marginHorizontal: 12,
    letterSpacing: 0.5,
  },
  sectionHeaderWithBadge: {
    marginBottom: 12,
  },
  totalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.headerGradientStart,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
    alignSelf: 'center',
    shadowColor: palette.headerGradientStart,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  totalBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Social Media
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: palette.headerGradientStart,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: palette.headerGradientStart,
  },
  // Quick Contact Cards
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: palette.headerGradientStart,
  },
  contactIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  // Contact Form
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: palette.headerGradientStart,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    marginBottom: 10,
    backgroundColor: '#f9fafb',
  },
  textArea: {
    height: 100,
  },
  submitButton: {
    marginTop: 6,
    backgroundColor: palette.headerGradientEnd,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: palette.headerGradientEnd,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  formHint: {
    marginTop: 8,
    fontSize: 11,
    color: '#6b7280',
  },
  // Branch Cards
  branchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: palette.headerGradientStart,
  },
  branchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  branchIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff3e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  branchInfo: {
    flex: 1,
  },
  branchCity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  branchCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  // About Card
  aboutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    borderWidth: 2,
    borderColor: palette.headerGradientStart,
    shadowColor: palette.headerGradientStart,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.headerGradientStart,
    marginBottom: 10,
  },
  aboutText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: palette.headerGradientStart,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
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
    backgroundColor: 'rgba(0,0,0,0.15)',
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
});

export default ContactScreen;

