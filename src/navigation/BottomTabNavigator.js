import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Linking } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/HomeScreen';
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
        tabBarActiveTintColor: '#444444',
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: {
          backgroundColor: '#f9fafb',
          borderTopWidth: 0,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom + 4 : 8,
          paddingTop: 8,
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
          minWidth: 70,
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
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;

