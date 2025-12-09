import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BottomTabNavigator from './BottomTabNavigator';
import AlarmsScreen from '../screens/AlarmsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import { useWebSocket } from '../hooks/useWebSocket';

const Drawer = createDrawerNavigator();

const CustomHeader = ({ navigation, title }) => {
  const { isConnected } = useWebSocket();
  
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <View style={styles.headerLogoBorder}>
          <Text style={styles.headerTitle}>NOMANOĞLU</Text>
          <Text style={styles.headerSubtitle}>ALTIN</Text>
        </View>
      </View>
      <View style={styles.headerRight}>
        <View style={[styles.statusDot, { backgroundColor: isConnected ? '#10B981' : '#EF4444' }]} />
      </View>
    </View>
  );
};

const CustomDrawerContent = ({ navigation }) => {
  const menuItems = [
    { name: 'Ana Sayfa', icon: '🏠', screen: 'Home' },
    { name: 'Favorilerim', icon: '⭐', screen: 'Favorites' },
    { name: 'Alarmlarım', icon: '🔔', screen: 'Alarms' },
  ];

  return (
    <View style={styles.drawerContainer}>
      
      <View style={styles.drawerContent}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.drawerItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.drawerItemIcon}>{item.icon}</Text>
            <Text style={styles.drawerItemText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.drawerFooter}>
        <Text style={styles.drawerFooterText}>v1.0.0</Text>
      </View>
    </View>
  );
};

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        header: ({ route }) => <CustomHeader navigation={navigation} title={route.name} />,
        drawerStyle: {
          backgroundColor: '#F9FAFB',
          width: 280,
        },
      })}
    >
      <Drawer.Screen 
        name="Home" 
        component={BottomTabNavigator}
        options={{ title: 'Ana Sayfa' }}
      />
      <Drawer.Screen 
        name="Favorites" 
        component={FavoritesScreen}
        options={{ title: 'Favorilerim' }}
      />
      <Drawer.Screen 
        name="Alarms" 
        component={AlarmsScreen}
        options={{ title: 'Alarmlarım' }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 24,
    color: '#D97706',
    fontWeight: 'bold',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerLogoBorder: {
    borderWidth: 2,
    borderColor: '#D97706',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(217, 119, 6, 0.05)',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D97706',
    letterSpacing: 1,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 9,
    fontWeight: '600',
    color: '#92400E',
    letterSpacing: 2,
    textAlign: 'center',
  },
  headerRight: {
    padding: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  drawerContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  drawerHeader: {
    backgroundColor: '#D97706',
    paddingVertical: 8,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 8,
    alignItems: 'center',
  },
  logoBorder: {
    borderWidth: 5,
    borderColor: '#FFFFFF',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    marginVertical: 4,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginTop: 0,
    marginBottom: 0,
  },
  drawerSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginTop: 2,
    marginBottom: 0,
  },
  drawerContent: {
    flex: 1,
    paddingTop: 16,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  drawerItemIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  drawerItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  drawerFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  drawerFooterText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default DrawerNavigator;

