import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  StatusBar, Alert, ActivityIndicator, Image, Platform, KeyboardAvoidingView,
  Modal, FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import SignatureScreen from 'react-native-signature-canvas';
import { palette, gradient } from '../../theme/colors';
import { API_URL } from '../config';

const EMPLOYEE_TOKEN_KEY = '@employee_token';

const KYCFormScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const signatureRef = useRef(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [occupation, setOccupation] = useState('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [branchId, setBranchId] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [details, setDetails] = useState('');
  const [additionalInfo] = useState('');
  const [kvkkConsent, setKvkkConsent] = useState(false);
  const [signature, setSignature] = useState('');
  const [idCardFront, setIdCardFront] = useState(null);
  const [idCardBack, setIdCardBack] = useState(null);

  // UI state
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBranchPicker, setShowBranchPicker] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch(`${API_URL}/api/branches`);
        const data = await res.json();
        if (data.success) setBranches(data.data);
      } catch (error) {
        console.error('Şube yükleme hatası:', error);
      }
    };
    fetchBranches();
  }, []);

  const getEmployeeToken = async () => {
    return await AsyncStorage.getItem(EMPLOYEE_TOKEN_KEY);
  };

  // Telefon numarası maskeleme: 0555 555 55 55
  const formatPhone = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 11);
    let formatted = '';
    if (digits.length > 0) formatted = digits.slice(0, 4);
    if (digits.length > 4) formatted += ' ' + digits.slice(4, 7);
    if (digits.length > 7) formatted += ' ' + digits.slice(7, 9);
    if (digits.length > 9) formatted += ' ' + digits.slice(9, 11);
    return formatted;
  };

  // Kimlik kartı fotoğrafını standart boyut ve formata getir
  const standardizeIdImage = async (uri) => {
    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 900 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    return `data:image/jpeg;base64,${manipulated.base64}`;
  };

  const takePhoto = async (side) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Hata', 'Kamera izni verilmedi');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.9,
        allowsEditing: true,
        aspect: [16, 10],
      });

      if (!result.canceled) {
        const base64 = await standardizeIdImage(result.assets[0].uri);
        if (side === 'front') setIdCardFront(base64);
        else setIdCardBack(base64);
      }
    } catch (error) {
      console.error('Fotoğraf çekme hatası:', error);
      Alert.alert('Hata', 'Fotoğraf çekilemedi. Lütfen tekrar deneyin.');
    }
  };

  const pickImage = async (side) => {
    Alert.alert(
      'Kimlik Görseli',
      `Kimlik ${side === 'front' ? 'ön yüz' : 'arka yüz'} görseli için`,
      [
        {
          text: 'Kamera ile Çek',
          onPress: () => takePhoto(side)
        },
        {
          text: 'Galeriden Seç',
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              quality: 0.8,
              allowsEditing: true,
              aspect: [16, 10],
            });
            if (!result.canceled) {
              const base64 = await standardizeIdImage(result.assets[0].uri);
              if (side === 'front') setIdCardFront(base64);
              else setIdCardBack(base64);
            }
          }
        },
        { text: 'İptal', style: 'cancel' }
      ]
    );
  };

  const handleSignatureOK = (sig) => {
    setSignature(sig);
    setShowSignaturePad(false);
  };

  const handleSignatureClear = () => {
    signatureRef.current?.clearSignature();
  };

  const validateForm = () => {
    if (!fullName.trim()) return 'İsim Soyisim zorunludur';
    if (!identityNumber.trim() || identityNumber.length !== 11) return 'TC/Vergi No 11 hane olmalıdır';
    if (!phone.trim()) return 'Telefon zorunludur';
    if (!address.trim()) return 'Adres zorunludur';
    if (!branchId) return 'Şube seçimi zorunludur';
    if (!totalAmount || isNaN(totalAmount)) return 'Geçerli bir tutar girin';
    if (!kvkkConsent) return 'KVKK onayı zorunludur';
    if (!signature) return 'İmza zorunludur';
    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert('Eksik Bilgi', error);
      return;
    }

    setLoading(true);
    try {
      const token = await getEmployeeToken();
      if (!token) {
        Alert.alert('Oturum Süresi Doldu', 'Lütfen tekrar giriş yapın');
        navigation.replace('EmployeeLogin');
        return;
      }

      const response = await fetch(`${API_URL}/api/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          identityNumber: identityNumber.trim(),
          phone: phone.trim(),
          occupation: occupation.trim(),
          address: address.trim(),
          date,
          branchId,
          totalAmount: parseFloat(totalAmount),
          details: details.trim(),
          additionalInfo: additionalInfo.trim(),
          kvkkConsent,
          signature,
          idCardFront: idCardFront || '',
          idCardBack: idCardBack || ''
        })
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          'Başarılı',
          'Müşteri tanı formu başarıyla gönderildi',
          [{ text: 'Tamam', onPress: () => resetForm() }]
        );
      } else {
        if (response.status === 401) {
          await AsyncStorage.removeItem(EMPLOYEE_TOKEN_KEY);
          navigation.replace('EmployeeLogin');
        } else {
          Alert.alert('Hata', data.message || 'Form gönderilemedi');
        }
      }
    } catch (error) {
      console.error('Form gönderme hatası:', error);
      Alert.alert('Hata', 'Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFullName('');
    setIdentityNumber('');
    setPhone('');
    setOccupation('');
    setAddress('');
    setDate(new Date().toISOString().split('T')[0]);
    setBranchId('');
    setTotalAmount('');
    setDetails('');
    setKvkkConsent(false);
    setSignature('');
    setIdCardFront(null);
    setIdCardBack(null);
  };

  const handleLogout = async () => {
    Alert.alert('Çıkış', 'Çıkış yapmak istediğinizden emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem(EMPLOYEE_TOKEN_KEY);
          navigation.replace('EmployeeLogin');
        }
      }
    ]);
  };

  const selectedBranch = branches.find(b => (b.id || b._id) === branchId);

  const signatureStyle = `.m-signature-pad--footer { display: none; } .m-signature-pad { box-shadow: none; border: none; } body,html { width: 100%; height: 100%; }`;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.headerGradientStart} />

      {/* Header */}
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.header, { paddingTop: insets.top > 0 ? insets.top : 40 }]}
      >
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
            <FontAwesome5 name="arrow-left" size={20} color={palette.headerText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Müşteri Tanı Formu</Text>
          <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
            <FontAwesome5 name="sign-out-alt" size={20} color={palette.headerText} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, paddingBottom: insets.bottom }}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, { paddingBottom: 30 }]}>

          {/* Kişisel Bilgiler */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>

            <Text style={styles.label}>İsim Soyisim / Ünvan *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ad Soyad veya Şirket Ünvanı"
              placeholderTextColor="#9ca3af"
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={styles.label}>T.C. No / Vergi No *</Text>
            <TextInput
              style={styles.input}
              placeholder="11 haneli numara"
              placeholderTextColor="#9ca3af"
              value={identityNumber}
              onChangeText={setIdentityNumber}
              keyboardType="numeric"
              maxLength={11}
            />

            <Text style={styles.label}>Telefon No *</Text>
            <TextInput
              style={styles.input}
              placeholder="0555 555 55 55"
              placeholderTextColor="#9ca3af"
              value={phone}
              onChangeText={(text) => setPhone(formatPhone(text))}
              keyboardType="phone-pad"
              maxLength={14}
            />

            <Text style={styles.label}>Meslek Bilgisi</Text>
            <TextInput
              style={styles.input}
              placeholder="Meslek"
              placeholderTextColor="#9ca3af"
              value={occupation}
              onChangeText={setOccupation}
            />

            <Text style={styles.label}>Adres *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Açık adres"
              placeholderTextColor="#9ca3af"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Kimlik Görseli */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Kimlik Görseli</Text>
            <View style={styles.idCardRow}>
              <TouchableOpacity style={styles.idCardButton} onPress={() => pickImage('front')}>
                {idCardFront ? (
                  <Image source={{ uri: idCardFront }} style={styles.idCardImage} />
                ) : (
                  <View style={styles.idCardPlaceholder}>
                    <FontAwesome5 name="id-card" size={24} color="#9ca3af" />
                    <Text style={styles.idCardText}>Ön Yüz</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.idCardButton} onPress={() => pickImage('back')}>
                {idCardBack ? (
                  <Image source={{ uri: idCardBack }} style={styles.idCardImage} />
                ) : (
                  <View style={styles.idCardPlaceholder}>
                    <FontAwesome5 name="id-card" size={24} color="#9ca3af" />
                    <Text style={styles.idCardText}>Arka Yüz</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* İşlem Bilgileri */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>İşlem Bilgileri</Text>

            <Text style={styles.label}>Tarih *</Text>
            <TextInput
              style={styles.input}
              placeholder="GG.AA.YYYY"
              placeholderTextColor="#9ca3af"
              value={date}
              onChangeText={setDate}
            />

            <Text style={styles.label}>Şube *</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowBranchPicker(true)}
            >
              <Text style={selectedBranch ? styles.pickerText : styles.pickerPlaceholder}>
                {selectedBranch ? `${selectedBranch.name} - ${selectedBranch.city}` : 'Şube seçin...'}
              </Text>
              <FontAwesome5 name="chevron-down" size={14} color="#6b7280" />
            </TouchableOpacity>

            <Text style={styles.label}>Toplam Tutar (TL) *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#9ca3af"
              value={totalAmount}
              onChangeText={setTotalAmount}
              keyboardType="decimal-pad"
            />

            <Text style={styles.label}>Detay</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Alışveriş detaylarını yazın..."
              placeholderTextColor="#9ca3af"
              value={details}
              onChangeText={setDetails}
              multiline
              numberOfLines={3}
            />

          </View>

          {/* KVKK Onayı */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>KVKK Açık Rıza Metni</Text>
            <Text style={styles.kvkkText}>
              6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında; işbu Müşteri Tanı Formu üzerinde tarafımca beyan edilen kişisel verilerin (kimlik bilgileri, iletişim bilgileri ve ekli kimlik kartı görseli dâhil) doğru ve güncel olduğunu kabul ve beyan ederim.
            </Text>
            <Text style={styles.kvkkText}>
              Söz konusu kişisel verilerimin; müşteri tanıma (KYC), yasal yükümlülüklerin yerine getirilmesi, mevzuata uyum, muhasebe ve denetim süreçlerinin yürütülmesi amaçlarıyla, KVKK'nın 5 ve 8'inci maddelerinde yer alan hukuki sebepler ve istisnalar kapsamında sınırlı ve ölçülü olmak kaydıyla paylaşılabileceğini bildiğimi ve bu hususta açık rıza verdiğimi kabul ederim.
            </Text>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setKvkkConsent(!kvkkConsent)}
            >
              <View style={[styles.checkbox, kvkkConsent && styles.checkboxChecked]}>
                {kvkkConsent && <FontAwesome5 name="check" size={12} color="#FFFFFF" />}
              </View>
              <Text style={styles.checkboxLabel}>KVKK metnini okudum, anladım ve kabul ediyorum.</Text>
            </TouchableOpacity>
          </View>

          {/* İmza */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>İmza</Text>
            <Text style={styles.signatureNote}>Formdaki bilgilerin doğru olduğunu onaylıyorum.</Text>

            {signature ? (
              <View>
                <Image source={{ uri: signature }} style={styles.signaturePreview} />
                <TouchableOpacity
                  style={styles.clearSignatureButton}
                  onPress={() => { setSignature(''); }}
                >
                  <FontAwesome5 name="redo" size={14} color="#ef4444" />
                  <Text style={styles.clearSignatureText}>Yeniden İmzala</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.signatureButton}
                onPress={() => setShowSignaturePad(true)}
              >
                <FontAwesome5 name="signature" size={20} color={palette.headerGradientStart} />
                <Text style={styles.signatureButtonText}>İmza At</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Gönder Butonu */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#1A1A1A" />
            ) : (
              <>
                <FontAwesome5 name="paper-plane" size={16} color="#1A1A1A" style={{ marginRight: 8 }} />
                <Text style={styles.submitButtonText}>Formu Gönder</Text>
              </>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Şube Seçici Modal */}
      <Modal visible={showBranchPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Şube Seçin</Text>
              <TouchableOpacity onPress={() => setShowBranchPicker(false)}>
                <FontAwesome5 name="times" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={branches}
              keyExtractor={(item) => item.id || item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.branchItem,
                    (item.id || item._id) === branchId && styles.branchItemSelected
                  ]}
                  onPress={() => {
                    setBranchId(item.id || item._id);
                    setShowBranchPicker(false);
                  }}
                >
                  <Text style={styles.branchItemName}>{item.name}</Text>
                  <Text style={styles.branchItemCity}>{item.city}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Şube bulunamadı</Text>
              }
            />
          </View>
        </View>
      </Modal>

      {/* İmza Pad Modal */}
      <Modal visible={showSignaturePad} animationType="slide">
        <View style={[styles.signaturePadContainer, { paddingTop: insets.top }]}>
          <View style={styles.signaturePadHeader}>
            <TouchableOpacity onPress={() => setShowSignaturePad(false)}>
              <Text style={styles.signaturePadCancel}>İptal</Text>
            </TouchableOpacity>
            <Text style={styles.signaturePadTitle}>İmzanızı Atın</Text>
            <TouchableOpacity onPress={handleSignatureClear}>
              <Text style={styles.signaturePadClear}>Temizle</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.signatureCanvasContainer}>
            <SignatureScreen
              ref={signatureRef}
              onOK={handleSignatureOK}
              onEmpty={() => Alert.alert('Hata', 'Lütfen imzanızı atın')}
              webStyle={signatureStyle}
              backgroundColor="#FFFFFF"
              penColor="#000000"
              dotSize={2}
              minWidth={1.5}
              maxWidth={3}
            />
          </View>
          <TouchableOpacity
            style={styles.signatureSaveButton}
            onPress={() => signatureRef.current?.readSignature()}
          >
            <FontAwesome5 name="check" size={16} color="#1A1A1A" style={{ marginRight: 8 }} />
            <Text style={styles.signatureSaveText}>İmzayı Kaydet</Text>
          </TouchableOpacity>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6'
  },
  header: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)'
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  iconButton: {
    padding: 5
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.headerText
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    padding: 16
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: palette.headerGradientStart
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#f9fafb'
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top'
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#f9fafb'
  },
  pickerText: {
    fontSize: 15,
    color: '#111827'
  },
  pickerPlaceholder: {
    fontSize: 15,
    color: '#9ca3af'
  },
  idCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  idCardButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f9fafb'
  },
  idCardPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24
  },
  idCardText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 6
  },
  idCardImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover'
  },
  kvkkText: {
    fontSize: 11,
    color: '#6b7280',
    lineHeight: 16,
    marginBottom: 8
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#FFFFFF'
  },
  checkboxChecked: {
    backgroundColor: palette.headerGradientStart,
    borderColor: palette.headerGradientStart
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
    fontWeight: '600'
  },
  signatureNote: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 10,
    fontStyle: 'italic'
  },
  signatureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: palette.headerGradientStart,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 20,
    backgroundColor: '#FFFDF0'
  },
  signatureButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.headerGradientStart,
    marginLeft: 8
  },
  signaturePreview: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#FFFFFF',
    resizeMode: 'contain'
  },
  clearSignatureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8
  },
  clearSignatureText: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: '600',
    marginLeft: 6
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.headerGradientStart,
    borderRadius: 25,
    paddingVertical: 16,
    marginTop: 8,
    shadowColor: palette.headerGradientStart,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4
  },
  submitButtonDisabled: {
    opacity: 0.7
  },
  submitButtonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 30
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937'
  },
  branchItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  branchItemSelected: {
    backgroundColor: '#FFF9E6'
  },
  branchItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827'
  },
  branchItemCity: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    padding: 24,
    fontSize: 14
  },
  // Signature Pad
  signaturePadContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  signaturePadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  signaturePadTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937'
  },
  signaturePadCancel: {
    fontSize: 15,
    color: '#ef4444',
    fontWeight: '600'
  },
  signaturePadClear: {
    fontSize: 15,
    color: '#3b82f6',
    fontWeight: '600'
  },
  signatureCanvasContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    margin: 16,
    borderRadius: 10,
    overflow: 'hidden'
  },
  signatureSaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.headerGradientStart,
    borderRadius: 25,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginBottom: 20
  },
  signatureSaveText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '700'
  }
});

export default KYCFormScreen;
