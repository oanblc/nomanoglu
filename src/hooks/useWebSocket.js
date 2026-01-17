import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, WS_URL } from '../config';
import { checkAlarms } from '../services/NotificationService';

const ALARMS_KEY = '@alarms';
const PRICES_CACHE_KEY = '@cached_prices';

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
  const pricesMapRef = useRef({}); // Tüm fiyatları map olarak sakla (kaybolmaması için)
  const alarmsRef = useRef([]); // Alarmları sakla

  // Fiyatları AsyncStorage'a kaydet (uygulama kapansa bile korunsun)
  const savePricesToCache = async (pricesMap) => {
    try {
      await AsyncStorage.setItem(PRICES_CACHE_KEY, JSON.stringify(pricesMap));
    } catch (error) {
      console.log('Fiyat cache kaydetme hatası:', error);
    }
  };

  // AsyncStorage'dan fiyatları yükle
  const loadPricesFromCache = async () => {
    try {
      const cached = await AsyncStorage.getItem(PRICES_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.log('Fiyat cache yükleme hatası:', error);
    }
    return {};
  };

  // Map'i sıralı array'e çevir
  const mapToSortedArray = (pricesMap) => {
    return Object.values(pricesMap)
      .filter(p => p.isCustom !== false && p.isVisible !== false)
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  };

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

  // Tetiklenen alarmları işaretle ve pasif yap
  const markAlarmsAsTriggered = async (triggeredIds) => {
    try {
      const stored = await AsyncStorage.getItem(ALARMS_KEY);
      if (stored) {
        const alarms = JSON.parse(stored);
        const updated = alarms.map(a => {
          if (triggeredIds.includes(a.id)) {
            return { ...a, triggered: true, isActive: false, triggeredAt: new Date().toISOString() };
          }
          return a;
        });
        await AsyncStorage.setItem(ALARMS_KEY, JSON.stringify(updated));
        alarmsRef.current = updated;
        console.log('✅ Alarmlar tetiklendi ve pasif yapıldı:', triggeredIds.length);
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

    // Sadece aktif ve henüz tetiklenmemiş alarmları kontrol et
    const activeAlarms = alarmsRef.current.filter(a => !a.triggered && a.isActive !== false);
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

        // Önce local cache'den yükle (hızlı açılış için)
        const localCache = await loadPricesFromCache();
        if (Object.keys(localCache).length > 0) {
          pricesMapRef.current = localCache;
          const sortedPrices = mapToSortedArray(localCache);
          if (sortedPrices.length > 0) {
            console.log('📱 Local cache\'den', sortedPrices.length, 'fiyat yüklendi');
            setPrices(sortedPrices);
          }
        }

        // Sonra API'den güncel fiyatları çek
        console.log('📦 API cache\'den fiyatlar çekiliyor...');
        const response = await fetch(`${API_URL}/api/prices/cached`);
        const result = await response.json();

        if (result.success && result.data?.prices?.length > 0) {
          // API'den gelen fiyat kodlarını al
          const apiPriceCodes = new Set(
            result.data.prices
              .filter(p => p.isCustom !== false && p.isVisible !== false)
              .map(p => p.code)
          );

          // Cache'deki eski fiyatları sil (API'de olmayanlar)
          Object.keys(pricesMapRef.current).forEach(code => {
            if (!apiPriceCodes.has(code)) {
              console.log('🗑️ Silinen fiyat temizlendi:', code);
              delete pricesMapRef.current[code];
              delete previousPricesRef.current[code];
            }
          });

          // Gelen fiyatları güncelle
          result.data.prices.forEach(p => {
            if (p.isCustom !== false && p.isVisible !== false) {
              pricesMapRef.current[p.code] = {
                ...p,
                changePercent: '0.00',
                isPositive: true,
                hasChange: false
              };
              // Önceki fiyatı sakla
              previousPricesRef.current[p.code] = p.calculatedSatis;
            }
          });

          // Map'i sıralı array'e çevir
          const sortedPrices = mapToSortedArray(pricesMapRef.current);

          console.log('✅ API cache\'den', sortedPrices.length, 'fiyat yüklendi');
          setPrices(sortedPrices);
          setLastUpdate(result.updatedAt);

          // Local cache'e kaydet
          await savePricesToCache(pricesMapRef.current);

          // Alarmları kontrol et
          await checkAlarmsWithPrices(sortedPrices);
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

          // WebSocket'ten gelen fiyat kodlarını al
          const wsPriceCodes = new Set(
            data.prices
              .filter(p => p.isCustom !== false && p.isVisible !== false)
              .map(p => p.code)
          );

          // Cache'deki eski fiyatları sil (WebSocket'te olmayanlar)
          Object.keys(pricesMapRef.current).forEach(code => {
            if (!wsPriceCodes.has(code)) {
              console.log('🗑️ WebSocket: Silinen fiyat temizlendi:', code);
              delete pricesMapRef.current[code];
              delete previousPricesRef.current[code];
            }
          });

          // Gelen fiyatları güncelle
          data.prices.forEach(p => {
            if (p.isCustom !== false && p.isVisible !== false) {
              // Önceki fiyatla karşılaştır ve değişim yüzdesini hesapla
              const prevPrice = previousPricesRef.current[p.code];
              const changeInfo = calculateChangePercent(p.calculatedSatis, prevPrice);

              pricesMapRef.current[p.code] = {
                ...p,
                changePercent: changeInfo.percent,
                isPositive: changeInfo.isPositive,
                hasChange: changeInfo.hasChange
              };

              // Yeni fiyatı önceki fiyat olarak sakla
              previousPricesRef.current[p.code] = p.calculatedSatis;
            }
          });

          // Map'i sıralı array'e çevir
          const sortedPrices = mapToSortedArray(pricesMapRef.current);

          if (sortedPrices.length > 0) {
            console.log('✅ WebSocket\'ten', data.prices.length, 'fiyat geldi, toplam:', sortedPrices.length);
            setPrices(sortedPrices);
            setLastUpdate(new Date().toISOString());

            // Local cache'e kaydet
            await savePricesToCache(pricesMapRef.current);

            // Alarmları kontrol et
            await checkAlarmsWithPrices(sortedPrices);
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

