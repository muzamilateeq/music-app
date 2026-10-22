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
  onClose: () => void;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleLoop: () => void;
  onToggleShuffle: () => void;
  onDownload: () => void;
  onSeek: (seconds: number) => void;
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
  onClose,
  onPlayPause,
  onNext,
  onPrev,
  onToggleLoop,
  onToggleShuffle,
  onDownload,
  onSeek,
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
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.circleBtn} onPress={onClose} activeOpacity={0.8}>
            <Ionicons name="chevron-down" size={26} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.topTitleWrap}>
            <Text style={styles.topHeader}>NOW PLAYING</Text>
            <Text style={styles.topSub} numberOfLines={1}>{track.album}</Text>
          </View>

          <TouchableOpacity style={styles.circleBtn} onPress={onDownload} activeOpacity={0.8}>
            <Ionicons
              name={isDownloaded ? 'checkmark-circle' : 'download-outline'}
              size={22}
              color={isDownloaded ? Colors.primary : '#FFF'}
            />
          </TouchableOpacity>
        </View>

        {/* Center Artwork */}
        <View style={styles.artSection}>
          <View style={styles.artShadowBox}>
            <Image source={{ uri: track.artwork }} style={styles.artwork} resizeMode="cover" />
          </View>
        </View>

        {/* Track Metadata */}
        <View style={styles.metaSection}>
          <View style={styles.titleCol}>
            <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
            <Text style={styles.trackArtist} numberOfLines={1}>{track.artist}</Text>
          </View>
          <View style={styles.genrePill}>
            <Text style={styles.genreText}>{track.genre}</Text>
          </View>
        </View>

        {/* Progress Bar & Timestamps */}
        <View style={styles.progressSection}>
          <TouchableOpacity
            style={styles.progressBarTrack}
            activeOpacity={1}
            onPress={(e) => {
              const touchX = e.nativeEvent.locationX;
              const barWidth = width - 40;
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
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.playerBg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E2333',
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
    paddingVertical: 10,
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
    marginBottom: 20,
  },
  titleCol: {
    flex: 1,
    marginRight: 10,
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
    fontWeight: '500',
  },
  genrePill: {
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  genreText: {
    color: Colors.accentViolet,
    fontSize: 11,
    fontWeight: '700',
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 28,
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
    paddingBottom: 34,
  },
  playPauseBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
