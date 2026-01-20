import 'react-native-gesture-handler';
import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';
import * as ExpoSplashScreen from 'expo-splash-screen';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/components/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

// Font yüklenene kadar splash screen'i göster
ExpoSplashScreen.preventAutoHideAsync();

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

  // Roboto fontlarını yükle
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
  });

  // Font yüklendiğinde splash screen'i gizle
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await ExpoSplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

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

  // Fontlar yüklenene kadar bekle
  if (!fontsLoaded) {
    return null;
  }

  if (showSplash || checkingOnboarding) {
    return (
      <SafeAreaProvider onLayout={onLayoutRootView}>
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </SafeAreaProvider>
    );
  }

  if (showOnboarding) {
    return (
      <SafeAreaProvider onLayout={onLayoutRootView}>
        <OnboardingScreen onComplete={() => setShowOnboarding(false)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
        <StatusBar style="dark" />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
