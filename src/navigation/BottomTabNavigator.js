import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Platform } from 'react-native';
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
          fontSize: 11,
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
        name="Piyasa"
        component={MarketsScreen}
        options={{
          tabBarLabel: 'Piyasalar',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="chart-line" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Favorilerim"
        component={FavoritesScreen}
        options={{
          tabBarLabel: 'Favoriler',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="star" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Alarmlar"
        component={AlarmsScreen}
        options={{
          tabBarLabel: 'Alarmlar',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="bell" size={20} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;

