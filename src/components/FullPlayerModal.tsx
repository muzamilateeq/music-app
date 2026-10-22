import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Track } from '../types/music';
import { Colors } from '../constants/colors';
import { SoundwaveVisualizer } from './SoundwaveVisualizer';

const { width } = Dimensions.get('window');
const ARTWORK_SIZE = width * 0.76;

interface FullPlayerModalProps {
  visible: boolean;
  track: Track | null;
  isPlaying: boolean;
  currentTimeSec: number;
  durationSec: number;
  isLooping: boolean;
  isShuffling: boolean;
  isDownloaded: boolean;
  isFavorite: boolean;
  sleepTimerMinutes: number | null;
  onClose: () => void;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleLoop: () => void;
  onToggleShuffle: () => void;
  onToggleFavorite: () => void;
  onDownload: () => void;
  onSeek: (seconds: number) => void;
  onOpenSleepTimer: () => void;
  onOpenQueue: () => void;
}

export const FullPlayerModal: React.FC<FullPlayerModalProps> = ({
  visible,
  track,
  isPlaying,
  currentTimeSec,
  durationSec,
  isLooping,
  isShuffling,
  isDownloaded,
  isFavorite,
  sleepTimerMinutes,
  onClose,
  onPlayPause,
  onNext,
  onPrev,
  onToggleLoop,
  onToggleShuffle,
  onToggleFavorite,
  onDownload,
  onSeek,
  onOpenSleepTimer,
  onOpenQueue,
}) => {
  if (!track) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const safeDuration = durationSec > 0 ? durationSec : 30;
  const progressPercent = Math.min(Math.max(currentTimeSec / safeDuration, 0), 1);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.circleBtn} onPress={onClose} activeOpacity={0.8}>
            <Ionicons name="chevron-down" size={26} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.topTitleWrap}>
            <Text style={styles.topHeader}>NOW PLAYING</Text>
            <Text style={styles.topSub} numberOfLines={1}>{track.album}</Text>
          </View>

          <TouchableOpacity style={styles.circleBtn} onPress={onOpenQueue} activeOpacity={0.8}>
            <Ionicons name="list" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Center Artwork with Glow */}
        <View style={styles.artSection}>
          <View style={styles.artShadowBox}>
            <Image source={{ uri: track.artwork }} style={styles.artwork} resizeMode="cover" />
          </View>
        </View>

        {/* Track Metadata & Favorite */}
        <View style={styles.metaSection}>
          <View style={styles.titleCol}>
            <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
            <Text style={styles.trackArtist} numberOfLines={1}>{track.artist}</Text>
          </View>

          <View style={styles.metaActions}>
            <TouchableOpacity
              style={styles.metaIconBtn}
              onPress={onToggleFavorite}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={26}
                color={isFavorite ? '#EF4444' : '#FFF'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.metaIconBtn}
              onPress={onDownload}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={isDownloaded ? 'checkmark-circle' : 'arrow-down-circle-outline'}
                size={26}
                color={isDownloaded ? Colors.primary : '#FFF'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Soundwave Visualizer in player */}
        <View style={styles.visualizerRow}>
          <SoundwaveVisualizer isPlaying={isPlaying} barColor={Colors.primary} size="large" />
        </View>

        {/* Progress Bar & Timestamps */}
        <View style={styles.progressSection}>
          <TouchableOpacity
            style={styles.progressBarTrack}
            activeOpacity={1}
            onPress={(e) => {
              const touchX = e.nativeEvent.locationX;
              const barWidth = width - 48;
              const ratio = Math.max(0, Math.min(touchX / barWidth, 1));
              onSeek(ratio * safeDuration);
            }}
          >
            <View style={[styles.progressFill, { width: `${progressPercent * 100}%` }]} />
            <View style={[styles.thumbKnob, { left: `${progressPercent * 100}%` }]} />
          </TouchableOpacity>

          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(currentTimeSec)}</Text>
            <Text style={styles.timeText}>{formatTime(safeDuration)}</Text>
          </View>
        </View>

        {/* Player Controls */}
        <View style={styles.controlsSection}>
          <TouchableOpacity onPress={onToggleShuffle} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons
              name="shuffle"
              size={22}
              color={isShuffling ? Colors.primary : Colors.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={onPrev} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="play-skip-back" size={30} color="#FFF" />
          </TouchableOpacity>

          {/* Giant Center Play/Pause button */}
          <TouchableOpacity style={styles.playPauseBtn} onPress={onPlayPause} activeOpacity={0.85}>
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity onPress={onNext} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="play-skip-forward" size={30} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity onPress={onToggleLoop} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons
              name="repeat"
              size={22}
              color={isLooping ? Colors.primary : Colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Extra Bottom Utilities (Sleep Timer + Audio Mode) */}
        <View style={styles.utilityBar}>
          <TouchableOpacity
            style={[styles.utilityPill, sleepTimerMinutes !== null && styles.utilityPillActive]}
            onPress={onOpenSleepTimer}
            activeOpacity={0.8}
          >
            <Ionicons
              name="moon"
              size={14}
              color={sleepTimerMinutes !== null ? '#FFF' : Colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.utilityText, sleepTimerMinutes !== null && styles.utilityTextActive]}>
              {sleepTimerMinutes !== null ? `Sleep: ${sleepTimerMinutes}m` : 'Sleep Timer'}
            </Text>
          </TouchableOpacity>

          <View style={styles.qualityPill}>
            <Ionicons name="volume-high" size={13} color={Colors.primary} style={{ marginRight: 4 }} />
            <Text style={styles.qualityText}>Lossless 256kbps</Text>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0C13',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#181C28',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topTitleWrap: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  topHeader: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  topSub: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  artSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
  },
  artShadowBox: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.28,
    shadowRadius: 28,
    elevation: 12,
    backgroundColor: '#181C28',
  },
  artwork: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  metaSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  titleCol: {
    flex: 1,
    marginRight: 12,
  },
  trackTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  trackArtist: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
    fontWeight: '600',
  },
  metaActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaIconBtn: {
    padding: 4,
  },
  visualizerRow: {
    alignItems: 'center',
    marginVertical: 6,
  },
  progressSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#262D3D',
    borderRadius: 3,
    position: 'relative',
    justifyContent: 'center',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  thumbKnob: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFF',
    marginLeft: -7,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  controlsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    marginBottom: 16,
  },
  playPauseBtn: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  utilityBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  utilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181C28',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#232838',
  },
  utilityPillActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderColor: Colors.accentViolet,
  },
  utilityText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  utilityTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  qualityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141E1C',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(29, 185, 84, 0.3)',
  },
  qualityText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '700',
  },
});
