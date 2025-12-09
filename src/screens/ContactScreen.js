import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, StatusBar, Image, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, gradient } from '../../theme/colors';
import Sidebar from '../components/Sidebar';

const BRANCHES = [
  { city: 'Adana', count: 5, phone: '+905322904601' },
  { city: 'Mersin', count: 4, phone: '+905322904601' },
  { city: 'Osmaniye', count: 3, phone: '+905322904601' },
  { city: 'Kahramanmaraş', count: 4, phone: '+905322904601' },
  { city: 'İstanbul', count: 3, phone: '+905322904601' },
];

const ContactScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const sidebarRef = useRef(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const openDrawer = () => {
    sidebarRef.current?.open();
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
});

export default ContactScreen;
