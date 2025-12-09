import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Platform, TouchableOpacity, Linking } from 'react-native';
import { FontAwesome6, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/HomeScreen';
import MarketsScreen from '../screens/MarketsScreen';
import AlarmsScreen from '../screens/AlarmsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import AboutScreen from '../screens/AboutScreen';
import ContactScreen from '../screens/ContactScreen';
import { palette } from '../../theme/colors';
import { typography } from '../../theme/fonts';

const Tab = createBottomTabNavigator();

// External link tab component
const ExternalLinkTab = ({ url, children }) => {
  return null; // This is just a placeholder, actual navigation handled by listener
};

const BottomTabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="AnaSayfa"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.navActive,
        tabBarInactiveTintColor: palette.navInactive,
        tabBarStyle: {
          backgroundColor: '#f9fafb',
          borderTopWidth: 0,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 4,
          paddingHorizontal: 4,
          position: 'absolute',
          bottom: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
          elevation: 12,
        },
        tabBarLabelStyle: {
          ...typography.navLabel,
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
        tabBarItemStyle: {
          flex: 1,
        },
      }}
    >
      <Tab.Screen
        name="AnaSayfa"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Ana Sayfa',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="home" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Instagram"
        component={HomeScreen}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            Linking.openURL('https://www.instagram.com/nomanoglukuyumcu/');
          },
        }}
        options={{
          tabBarLabel: 'Instagram',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="instagram" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="TikTok"
        component={HomeScreen}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            Linking.openURL('https://www.tiktok.com/@nomanoglukuyumcu');
          },
        }}
        options={{
          tabBarLabel: 'TikTok',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="tiktok" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="WebSite"
        component={HomeScreen}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            Linking.openURL('https://www.nomanoglu.com.tr/');
          },
        }}
        options={{
          tabBarLabel: 'Web Sitesi',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="globe" size={20} color={color} />
          ),
        }}
      />
      {/* Hidden screens - accessible from sidebar */}
      <Tab.Screen
        name="Piyasa"
        component={MarketsScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tab.Screen
        name="Alarmlar"
        component={AlarmsScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tab.Screen
        name="Favorilerim"
        component={FavoritesScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tab.Screen
        name="Hakkimizda"
        component={AboutScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tab.Screen
        name="Iletisim"
        component={ContactScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;

