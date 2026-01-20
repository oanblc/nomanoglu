import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, StatusBar, Image, TextInput, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, gradient } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import Sidebar from '../components/Sidebar';
import { API_URL } from '../config';

const ContactScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const sidebarRef = useRef(null);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  // Data state
  const [settings, setSettings] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCity, setExpandedCity] = useState(null);

  // Fetch settings and branches from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Parallel fetch
        const [settingsRes, branchesRes] = await Promise.all([
          fetch(`${API_URL}/api/settings`),
          fetch(`${API_URL}/api/branches`)
        ]);

        const settingsData = await settingsRes.json();
        const branchesData = await branchesRes.json();

        if (settingsData.success) {
          setSettings(settingsData.data);
        }

        if (branchesData.success) {
          setBranches(branchesData.data);
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Group branches by city
  const branchesByCity = branches.reduce((acc, branch) => {
    if (!acc[branch.city]) {
      acc[branch.city] = [];
    }
    acc[branch.city].push(branch);
    return acc;
  }, {});

  const cityList = Object.keys(branchesByCity).sort();

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

  const handleCall = (phoneNumber) => {
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    Linking.openURL(`tel:${cleanPhone}`);
  };

  const handleWhatsApp = () => {
    const whatsappNumber = settings?.socialWhatsapp || '905322904601';
    Linking.openURL(`https://wa.me/${whatsappNumber}`);
  };

  const handleEmail = () => {
    const emailAddress = settings?.contactEmail || 'info@nomanoglu.com';
    Linking.openURL(`mailto:${emailAddress}`);
  };

  const handleMap = (mapLink) => {
    if (mapLink) {
      Linking.openURL(mapLink);
    }
  };

  const handleFormSubmit = () => {
    if (!name.trim() || !phone.trim() || !message.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen ad, telefon ve mesaj alanlarını doldurun.');
      return;
    }

    const body = `Ad Soyad: ${name}\nTelefon: ${phone}\nE-posta: ${email || '-'}\n\nMesaj:\n${message}`;
    const emailAddress = settings?.contactEmail || 'info@nomanoglu.com';

    const mailtoUrl = `mailto:${emailAddress}?subject=${encodeURIComponent(
      'Mobil Uygulama İletişim Formu'
    )}&body=${encodeURIComponent(body)}`;

    Linking.openURL(mailtoUrl);
    Alert.alert('Teşekkürler', 'Mesajınız e-posta uygulamanız üzerinden gönderilecektir.');
  };

  const toggleCity = (city) => {
    setExpandedCity(expandedCity === city ? null : city);
  };

  // Social media buttons based on settings
  const socialButtons = [];
  if (settings?.socialInstagram) {
    socialButtons.push({ icon: 'instagram', url: settings.socialInstagram, color: '#E4405F' });
  }
  if (settings?.socialTiktok) {
    socialButtons.push({ icon: 'tiktok', url: settings.socialTiktok, color: '#000000' });
  }
  if (settings?.socialFacebook) {
    socialButtons.push({ icon: 'facebook-f', url: settings.socialFacebook, color: '#1877F2' });
  }
  if (settings?.socialTwitter) {
    socialButtons.push({ icon: 'x-twitter', url: settings.socialTwitter, color: '#000000' });
  }
  if (settings?.socialYoutube) {
    socialButtons.push({ icon: 'youtube', url: settings.socialYoutube, color: '#FF0000' });
  }

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
            <Ionicons name="menu" size={28} color={palette.headerText} />
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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palette.headerGradientStart} />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 20 }}
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

            <TouchableOpacity style={styles.contactCard} onPress={() => handleCall(settings?.contactPhone || '+905322904601')}>
              <View style={[styles.contactIcon, { backgroundColor: '#fff3e0' }]}>
                <FontAwesome5 name="phone" size={24} color={palette.headerGradientStart} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Telefon</Text>
                <Text style={styles.contactSubtitle}>{settings?.contactPhone || '+90 532 290 46 01'}</Text>
              </View>
              <FontAwesome5 name="chevron-right" size={18} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactCard} onPress={handleEmail}>
              <View style={[styles.contactIcon, { backgroundColor: '#e3f2fd' }]}>
                <FontAwesome5 name="envelope" size={24} color="#1976d2" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>E-posta</Text>
                <Text style={styles.contactSubtitle}>{settings?.contactEmail || 'info@nomanoglu.com'}</Text>
              </View>
              <FontAwesome5 name="chevron-right" size={18} color="#ccc" />
            </TouchableOpacity>

            {/* Working Hours */}
            <View style={styles.workingHoursCard}>
              <FontAwesome5 name="clock" size={18} color={palette.headerGradientStart} />
              <View style={styles.workingHoursInfo}>
                <Text style={styles.workingHoursText}>{settings?.workingHours || 'Pzt - Cmt: 09:00 - 19:00'}</Text>
                {settings?.workingHoursNote && (
                  <Text style={styles.workingHoursNote}>{settings.workingHoursNote}</Text>
                )}
              </View>
            </View>
          </View>

          {/* Branches Section - Accordion Style */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderWithBadge}>
              <View style={styles.sectionTitleContainer}>
                <View style={styles.titleLine} />
                <Text style={styles.sectionTitle}>Şubelerimiz</Text>
                <View style={styles.titleLine} />
              </View>
              <View style={styles.totalBadge}>
                <FontAwesome5 name="store" size={12} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.totalBadgeText}>{branches.length} Şube</Text>
              </View>
            </View>

            {cityList.map((city) => (
              <View key={city} style={styles.cityAccordion}>
                <TouchableOpacity
                  style={styles.cityHeader}
                  onPress={() => toggleCity(city)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cityHeaderLeft}>
                    <View style={styles.cityIcon}>
                      <FontAwesome5 name="map-marker-alt" size={16} color={palette.headerGradientStart} />
                    </View>
                    <View>
                      <Text style={styles.cityName}>{city}</Text>
                      <Text style={styles.cityCount}>{branchesByCity[city].length} Şube</Text>
                    </View>
                  </View>
                  <FontAwesome5
                    name={expandedCity === city ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={palette.headerGradientStart}
                  />
                </TouchableOpacity>

                {expandedCity === city && (
                  <View style={styles.branchList}>
                    {branchesByCity[city].map((branch, index) => (
                      <View key={branch.id || index} style={styles.branchItem}>
                        <View style={styles.branchHeader}>
                          <Text style={styles.branchName}>{branch.name}</Text>
                        </View>

                        <View style={styles.branchDetails}>
                          <View style={styles.branchDetailRow}>
                            <FontAwesome5 name="map-marker-alt" size={12} color="#888" />
                            <Text style={styles.branchAddress}>{branch.address}</Text>
                          </View>

                          {branch.workingHours && (
                            <View style={styles.branchDetailRow}>
                              <FontAwesome5 name="clock" size={12} color="#888" />
                              <Text style={styles.branchHours}>{branch.workingHours}</Text>
                            </View>
                          )}
                        </View>

                        <View style={styles.branchActions}>
                          {branch.phone && (
                            <TouchableOpacity
                              style={styles.branchActionBtn}
                              onPress={() => handleCall(branch.phone)}
                            >
                              <FontAwesome5 name="phone" size={14} color="#FFFFFF" />
                              <Text style={styles.branchActionText}>Ara</Text>
                            </TouchableOpacity>
                          )}
                          {branch.mapLink && (
                            <TouchableOpacity
                              style={[styles.branchActionBtn, styles.branchMapBtn]}
                              onPress={() => handleMap(branch.mapLink)}
                            >
                              <FontAwesome5 name="directions" size={14} color={palette.headerGradientStart} />
                              <Text style={[styles.branchActionText, styles.branchMapText]}>Yol Tarifi</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}

            {branches.length === 0 && (
              <View style={styles.emptyBranches}>
                <FontAwesome5 name="store-slash" size={40} color="#ccc" />
                <Text style={styles.emptyText}>Şube bilgisi bulunamadı</Text>
              </View>
            )}
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
                placeholder="Ad Soyad *"
                placeholderTextColor="#9ca3af"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="Telefon *"
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
                placeholder="Mesajınız *"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={message}
                onChangeText={setMessage}
              />

              <TouchableOpacity style={styles.submitButton} onPress={handleFormSubmit}>
                <FontAwesome5 name="paper-plane" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.submitButtonText}>Gönder</Text>
              </TouchableOpacity>

              <Text style={styles.formHint}>
                * ile işaretli alanlar zorunludur. Mesajınız e-posta uygulamanız üzerinden iletilir.
              </Text>
            </View>
          </View>

          {/* Social Media Section */}
          {socialButtons.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <View style={styles.titleLine} />
                <Text style={styles.sectionTitle}>Sosyal Medya</Text>
                <View style={styles.titleLine} />
              </View>

              <View style={styles.socialContainer}>
                {socialButtons.map((social, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.socialButton}
                    onPress={() => Linking.openURL(social.url)}
                  >
                    <FontAwesome6 name={social.icon} size={24} color={social.color} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* Bottom Tab Bar */}
      <View style={[styles.bottomTabBar, { paddingBottom: insets.bottom > 0 ? insets.bottom + 4 : 8 }]}>
        <TouchableOpacity style={styles.tabItem} onPress={goToHome}>
          <FontAwesome5 name="home" size={20} color={palette.navInactive} />
          <Text style={styles.tabLabel}>Ana Sayfa</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={openInstagram}>
          <FontAwesome5 name="instagram" size={20} color="#E4405F" />
          <Text style={styles.tabLabel}>Instagram</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={openTikTok}>
          <FontAwesome5 name="tiktok" size={20} color="#000000" />
          <Text style={styles.tabLabel}>TikTok</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={openWebsite}>
          <FontAwesome5 name="globe" size={20} color="#1E90FF" />
          <Text style={styles.tabLabel}>Web Sitesi</Text>
        </TouchableOpacity>
      </View>

      {/* Sidebar Component */}
      <Sidebar ref={sidebarRef} navigation={navigation} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
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
    backgroundColor: '#333333',
    opacity: 0.2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
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
  workingHoursCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(247, 222, 0, 0.3)',
  },
  workingHoursInfo: {
    marginLeft: 12,
    flex: 1,
  },
  workingHoursText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  workingHoursNote: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  // City Accordion Styles
  cityAccordion: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  cityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  cityHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cityName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  cityCount: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  branchList: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  branchItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    backgroundColor: '#FAFAFA',
  },
  branchHeader: {
    marginBottom: 8,
  },
  branchName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  branchDetails: {
    marginBottom: 10,
  },
  branchDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  branchAddress: {
    fontSize: 13,
    color: '#4b5563',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  branchHours: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
  },
  branchActions: {
    flexDirection: 'row',
    gap: 10,
  },
  branchActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.headerGradientStart,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  branchMapBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: palette.headerGradientStart,
  },
  branchActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  branchMapText: {
    color: palette.headerGradientStart,
  },
  emptyBranches: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#888',
  },
  // Form Styles
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
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    marginBottom: 12,
    backgroundColor: '#f9fafb',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    backgroundColor: palette.headerGradientStart,
    borderRadius: 25,
    paddingVertical: 14,
    shadowColor: palette.headerGradientStart,
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
    marginTop: 10,
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
  },
  // Social Media Styles
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // Bottom Tab Bar
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
});

export default ContactScreen;
