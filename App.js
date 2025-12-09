import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { Alert } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/components/SplashScreen';
import { requestNotificationPermission } from './src/services/NotificationService';

// NOMANOĞLU Teması (HAREM-Inspired: Mor-Lacivert Gradient)
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#5b21b6',      // HAREM moru
    secondary: '#4c1d95',   // Koyu mor
    tertiary: '#7c3aed',    // Açık mor
    background: '#FFFFFF',  // Beyaz arka plan
    surface: '#FFFFFF',     // Beyaz kartlar
    surfaceVariant: '#f1f5f9', // Açık gri
    onSurface: '#1e293b',   // Koyu text
    onSurfaceVariant: '#64748b', // Gri text
    elevation: {
      level0: 'transparent',
      level1: '#FFFFFF',
      level2: '#f8fafc',
      level3: '#f1f5f9',
    },
  },
  roundness: 16, // HAREM gibi yuvarlak köşeler
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Uygulama başlatma işlemleri
    const initializeApp = async () => {
      // Splash ekranı bittikten sonra bildirim izni iste
      if (!showSplash && !appReady) {
        const hasPermission = await requestNotificationPermission();
        
        if (!hasPermission) {
          Alert.alert(
            'Bildirimler',
            'Fiyat alarmlarından haberdar olmak için bildirim izni vermeniz önerilir. Ayarlar > Uygulamalar > NOMANOĞLU ALTIN > Bildirimler menüsünden izin verebilirsiniz.',
            [{ text: 'Tamam' }]
          );
        }
        
        setAppReady(true);
      }
    };

    initializeApp();
  }, [showSplash]);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
      <StatusBar style="dark" />
    </PaperProvider>
  );
}
