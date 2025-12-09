import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';

const OtherScreen = () => {
  const openWhatsApp = () => {
    Linking.openURL('https://wa.me/905322904601');
  };

  const openPhone = () => {
    Linking.openURL('tel:+905322904601');
  };

  const openEmail = () => {
    Linking.openURL('mailto:info@nomanoglu.com');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📞 İletişim</Text>
        
        <TouchableOpacity style={styles.card} onPress={openPhone}>
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>📱</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Telefon</Text>
              <Text style={styles.cardSubtitle}>+90 532 290 46 01</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={openWhatsApp}>
          <View style={styles.cardContent}>
            <View style={[styles.iconContainer, { backgroundColor: '#DCF8C6' }]}>
              <Text style={styles.icon}>💬</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>WhatsApp</Text>
              <Text style={styles.cardSubtitle}>Hızlı destek alın</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={openEmail}>
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>📧</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>E-posta</Text>
              <Text style={styles.cardSubtitle}>info@nomanoglu.com</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Adres</Text>
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🏢</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Kadirli Şubesi</Text>
              <Text style={styles.cardSubtitle}>Osmaniye, Türkiye</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ Hakkımızda</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>NOMANOĞLU Kuyumculuk</Text>
          <Text style={styles.infoText}>
            1967'den bu yana altın ve kuyumculuk sektöründe güvenilir hizmet anlayışı ile hizmetinizdeyiz.
          </Text>
          <Text style={styles.infoText}>
            • 19 mağaza, 6 üretim atölyesi{'\n'}
            • Adana, Mersin, Osmaniye, Kahramanmaraş ve İstanbul{'\n'}
            • Uluslararası ihracat
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>NOMANOĞLU Mobil v1.0.0</Text>
        <Text style={styles.footerSubtext}>© 2024 Tüm hakları saklıdır</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  arrow: {
    fontSize: 24,
    color: '#D1D5DB',
    fontWeight: '300',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D97706',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 22,
    marginBottom: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default OtherScreen;

