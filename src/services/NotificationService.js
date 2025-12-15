import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_KEY = '@notifications';

// Bildirim davranışını ayarla
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Bildirim izni iste
export const requestNotificationPermission = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Bildirim izni verilmedi');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Bildirim izni hatası:', error);
    return false;
  }
};

// Yerel bildirim gönder
export const sendLocalNotification = async (title, body, data = {}) => {
  try {
    const hasPermission = await requestNotificationPermission();
    
    if (!hasPermission) {
      console.log('Bildirim izni yok');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Hemen gönder
    });

    console.log('✅ Bildirim gönderildi:', title);
  } catch (error) {
    console.error('❌ Bildirim gönderme hatası:', error);
  }
};

// Alarm bildirimi gönder
export const sendAlarmNotification = async (alarm) => {
  const priceTypeText = alarm.priceType === 'Alış' ? 'Alış' : 'Satış';
  const conditionText = alarm.condition === '>' ? 'üstüne çıktı' : 'altına düştü';
  
  const title = '🔔 Fiyat Alarmı!';
  const body = `${alarm.code} ${priceTypeText} fiyatı ${alarm.targetPrice} ${conditionText}!`;
  
  await sendLocalNotification(title, body, {
    alarmId: alarm.id,
    code: alarm.code,
    targetPrice: alarm.targetPrice,
  });
};

// Test bildirimi gönder
export const sendTestNotification = async () => {
  await sendLocalNotification(
    '🔔 Test Alarmı',
    'USDTRY Satış fiyatı 43,500 üstüne çıktı! Güncel: 43,650',
    {
      test: true,
      code: 'USDTRY',
      targetPrice: '43,500',
    }
  );
};

// Fiyat string'ini sayıya çevir (örn: "3.456,78" -> 3456.78)
const parsePrice = (priceStr) => {
  if (!priceStr) return 0;
  // Türkçe format: nokta binlik ayracı, virgül ondalık ayracı
  const cleaned = priceStr.toString().replace(/\./g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
};

// Bildirimi bildirim merkezine kaydet
export const saveNotificationToCenter = async (title, body, type = 'alarm', data = {}) => {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    const notifications = stored ? JSON.parse(stored) : [];

    const newNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      body,
      type, // 'alarm', 'price', 'info' vb.
      data,
      read: false,
      createdAt: new Date().toISOString(),
    };

    notifications.push(newNotification);

    // En fazla 50 bildirim tut
    const trimmed = notifications.slice(-50);

    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(trimmed));
    console.log('📥 Bildirim merkeze kaydedildi:', title);

    return newNotification;
  } catch (error) {
    console.log('Bildirim kaydetme hatası:', error);
    return null;
  }
};

// Okunmamış bildirim sayısını al
export const getUnreadNotificationCount = async () => {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    if (!stored) return 0;
    const notifications = JSON.parse(stored);
    return notifications.filter(n => !n.read).length;
  } catch (error) {
    console.log('Bildirim sayısı alınamadı:', error);
    return 0;
  }
};

// Alarmları kontrol et ve tetikle
export const checkAlarms = async (prices, alarms, onAlarmTriggered) => {
  if (!prices || prices.length === 0 || !alarms || alarms.length === 0) {
    return;
  }

  console.log('🔍 Alarm kontrolü başlıyor...', alarms.length, 'alarm var');

  const triggeredAlarms = [];

  for (const alarm of alarms) {
    console.log('🔍 Alarm kontrol ediliyor:', alarm.code, 'Koşul:', alarm.condition, 'Hedef:', alarm.targetPrice);

    // Bu alarm için fiyat bilgisini bul
    const priceData = prices.find(p => p.code === alarm.code);
    if (!priceData) {
      console.log('❌ Fiyat bulunamadı:', alarm.code);
      continue;
    }

    // Alış veya satış fiyatını al
    const currentPriceRaw = alarm.priceType === 'Alış'
      ? priceData.calculatedAlis
      : priceData.calculatedSatis;

    const currentPrice = parseFloat(currentPriceRaw) || 0;
    const targetPrice = parsePrice(alarm.targetPrice);

    console.log('📊 Fiyat karşılaştırması:', alarm.code, '- Güncel:', currentPrice, 'Hedef:', targetPrice, 'Tip:', alarm.priceType);

    if (currentPrice === 0 || targetPrice === 0) {
      console.log('❌ Fiyat 0:', currentPrice, targetPrice);
      continue;
    }

    // Koşulu kontrol et
    let isTriggered = false;
    if (alarm.condition === '>') {
      // Fiyat hedefin üstüne çıktıysa
      isTriggered = currentPrice >= targetPrice;
      console.log('📈 Üstüne çıkarsa kontrolü:', currentPrice, '>=', targetPrice, '=', isTriggered);
    } else {
      // Fiyat hedefin altına düştüyse
      isTriggered = currentPrice <= targetPrice;
      console.log('📉 Altına düşerse kontrolü:', currentPrice, '<=', targetPrice, '=', isTriggered);
    }

    if (isTriggered) {
      console.log(`🔔 Alarm tetiklendi: ${alarm.code} - Güncel: ${currentPrice}, Hedef: ${targetPrice}`);

      // Bildirim gönder
      const priceTypeText = alarm.priceType;
      const conditionText = alarm.condition === '>' ? 'üstüne çıktı' : 'altına düştü';
      const formattedCurrentPrice = new Intl.NumberFormat('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      }).format(currentPrice);

      const notificationTitle = 'Fiyat Alarmı';
      const notificationBody = `${alarm.code} ${priceTypeText} fiyatı ${alarm.targetPrice} ${conditionText}! Güncel: ${formattedCurrentPrice}`;

      // Bildirimi bildirim merkezine kaydet
      await saveNotificationToCenter(
        notificationTitle,
        notificationBody,
        'alarm',
        {
          alarmId: alarm.id,
          code: alarm.code,
          targetPrice: alarm.targetPrice,
          currentPrice: formattedCurrentPrice,
        }
      );

      // Expo Go'da push notification çalışmadığı için Alert kullan
      Alert.alert(
        '🔔 Fiyat Alarmı!',
        `${alarm.code} ${priceTypeText} fiyatı ${alarm.targetPrice} ${conditionText}!\nGüncel: ${formattedCurrentPrice}`,
        [{ text: 'Tamam' }]
      );

      // Ayrıca local notification da göndermeyi dene (development build'de çalışır)
      await sendLocalNotification(
        '🔔 Fiyat Alarmı!',
        notificationBody,
        {
          alarmId: alarm.id,
          code: alarm.code,
          targetPrice: alarm.targetPrice,
          currentPrice: formattedCurrentPrice,
        }
      );

      triggeredAlarms.push(alarm.id);
    }
  }

  // Tetiklenen alarmları callback ile bildir
  if (triggeredAlarms.length > 0 && onAlarmTriggered) {
    onAlarmTriggered(triggeredAlarms);
  }

  return triggeredAlarms;
};

