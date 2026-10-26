import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Track } from '../types/music';
import { Colors } from '../constants/colors';

interface MiniPlayerBarProps {
  track: Track;
  isPlaying: boolean;
  progressPercent: number; // 0 to 1
  onPlayPause: () => void;
  onNext: () => void;
  onRewind10?: () => void;
  onPress: () => void;
}

export const MiniPlayerBar: React.FC<MiniPlayerBarProps> = ({
  track,
  isPlaying,
  progressPercent,
  onPlayPause,
  onNext,
  onRewind10,
  onPress,
}) => {
  // Continuous spinning mini disc animation
  const miniSpinAnim = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isPlaying) {
      loopRef.current = Animated.loop(
        Animated.timing(miniSpinAnim, {
          toValue: 1,
          duration: 6000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      loopRef.current.start();
    } else {
      if (loopRef.current) loopRef.current.stop();
    }
    return () => {
      if (loopRef.current) loopRef.current.stop();
    };
  }, [isPlaying]);

  const spin = miniSpinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.92}>
        {/* Top Micro Progress Bar with Emerald Glow */}
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.min(Math.max(progressPercent * 100, 0), 100)}%` },
            ]}
          />
        </View>

        <View style={styles.contentRow}>
          {/* Animated Mini Vinyl Disc */}
          <View style={styles.artBox}>
            <Animated.View style={[styles.discAnimWrap, { transform: [{ rotate: spin }] }]}>
              <Image source={{ uri: track.artwork }} style={styles.artwork} resizeMode="cover" />
              <View style={styles.discGrooveRing} />
              <View style={styles.centerHole} />
            </Animated.View>
          </View>

          {/* Track Details */}
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {track.title}
            </Text>
            <View style={styles.artistRow}>
              <View style={[styles.liveDot, isPlaying && styles.liveDotActive]} />
              <Text style={styles.artist} numberOfLines={1}>
                {track.artist}
              </Text>
              <Text style={styles.qualityDot}>•</Text>
              <Text style={styles.qualityTag}>320k</Text>
            </View>
          </View>

          {/* Controls: Rewind 10s | Play/Pause | Next */}
          <View style={styles.controlsRow}>
            {onRewind10 && (
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={onRewind10}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <Ionicons name="reload" size={17} color={Colors.textSecondary} style={{ transform: [{ scaleX: -1 }] }} />
                <Text style={styles.stepBtnText}>10</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.playPauseBtn}
              onPress={onPlayPause}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.85}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={20}
                color="#07090E"
                style={{ marginLeft: isPlaying ? 0 : 2 }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipBtn}
              onPress={onNext}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <Ionicons name="play-skip-forward" size={19} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 10,
    paddingBottom: 6,
    backgroundColor: 'transparent',
  },
  container: {
    backgroundColor: '#121622',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  progressBarBg: {
    height: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  artBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#07090E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  discAnimWrap: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  artwork: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  discGrooveRing: {
    ...StyleSheet.absoluteFill,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  centerHole: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#07090E',
    borderWidth: 1,
    borderColor: '#94A3B8',
  },
  textContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  title: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.textMuted,
    marginRight: 5,
  },
  liveDotActive: {
    backgroundColor: Colors.primary,
  },
  artist: {
    color: Colors.textSecondary,
    fontSize: 11,
    maxWidth: 150,
  },
  qualityDot: {
    color: Colors.textMuted,
    fontSize: 10,
    marginHorizontal: 4,
  },
  qualityTag: {
    color: Colors.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  stepBtnText: {
    position: 'absolute',
    fontSize: 7,
    fontWeight: '800',
    color: Colors.primary,
    top: 6,
  },
  playPauseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  skipBtn: {
    padding: 6,
  },
});
