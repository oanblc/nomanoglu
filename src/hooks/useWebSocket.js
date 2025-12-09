import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { WS_URL } from '../config';

// Demo data (HAREM gibi - Backend bağlantısı yoksa)
const demoData = [
  { code: 'USDTRY', name: 'Amerikan Doları', calculatedSatis: 42430, calculatedAlis: 42300, direction: {}, category: 'doviz', order: 1 },
  { code: 'EURTRY', name: 'Euro', calculatedSatis: 49200, calculatedAlis: 48934, direction: {}, category: 'doviz', order: 2 },
  { code: 'EURUSD', name: 'EUR/USD', calculatedSatis: 1.1595, calculatedAlis: 1.1568, direction: {}, category: 'doviz', order: 3 },
  { code: 'GBPTRY', name: 'İngiliz Sterlini', calculatedSatis: 56110, calculatedAlis: 55650, direction: {}, category: 'doviz', order: 4 },
  { code: 'CHFTRY', name: 'İsviçre Frangı', calculatedSatis: 52866, calculatedAlis: 52004, direction: {}, category: 'doviz', order: 5 },
  { code: 'AUDTRY', name: 'Avustralya Doları', calculatedSatis: 27724, calculatedAlis: 26861, direction: {}, category: 'doviz', order: 6 },
  { code: 'CADTRY', name: 'Kanada Doları', calculatedSatis: 31714, calculatedAlis: 29735, direction: {}, category: 'doviz', order: 7 },
  { code: 'SARTRY', name: 'Suudi Arabistan Riyali', calculatedSatis: 11657, calculatedAlis: 11117, direction: {}, category: 'doviz', order: 8 },
  { code: 'JPYTRY', name: 'Japon Yeni', calculatedSatis: 0.2712, calculatedAlis: 0.2680, direction: {}, category: 'doviz', order: 9 },
  { code: 'ALTIN', name: 'Altın (Gr)', calculatedSatis: 2845.50, calculatedAlis: 2840.20, direction: {}, category: 'altin', order: 10 },
  { code: 'GUMUSTRY', name: 'Gümüş (Gr)', calculatedSatis: 34.25, calculatedAlis: 34.10, direction: {}, category: 'altin', order: 11 },
];

export const useWebSocket = () => {
  const [prices, setPrices] = useState(demoData); // Demo data ile başla
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const socketRef = useRef(null);

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

      socketRef.current.on('priceUpdate', (data) => {
        console.log('📊 Fiyat güncellemesi alındı:', data.prices?.length || 0, 'ürün');
        if (data && data.prices) {
          setPrices(data.prices);
          setLastUpdate(new Date().toISOString());
        }
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('❌ WebSocket bağlantı hatası:', error.message);
        setIsConnected(false);
      });
    } catch (error) {
      console.error('❌ WebSocket başlatma hatası:', error);
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

