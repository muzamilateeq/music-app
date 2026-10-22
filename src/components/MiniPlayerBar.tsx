import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Track } from '../types/music';
import { Colors } from '../constants/colors';

interface MiniPlayerBarProps {
  track: Track;
  isPlaying: boolean;
  progressPercent: number; // 0 to 1
  onPlayPause: () => void;
  onNext: () => void;
  onPress: () => void;
}

export const MiniPlayerBar: React.FC<MiniPlayerBarProps> = ({
  track,
  isPlaying,
  progressPercent,
  onPlayPause,
  onNext,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.95}>
      {/* Top Thin Progress Line */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${Math.min(Math.max(progressPercent * 100, 0), 100)}%` }]} />
      </View>

      <View style={styles.contentRow}>
        <Image source={{ uri: track.artwork }} style={styles.artwork} resizeMode="cover" />

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {track.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {track.artist}
          </Text>
        </View>

        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={onPlayPause}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlBtn}
            onPress={onNext}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="play-skip-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#181C28',
    borderTopWidth: 1,
    borderTopColor: '#252B3B',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  progressBarBg: {
    height: 2.5,
    backgroundColor: '#262D3D',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  artwork: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#0F121C',
  },
  textContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  title: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  artist: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlBtn: {
    padding: 6,
  },
});
