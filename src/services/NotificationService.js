import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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

