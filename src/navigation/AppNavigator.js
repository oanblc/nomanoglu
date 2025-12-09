import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabNavigator from './BottomTabNavigator';
import AlarmsScreen from '../screens/AlarmsScreen';
import AboutScreen from '../screens/AboutScreen';
import ContactScreen from '../screens/ContactScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="MainTabs" 
        component={BottomTabNavigator}
      />
      <Stack.Screen 
        name="Alarms" 
        component={AlarmsScreen}
        options={{ headerShown: true, title: 'Alarmlar' }} 
      />
      <Stack.Screen 
        name="Hakkimizda" 
        component={AboutScreen}
      />
      <Stack.Screen 
        name="Iletisim" 
        component={ContactScreen}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
