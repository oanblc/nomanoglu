import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar, Image, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { palette, gradient } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import Sidebar from '../components/Sidebar';

const NOTIFICATIONS_KEY = '@notifications';

const NotificationsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const sidebarRef = useRef(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadNotifications();
    // Sayfa her odaklandığında bildirimleri yenile
    if (navigation && navigation.addListener) {
      const unsubscribe = navigation.addListener('focus', loadNotifications);
      return unsubscribe;
    }
  }, [navigation]);

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // En yeniden eskiye sırala
        const sorted = parsed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotifications(sorted);
      }
    } catch (error) {
      console.log('Bildirimler yüklenemedi:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      const updated = notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      );
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
      setNotifications(updated);
    } catch (error) {
      console.log('Bildirim okundu işaretlenemedi:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const updated = notifications.filter(n => n.id !== id);
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
      setNotifications(updated);
    } catch (error) {
      console.log('Bildirim silinemedi:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]));
      setNotifications([]);
    } catch (error) {
      console.log('Bildirimler temizlenemedi:', error);
    }
  };

  const handleNotificationPress = (notification) => {
    // Önce okundu olarak işaretle
    markAsRead(notification.id);

    // Bildirim tipine göre yönlendir
    if (notification.type === 'alarm') {
      navigation.navigate('Alarmlar');
    }
    // Gelecekte başka bildirim tipleri eklenebilir
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dk önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;

    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'alarm':
        return { name: 'bell', color: '#F7DE00' };
      case 'price':
        return { name: 'chart-line', color: '#22C55E' };
      case 'info':
        return { name: 'info-circle', color: '#3B82F6' };
      default:
        return { name: 'bell', color: '#6B7280' };
    }
  };

  const openDrawer = () => {
    sidebarRef.current?.open();
  };

  const goToHome = () => {
    navigation.navigate('MainTabs', { screen: 'AnaSayfa' });
  };

  const openInstagram = () => {
    Linking.openURL('https://www.instagram.com/nomanoglukuyumcu/');
  };

  const openTikTok = () => {
    Linking.openURL('https://www.tiktok.com/@nomanoglukuyumcu');
  };

  const openWebsite = () => {
    Linking.openURL('https://www.nomanoglu.com.tr/');
  };

  const renderNotificationItem = ({ item }) => {
    const icon = getNotificationIcon(item.type);
    const isUnread = !item.read;

    return (
      <TouchableOpacity
        style={[styles.notificationCard, isUnread && styles.notificationCardUnread]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${icon.color}15` }]}>
          <FontAwesome5 name={icon.name} size={18} color={icon.color} />
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.notificationTitle, isUnread && styles.notificationTitleUnread]}>
              {item.title}
            </Text>
            {isUnread && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notificationBody} numberOfLines={2}>
            {item.body}
          </Text>
          <Text style={styles.notificationTime}>{formatDate(item.createdAt)}</Text>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteNotification(item.id)}
        >
          <FontAwesome5 name="times" size={14} color="#9CA3AF" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <FontAwesome5 name="bell-slash" size={60} color="#E5E7EB" />
      <Text style={styles.emptyTitle}>Bildirim yok</Text>
      <Text style={styles.emptyText}>
        Fiyat alarmları, duyurular ve önemli{'\n'}güncellemeler burada görünecek
      </Text>
    </View>
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={palette.headerGradientStart} />

      {/* Header */}
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.header, { paddingTop: insets.top > 0 ? insets.top : 40 }]}
      >
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconButton} onPress={openDrawer}>
            <Ionicons name="menu" size={28} color={palette.headerText} />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.headerLogoImage}
              resizeMode="contain"
            />
          </View>

          {notifications.length > 0 ? (
            <TouchableOpacity style={styles.iconButton} onPress={clearAllNotifications}>
              <FontAwesome5 name="trash-alt" size={20} color={palette.headerText} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 32 }} />
          )}
        </View>

      </LinearGradient>

      {/* Title Bar */}
      <View style={styles.titleBar}>
        <Text style={styles.screenTitle}>Bildirimler</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unreadCount} okunmamış</Text>
          </View>
        )}
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          notifications.length === 0 && styles.listContentEmpty
        ]}
      />

      {/* Bottom Tab Bar */}
      <View style={[styles.bottomTabBar, { paddingBottom: insets.bottom > 0 ? insets.bottom + 4 : 8 }]}>
        <TouchableOpacity style={styles.tabItem} onPress={goToHome}>
          <FontAwesome5 name="home" size={20} color={palette.navInactive} />
          <Text style={styles.tabLabel}>Ana Sayfa</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={openInstagram}>
          <FontAwesome5 name="instagram" size={20} color={palette.navInactive} />
          <Text style={styles.tabLabel}>Instagram</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={openTikTok}>
          <FontAwesome5 name="tiktok" size={20} color={palette.navInactive} />
          <Text style={styles.tabLabel}>TikTok</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={openWebsite}>
          <FontAwesome5 name="globe" size={20} color={palette.navInactive} />
          <Text style={styles.tabLabel}>Web Sitesi</Text>
        </TouchableOpacity>
      </View>

      {/* Sidebar Component */}
      <Sidebar ref={sidebarRef} navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.screenBackground,
  },
  header: {
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 0,
    minHeight: 10,
  },
  iconButton: {
    padding: 5,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: -60,
  },
  headerLogoImage: {
    width: 180,
    height: 180,
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  unreadBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
  },
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
    flex: 1,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  notificationCardUnread: {
    backgroundColor: '#FFFBEB',
    borderColor: 'rgba(247, 222, 0, 0.3)',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  notificationTitleUnread: {
    color: '#1A1A1A',
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F7DE00',
    marginLeft: 8,
  },
  notificationBody: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 6,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
    paddingVertical: 8,
  },
  tabLabel: {
    ...typography.navLabel,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    color: palette.navInactive,
  },
});

export default NotificationsScreen;
