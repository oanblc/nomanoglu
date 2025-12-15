import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, WS_URL } from '../config';
import { checkAlarms } from '../services/NotificationService';

const ALARMS_KEY = '@alarms';

// Demo data - Backend bağlantısı yoksa gösterilecek
const demoData = [];

// Fiyat değişim yüzdesini hesapla (satış fiyatı üzerinden)
const calculateChangePercent = (currentPrice, previousPrice) => {
  if (!previousPrice || previousPrice === 0 || !currentPrice) {
    return { percent: '0.00', isPositive: true, hasChange: false };
  }
  const change = ((currentPrice - previousPrice) / previousPrice) * 100;
  return {
    percent: Math.abs(change).toFixed(2),
    isPositive: change >= 0,
    hasChange: change !== 0
  };
};

export const useWebSocket = () => {
  const [prices, setPrices] = useState(demoData);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const socketRef = useRef(null);
  const previousPricesRef = useRef({}); // Önceki fiyatları sakla
  const alarmsRef = useRef([]); // Alarmları sakla

  // Alarmları yükle ve güncel tut
  const loadAlarms = async () => {
    try {
      const stored = await AsyncStorage.getItem(ALARMS_KEY);
      if (stored) {
        alarmsRef.current = JSON.parse(stored);
        console.log('📋 Alarmlar yüklendi:', alarmsRef.current.length, 'alarm', JSON.stringify(alarmsRef.current));
      } else {
        alarmsRef.current = [];
        console.log('📋 Alarm yok');
      }
    } catch (error) {
      console.log('Alarmlar yüklenemedi:', error);
    }
  };

  // Tetiklenen alarmları işaretle (silmiyoruz, triggered: true yapıyoruz)
  const markAlarmsAsTriggered = async (triggeredIds) => {
    try {
      const stored = await AsyncStorage.getItem(ALARMS_KEY);
      if (stored) {
        const alarms = JSON.parse(stored);
        const updated = alarms.map(a => {
          if (triggeredIds.includes(a.id)) {
            return { ...a, triggered: true, triggeredAt: new Date().toISOString() };
          }
          return a;
        });
        await AsyncStorage.setItem(ALARMS_KEY, JSON.stringify(updated));
        alarmsRef.current = updated;
        console.log('✅ Alarmlar tetiklendi olarak işaretlendi:', triggeredIds.length);
      }
    } catch (error) {
      console.log('Alarm işaretleme hatası:', error);
    }
  };

  // Alarmları kontrol et
  const checkAlarmsWithPrices = async (pricesData) => {
    console.log('🔔 checkAlarmsWithPrices çağrıldı, alarm sayısı:', alarmsRef.current.length);
    if (alarmsRef.current.length === 0) {
      console.log('⚠️ Alarm yok, kontrol atlanıyor');
      return;
    }

    // Sadece henüz tetiklenmemiş alarmları kontrol et
    const activeAlarms = alarmsRef.current.filter(a => !a.triggered);
    if (activeAlarms.length === 0) {
      console.log('⚠️ Aktif alarm yok');
      return;
    }

    await checkAlarms(pricesData, activeAlarms, async (triggeredIds) => {
      // Tetiklenen alarmları işaretle
      await markAlarmsAsTriggered(triggeredIds);
    });
  };

  // İlk yüklemede cache'den fiyatları çek
  useEffect(() => {
    const fetchCachedPrices = async () => {
      try {
        // Önce alarmları yükle
        await loadAlarms();

        console.log('📦 Cache\'den fiyatlar çekiliyor...');
        const response = await fetch(`${API_URL}/api/prices/cached`);
        const result = await response.json();

        if (result.success && result.data?.prices?.length > 0) {
          // Sadece isCustom ve isVisible olan ürünleri al, order'a göre sırala
          // NOT: order ?? 999 kullanıyoruz çünkü order=0 geçerli bir değer (Has Altın)
          const customPrices = result.data.prices
            .filter(p => p.isCustom !== false && p.isVisible !== false)
            .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
            .map(p => {
              // İlk yüklemede değişim yüzdesi %0.00 olacak
              return {
                ...p,
                changePercent: '0.00',
                isPositive: true,
                hasChange: false
              };
            });

          // Önceki fiyatları sakla (satış fiyatı üzerinden)
          customPrices.forEach(p => {
            previousPricesRef.current[p.code] = p.calculatedSatis;
          });

          console.log('✅ Cache\'den', customPrices.length, 'fiyat yüklendi');
          setPrices(customPrices);
          setLastUpdate(result.updatedAt);

          // Alarmları kontrol et
          await checkAlarmsWithPrices(customPrices);
        }
      } catch (error) {
        console.error('❌ Cache fetch hatası:', error.message);
      }
    };

    fetchCachedPrices();
  }, []);

  // WebSocket bağlantısı
  useEffect(() => {
    try {
      console.log('🔌 WebSocket bağlantısı kuruluyor:', WS_URL);

      socketRef.current = io(WS_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 10000,
      });

      socketRef.current.on('connect', () => {
        console.log('✅ WebSocket bağlandı');
        setIsConnected(true);
      });

      socketRef.current.on('disconnect', () => {
        console.log('❌ WebSocket bağlantısı koptu');
        setIsConnected(false);
      });

      socketRef.current.on('priceUpdate', async (data) => {
        console.log('📊 Fiyat güncellemesi alındı:', data.prices?.length || 0, 'ürün');
        if (data && data.prices && data.prices.length > 0) {
          // Alarmları yeniden yükle (yeni alarm eklenmiş olabilir)
          await loadAlarms();

          // Sadece isCustom ve isVisible olan ürünleri al, order'a göre sırala
          // NOT: order ?? 999 kullanıyoruz çünkü order=0 geçerli bir değer (Has Altın)
          const customPrices = data.prices
            .filter(p => p.isCustom !== false && p.isVisible !== false)
            .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
            .map(p => {
              // Önceki fiyatla karşılaştır ve değişim yüzdesini hesapla
              const prevPrice = previousPricesRef.current[p.code];
              const changeInfo = calculateChangePercent(p.calculatedSatis, prevPrice);

              return {
                ...p,
                changePercent: changeInfo.percent,
                isPositive: changeInfo.isPositive,
                hasChange: changeInfo.hasChange
              };
            });

          // Yeni fiyatları önceki fiyatlar olarak sakla
          customPrices.forEach(p => {
            previousPricesRef.current[p.code] = p.calculatedSatis;
          });

          if (customPrices.length > 0) {
            console.log('✅ WebSocket\'ten', customPrices.length, 'custom fiyat alındı');
            setPrices(customPrices);
            setLastUpdate(new Date().toISOString());

            // Alarmları kontrol et
            await checkAlarmsWithPrices(customPrices);
          }
        }
      });

      socketRef.current.on('connect_error', (error) => {
        console.log('⚠️ WebSocket bağlantı hatası:', error.message);
        setIsConnected(false);
      });
    } catch (error) {
      console.log('⚠️ WebSocket başlatma hatası:', error);
      setIsConnected(false);
    }

    return () => {
      try {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      } catch (error) {
        console.error('❌ WebSocket kapatma hatası:', error);
      }
    };
  }, []);

  return {
    prices,
    isConnected,
    lastUpdate,
  };
};

