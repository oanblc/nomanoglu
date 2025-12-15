import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabNavigator from './BottomTabNavigator';
import MarketsScreen from '../screens/MarketsScreen';
import AlarmsScreen from '../screens/AlarmsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import AboutScreen from '../screens/AboutScreen';
import ContactScreen from '../screens/ContactScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="MainTabs"
        component={BottomTabNavigator}
      />
      <Stack.Screen
        name="Piyasa"
        component={MarketsScreen}
      />
      <Stack.Screen
        name="Alarmlar"
        component={AlarmsScreen}
      />
      <Stack.Screen
        name="Favorilerim"
        component={FavoritesScreen}
      />
      <Stack.Screen
        name="Hakkimizda"
        component={AboutScreen}
      />
      <Stack.Screen
        name="Iletisim"
        component={ContactScreen}
      />
      <Stack.Screen
        name="Bildirimler"
        component={NotificationsScreen}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
