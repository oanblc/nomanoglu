import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { palette, gradient } from '../../theme/colors';
import { requestNotificationPermission } from '../services/NotificationService';

const { width, height } = Dimensions.get('window');

const ONBOARDING_KEY = '@onboarding_complete';

const slides = [
  {
    id: '1',
    icon: 'coins',
    title: 'Canlı Altın Fiyatları',
    description: 'Güncel altın ve döviz fiyatlarını anlık olarak takip edin. Fiyatlar saniyeler içinde güncellenir.',
    color: '#F7DE00',
  },
  {
    id: '2',
    icon: 'bell',
    title: 'Fiyat Alarmları',
    description: 'İstediğiniz ürün için fiyat alarmı kurun. Hedef fiyata ulaşıldığında anında bildirim alın.',
    color: '#16a34a',
  },
  {
    id: '3',
    icon: 'star',
    title: 'Favorileriniz',
    description: 'En çok takip ettiğiniz ürünleri favorilere ekleyin. Ana sayfada hızlıca görüntüleyin.',
    color: '#3b82f6',
  },
  {
    id: '4',
    icon: 'bell',
    title: 'Bildirimleri Aç',
    description: 'Fiyat alarmlarından ve önemli güncellemelerden haberdar olmak için bildirimlere izin verin.',
    color: '#ef4444',
    isNotificationSlide: true,
  },
  {
    id: '5',
    icon: 'handshake',
    title: 'Nomanoğlu Güvencesi',
    description: '50 yılı aşkın tecrübemizle yanınızdayız. Güvenilir alım satım için bizi tercih edin.',
    color: '#8b5cf6',
  },
];

const OnboardingScreen = ({ navigation, onComplete }) => {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [notificationGranted, setNotificationGranted] = useState(false);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const currentSlide = slides[currentIndex];
  const isNotificationSlide = currentSlide?.isNotificationSlide;

  const handleNotificationPermission = async () => {
    try {
      const granted = await requestNotificationPermission();
      setNotificationGranted(granted);

      if (granted) {
        // İzin verildi, sonraki slide'a geç
        if (currentIndex < slides.length - 1) {
          flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
          completeOnboarding();
        }
      } else {
        // İzin verilmedi ama yine de devam edebilir
        Alert.alert(
          'Bildirimler Kapalı',
          'Fiyat alarmlarından haberdar olmak için daha sonra Ayarlar\'dan bildirimleri açabilirsiniz.',
          [
            {
              text: 'Devam Et',
              onPress: () => {
                if (currentIndex < slides.length - 1) {
                  flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
                } else {
                  completeOnboarding();
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      console.log('Bildirim izni hatası:', error);
      // Hata durumunda da devam et
      if (currentIndex < slides.length - 1) {
        flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      } else {
        completeOnboarding();
      }
    }
  };

  const handleNext = () => {
    // Bildirim slide'ında izin iste
    if (isNotificationSlide) {
      handleNotificationPermission();
      return;
    }

    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.log('Onboarding kaydetme hatası:', error);
      if (onComplete) {
        onComplete();
      }
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderSlide = ({ item, index }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.4, 1, 0.4],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.slide}>
        <Animated.View style={[styles.iconContainer, { transform: [{ scale }], opacity }]}>
          <View style={[styles.iconCircle, { backgroundColor: item.color + '20' }]}>
            <FontAwesome5 name={item.icon} size={60} color={item.color} />
          </View>
        </Animated.View>

        <Animated.View style={{ opacity }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </Animated.View>
      </View>
    );
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });

          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity: dotOpacity,
                  backgroundColor: palette.headerGradientStart,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Logo */}
      <View style={[styles.logoContainer, { paddingTop: insets.top + 20 }]}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Skip Button */}
      {currentIndex < slides.length - 1 && (
        <TouchableOpacity
          style={[styles.skipButton, { top: insets.top + 20 }]}
          onPress={handleSkip}
        >
          <Text style={styles.skipText}>Atla</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
      />

      {/* Dots */}
      {renderDots()}

      {/* Bottom Button */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity onPress={handleNext} activeOpacity={0.8}>
          <LinearGradient
            colors={isNotificationSlide ? ['#ef4444', '#dc2626'] : gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <FontAwesome5
              name={isNotificationSlide ? 'bell' : (currentIndex === slides.length - 1 ? 'check' : 'arrow-right')}
              size={18}
              color={isNotificationSlide ? '#FFFFFF' : '#1A1A1A'}
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.buttonText, isNotificationSlide && { color: '#FFFFFF' }]}>
              {isNotificationSlide ? 'Bildirimlere İzin Ver' : (currentIndex === slides.length - 1 ? 'Başla' : 'Devam')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Bildirim slide'ında "Şimdi Değil" seçeneği */}
        {isNotificationSlide && (
          <TouchableOpacity
            onPress={() => {
              if (currentIndex < slides.length - 1) {
                flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
              } else {
                completeOnboarding();
              }
            }}
            style={styles.skipNotificationButton}
          >
            <Text style={styles.skipNotificationText}>Şimdi Değil</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 140,
    height: 50,
  },
  skipButton: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
  },
  skipText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  slide: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  bottomContainer: {
    paddingHorizontal: 40,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  skipNotificationButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  skipNotificationText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
});

export default OnboardingScreen;
