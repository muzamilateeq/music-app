import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export const ShimmerLoader: React.FC = () => {
  const shimmerAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 0.85,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0.3,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5, 6].map((key) => (
        <View key={key} style={styles.row}>
          {/* Skeleton Thumbnail */}
          <Animated.View style={[styles.skeletonThumb, { opacity: shimmerAnim }]} />

          {/* Skeleton Lines */}
          <View style={styles.linesCol}>
            <Animated.View
              style={[
                styles.skeletonLine,
                { width: key % 2 === 0 ? '75%' : '60%', opacity: shimmerAnim },
              ]}
            />
            <Animated.View
              style={[
                styles.skeletonLineShort,
                { width: key % 2 === 0 ? '45%' : '35%', opacity: shimmerAnim },
              ]}
            />
          </View>

          {/* Skeleton Action Icons */}
          <Animated.View style={[styles.skeletonIcon, { opacity: shimmerAnim }]} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  skeletonThumb: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#161B26',
  },
  linesCol: {
    flex: 1,
    marginLeft: 14,
    gap: 8,
  },
  skeletonLine: {
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1E2536',
  },
  skeletonLineShort: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#151A27',
  },
  skeletonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#151A27',
  },
});
