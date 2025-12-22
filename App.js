import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/components/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

const ONBOARDING_KEY = '@onboarding_complete';

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
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [appReady, setAppReady] = useState(false);

  // Onboarding durumunu kontrol et
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const onboardingComplete = await AsyncStorage.getItem(ONBOARDING_KEY);
        setShowOnboarding(onboardingComplete !== 'true');
      } catch (error) {
        console.log('Onboarding kontrol hatası:', error);
        setShowOnboarding(false);
      } finally {
        setCheckingOnboarding(false);
      }
    };

    checkOnboarding();
  }, []);

  useEffect(() => {
    // Uygulama başlatma işlemleri
    if (!showSplash && !showOnboarding && !appReady) {
      setAppReady(true);
    }
  }, [showSplash, showOnboarding]);

  if (showSplash || checkingOnboarding) {
    return (
      <SafeAreaProvider>
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </SafeAreaProvider>
    );
  }

  if (showOnboarding) {
    return (
      <SafeAreaProvider>
        <OnboardingScreen onComplete={() => setShowOnboarding(false)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
        <StatusBar style="dark" />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
