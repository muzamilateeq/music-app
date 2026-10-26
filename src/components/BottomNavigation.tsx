import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { MusicTab } from '../types/music';

interface BottomNavigationProps {
  activeTab: MusicTab;
  onTabChange: (tab: MusicTab) => void;
  downloadCount: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  downloadCount,
}) => {
  const tabs: {
    key: MusicTab;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    activeIcon: keyof typeof Ionicons.glyphMap;
  }[] = [
    {
      key: 'discover',
      label: 'Explore',
      icon: 'compass-outline',
      activeIcon: 'compass',
    },
    {
      key: 'search',
      label: 'Search',
      icon: 'search-outline',
      activeIcon: 'search',
    },
    {
      key: 'downloads',
      label: 'Offline Library',
      icon: 'cloud-download-outline',
      activeIcon: 'cloud-download',
    },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabBtn, isActive && styles.tabBtnActive]}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.8}
          >
            <View style={styles.iconWrap}>
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={22}
                color={isActive ? Colors.primary : Colors.textMuted}
              />
              {tab.key === 'downloads' && downloadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{downloadCount > 99 ? '99+' : downloadCount}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.tabLabel, isActive ? styles.labelActive : styles.labelInactive]}>
              {tab.label}
            </Text>
            {isActive && <View style={styles.activeDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#0A0D15',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 8,
    paddingBottom: 22,
    paddingHorizontal: 8,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    borderRadius: 12,
  },
  tabBtnActive: {
    backgroundColor: 'rgba(0, 245, 155, 0.05)',
  },
  iconWrap: {
    position: 'relative',
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
  labelActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  labelInactive: {
    color: Colors.textMuted,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    marginTop: 3,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 4,
    height: 15,
    minWidth: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#07090E',
    fontSize: 9,
    fontWeight: 'bold',
  },
});
