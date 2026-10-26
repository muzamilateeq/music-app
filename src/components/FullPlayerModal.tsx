import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
  Easing,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Track } from '../types/music';
import { Colors } from '../constants/colors';
import { SoundwaveVisualizer } from './SoundwaveVisualizer';

const { width, height } = Dimensions.get('window');
const VINYL_SIZE = Math.min(width * 0.72, 290);
const PROGRESS_BAR_WIDTH = width - 48;

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
  playbackRate?: number;
  onClose: () => void;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onForward10: () => void;
  onRewind10: () => void;
  onToggleLoop: () => void;
  onToggleShuffle: () => void;
  onToggleFavorite: () => void;
  onDownload: () => void;
  onSeek: (seconds: number) => void;
  onChangeSpeed?: (speed: number) => void;
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
  playbackRate = 1.0,
  onClose,
  onPlayPause,
  onNext,
  onPrev,
  onForward10,
  onRewind10,
  onToggleLoop,
  onToggleShuffle,
  onToggleFavorite,
  onDownload,
  onSeek,
  onChangeSpeed,
  onOpenSleepTimer,
  onOpenQueue,
}) => {
  if (!track) return null;

  // View mode: 'vinyl' (Turntable animation) vs 'card' (Framed cover art)
  const [displayMode, setDisplayMode] = useState<'vinyl' | 'card'>('vinyl');

  // Active scrub state
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubSec, setScrubSec] = useState(0);

  // Animations
  const spinAnim = useRef(new Animated.Value(0)).current;
  const needleAnim = useRef(new Animated.Value(0)).current; // 0 = lifted (-28deg), 1 = on record (0deg)
  const pulseAuraAnim = useRef(new Animated.Value(1)).current;
  const heartScaleAnim = useRef(new Animated.Value(1)).current;
  const spinLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  // Continuous spinning vinyl record animation
  useEffect(() => {
    if (isPlaying) {
      // Rotate vinyl record continuously
      spinLoopRef.current = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 9000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      spinLoopRef.current.start();

      // Swing tone arm needle onto the record
      Animated.spring(needleAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }).start();

      // Pulsing ambient aura
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAuraAnim, {
            toValue: 1.15,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAuraAnim, {
            toValue: 0.95,
            duration: 1800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      if (spinLoopRef.current) {
        spinLoopRef.current.stop();
      }
      // Lift tone arm needle off the record
      Animated.spring(needleAnim, {
        toValue: 0,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }).start();

      Animated.timing(pulseAuraAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      if (spinLoopRef.current) spinLoopRef.current.stop();
    };
  }, [isPlaying]);

  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const needleInterpolate = needleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-26deg', '3deg'],
  });

  const handleFavoritePress = () => {
    Animated.sequence([
      Animated.timing(heartScaleAnim, {
        toValue: 1.45,
        duration: 130,
        useNativeDriver: true,
      }),
      Animated.timing(heartScaleAnim, {
        toValue: 1,
        duration: 130,
        useNativeDriver: true,
      }),
    ]).start();
    onToggleFavorite();
  };

  const formatTime = (secs: number) => {
    const total = Math.max(0, Math.floor(secs));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const safeDuration = durationSec > 0 ? durationSec : (track.durationMs ? track.durationMs / 1000 : 180);
  const activeTimeSec = isScrubbing ? scrubSec : currentTimeSec;
  const progressPercent = Math.min(Math.max(activeTimeSec / safeDuration, 0), 1);

  // PanResponder for smooth finger drag-to-seek scrubbing
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        setIsScrubbing(true);
        const touchX = Math.max(0, Math.min(evt.nativeEvent.locationX, PROGRESS_BAR_WIDTH));
        const ratio = touchX / PROGRESS_BAR_WIDTH;
        setScrubSec(ratio * safeDuration);
      },
      onPanResponderMove: (evt) => {
        const touchX = Math.max(0, Math.min(evt.nativeEvent.locationX, PROGRESS_BAR_WIDTH));
        const ratio = touchX / PROGRESS_BAR_WIDTH;
        setScrubSec(ratio * safeDuration);
      },
      onPanResponderRelease: (evt) => {
        const touchX = Math.max(0, Math.min(evt.nativeEvent.locationX, PROGRESS_BAR_WIDTH));
        const ratio = touchX / PROGRESS_BAR_WIDTH;
        const targetSec = ratio * safeDuration;
        setIsScrubbing(false);
        onSeek(targetSec);
      },
      onPanResponderTerminate: () => {
        setIsScrubbing(false);
      },
    })
  ).current;

  const handleCycleSpeed = () => {
    if (!onChangeSpeed) return;
    const speeds = [1.0, 1.25, 1.5, 0.8];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    onChangeSpeed(nextSpeed);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Top Header Navigation */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.circleBtn} onPress={onClose} activeOpacity={0.8}>
            <Ionicons name="chevron-down" size={24} color="#FFF" />
          </TouchableOpacity>

          {/* Mode Switcher Pill (Vinyl vs Card) */}
          <View style={styles.modeTogglePill}>
            <TouchableOpacity
              style={[styles.modeBtn, displayMode === 'vinyl' && styles.modeBtnActive]}
              onPress={() => setDisplayMode('vinyl')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="disc"
                size={14}
                color={displayMode === 'vinyl' ? '#07090E' : Colors.textSecondary}
              />
              <Text style={[styles.modeBtnText, displayMode === 'vinyl' && styles.modeBtnTextActive]}>
                Vinyl
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeBtn, displayMode === 'card' && styles.modeBtnActive]}
              onPress={() => setDisplayMode('card')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="image"
                size={14}
                color={displayMode === 'card' ? '#07090E' : Colors.textSecondary}
              />
              <Text style={[styles.modeBtnText, displayMode === 'card' && styles.modeBtnTextActive]}>
                Cover
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.circleBtn} onPress={onOpenQueue} activeOpacity={0.8}>
            <Ionicons name="list" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Center Presentation Stage: Spinning Vinyl Turntable OR Framed Cover */}
        <View style={styles.centerStage}>
          {/* Ambient Glowing Beat Aura */}
          <Animated.View
            style={[
              styles.ambientAuraRing,
              { transform: [{ scale: pulseAuraAnim }] },
            ]}
          />
          <View style={styles.ambientAuraInner} />

          {displayMode === 'vinyl' ? (
            /* VINYL TURNTABLE ANIMATION */
            <View style={styles.turntableWrapper}>
              {/* Spinning Vinyl Record Disc */}
              <Animated.View
                style={[
                  styles.vinylDisc,
                  { transform: [{ rotate: spinInterpolate }] },
                ]}
              >
                {/* Concentric Vinyl Grooves */}
                <View style={styles.grooveOuter} />
                <View style={styles.grooveMid} />
                <View style={styles.grooveInner} />

                {/* Center Record Label Artwork */}
                <View style={styles.centerLabel}>
                  <Image source={{ uri: track.artwork }} style={styles.labelArtwork} resizeMode="cover" />
                  {/* Spindle Hole */}
                  <View style={styles.spindleHole}>
                    <View style={styles.spindleCore} />
                  </View>
                </View>
              </Animated.View>

              {/* Tonearm / Turntable Needle */}
              <Animated.View
                style={[
                  styles.toneArmPivot,
                  { transform: [{ rotate: needleInterpolate }] },
                ]}
              >
                <View style={styles.toneArmBase} />
                <View style={styles.toneArmRod} />
                <View style={styles.toneArmHead} />
              </Animated.View>
            </View>
          ) : (
            /* FRAMED ARTWORK CARD MODE */
            <Animated.View
              style={[
                styles.artShadowBox,
                { transform: [{ scale: pulseAuraAnim }] },
              ]}
            >
              <Image source={{ uri: track.artwork }} style={styles.artwork} resizeMode="cover" />
              <View style={styles.artworkGlassRing} />
            </Animated.View>
          )}
        </View>

        {/* Track Metadata & Quick Actions */}
        <View style={styles.metaSection}>
          <View style={styles.titleCol}>
            <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
            <View style={styles.artistRow}>
              <Text style={styles.trackArtist} numberOfLines={1}>{track.artist}</Text>
              <Text style={styles.artistDot}>•</Text>
              <Text style={styles.genreTag}>{track.genre}</Text>
            </View>
          </View>

          <View style={styles.metaActions}>
            <TouchableOpacity
              style={styles.metaIconBtn}
              onPress={handleFavoritePress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: heartScaleAnim }] }}>
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={28}
                  color={isFavorite ? '#EF4444' : '#FFF'}
                />
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.metaIconBtn}
              onPress={onDownload}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isDownloaded ? 'checkmark-circle' : 'arrow-down-circle-outline'}
                size={28}
                color={isDownloaded ? Colors.primary : '#FFF'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Dynamic Studio 20-bar Equalizer Visualizer */}
        <View style={styles.visualizerRow}>
          <SoundwaveVisualizer isPlaying={isPlaying} barColor={Colors.primary} size="large" />
        </View>

        {/* Interactive Scrubbing Slider with Live Floating Tooltip */}
        <View style={styles.progressSection}>
          {isScrubbing && (
            <View style={[styles.scrubTooltip, { left: `${Math.max(2, Math.min(progressPercent * 100 - 8, 86))}%` }]}>
              <Text style={styles.scrubTooltipText}>{formatTime(scrubSec)}</Text>
            </View>
          )}

          <View style={styles.progressBarTrack} {...panResponder.panHandlers}>
            <View style={[styles.progressFill, { width: `${progressPercent * 100}%` }]} />
            <View
              style={[
                styles.thumbKnob,
                { left: `${progressPercent * 100}%` },
                isScrubbing && styles.thumbKnobActive,
              ]}
            />
          </View>

          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(activeTimeSec)}</Text>
            <View style={styles.progressCenterBadge}>
              <View style={[styles.pulseMiniDot, isPlaying && styles.pulseMiniDotLive]} />
              <Text style={styles.timeTextMuted}>-{formatTime(safeDuration - activeTimeSec)}</Text>
            </View>
            <Text style={styles.timeText}>{formatTime(safeDuration)}</Text>
          </View>
        </View>

        {/* Quick Jump Buttons (-15s, Start, +15s, +30s) */}
        <View style={styles.quickJumpRow}>
          <TouchableOpacity
            style={styles.quickJumpPill}
            onPress={() => onSeek(Math.max(0, currentTimeSec - 15))}
            activeOpacity={0.75}
          >
            <Ionicons name="play-back" size={11} color={Colors.textSecondary} />
            <Text style={styles.quickJumpText}>-15s</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickJumpPill}
            onPress={() => onSeek(0)}
            activeOpacity={0.75}
          >
            <Ionicons name="refresh" size={11} color={Colors.textSecondary} />
            <Text style={styles.quickJumpText}>Restart</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickJumpPill}
            onPress={() => onSeek(Math.min(safeDuration, currentTimeSec + 15))}
            activeOpacity={0.75}
          >
            <Ionicons name="play-forward" size={11} color={Colors.textSecondary} />
            <Text style={styles.quickJumpText}>+15s</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickJumpPill}
            onPress={() => onSeek(Math.min(safeDuration, currentTimeSec + 30))}
            activeOpacity={0.75}
          >
            <Ionicons name="play-forward" size={11} color={Colors.textSecondary} />
            <Text style={styles.quickJumpText}>+30s</Text>
          </TouchableOpacity>
        </View>

        {/* Controls: Shuffle | Prev | Rewind 10s | PLAY/PAUSE | Forward 10s | Next | Loop */}
        <View style={styles.controlsSection}>
          <TouchableOpacity
            onPress={onToggleShuffle}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.auxControlBtn}
          >
            <Ionicons
              name="shuffle"
              size={22}
              color={isShuffling ? Colors.primary : Colors.textMuted}
            />
            {isShuffling && <View style={styles.activeDot} />}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onPrev}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.skipBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="play-skip-back" size={26} color="#FFF" />
          </TouchableOpacity>

          {/* Rewind 10s Jump Button */}
          <TouchableOpacity
            onPress={onRewind10}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.stepBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="reload" size={23} color="#FFF" style={{ transform: [{ scaleX: -1 }] }} />
            <Text style={styles.stepBtnBadge}>10</Text>
          </TouchableOpacity>

          {/* Center Play/Pause with Radiant Emerald Shadow */}
          <TouchableOpacity style={styles.playPauseGlowWrapper} onPress={onPlayPause} activeOpacity={0.88}>
            <View style={styles.playPauseBtn}>
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={34}
                color="#07090E"
                style={{ marginLeft: isPlaying ? 0 : 3 }}
              />
            </View>
          </TouchableOpacity>

          {/* Forward 10s Jump Button */}
          <TouchableOpacity
            onPress={onForward10}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.stepBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="reload" size={23} color="#FFF" />
            <Text style={styles.stepBtnBadge}>10</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onNext}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.skipBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="play-skip-forward" size={26} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onToggleLoop}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.auxControlBtn}
          >
            <Ionicons
              name="repeat"
              size={22}
              color={isLooping ? Colors.primary : Colors.textMuted}
            />
            {isLooping && <View style={styles.activeDot} />}
          </TouchableOpacity>
        </View>

        {/* Bottom Utility Bar (Speed Toggle, Sleep Timer, Hi-Fi 320kbps Badge) */}
        <View style={styles.utilityBar}>
          <TouchableOpacity
            style={[styles.utilityPill, playbackRate !== 1.0 && styles.utilityPillActive]}
            onPress={handleCycleSpeed}
            activeOpacity={0.75}
          >
            <Ionicons
              name="speedometer-outline"
              size={13}
              color={playbackRate !== 1.0 ? '#FFF' : Colors.textSecondary}
              style={{ marginRight: 5 }}
            />
            <Text style={[styles.utilityText, playbackRate !== 1.0 && styles.utilityTextActive]}>
              {playbackRate}x Speed
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.utilityPill, sleepTimerMinutes !== null && styles.utilityPillActive]}
            onPress={onOpenSleepTimer}
            activeOpacity={0.75}
          >
            <Ionicons
              name="moon"
              size={13}
              color={sleepTimerMinutes !== null ? '#FFF' : Colors.textSecondary}
              style={{ marginRight: 5 }}
            />
            <Text style={[styles.utilityText, sleepTimerMinutes !== null && styles.utilityTextActive]}>
              {sleepTimerMinutes !== null ? `${sleepTimerMinutes}m Left` : 'Sleep Timer'}
            </Text>
          </TouchableOpacity>

          <View style={styles.qualityPill}>
            <View style={styles.qualityDot} />
            <Text style={styles.qualityText}>Hi-Fi 320kbps</Text>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.playerBg,
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  modeTogglePill: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
  },
  modeBtnActive: {
    backgroundColor: Colors.primary,
  },
  modeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  modeBtnTextActive: {
    color: '#07090E',
    fontWeight: '800',
  },
  centerStage: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: VINYL_SIZE + 24,
    marginVertical: 4,
  },
  ambientAuraRing: {
    position: 'absolute',
    width: VINYL_SIZE * 0.95,
    height: VINYL_SIZE * 0.95,
    borderRadius: (VINYL_SIZE * 0.95) / 2,
    backgroundColor: 'rgba(0, 245, 155, 0.22)',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 36,
  },
  ambientAuraInner: {
    position: 'absolute',
    width: VINYL_SIZE * 0.75,
    height: VINYL_SIZE * 0.75,
    borderRadius: (VINYL_SIZE * 0.75) / 2,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  turntableWrapper: {
    width: VINYL_SIZE + 30,
    height: VINYL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  vinylDisc: {
    width: VINYL_SIZE,
    height: VINYL_SIZE,
    borderRadius: VINYL_SIZE / 2,
    backgroundColor: '#0A0C13',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1F2432',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.7,
    shadowRadius: 24,
    elevation: 18,
  },
  grooveOuter: {
    position: 'absolute',
    width: VINYL_SIZE * 0.92,
    height: VINYL_SIZE * 0.92,
    borderRadius: (VINYL_SIZE * 0.92) / 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  grooveMid: {
    position: 'absolute',
    width: VINYL_SIZE * 0.78,
    height: VINYL_SIZE * 0.78,
    borderRadius: (VINYL_SIZE * 0.78) / 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  grooveInner: {
    position: 'absolute',
    width: VINYL_SIZE * 0.64,
    height: VINYL_SIZE * 0.64,
    borderRadius: (VINYL_SIZE * 0.64) / 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  centerLabel: {
    width: VINYL_SIZE * 0.44,
    height: VINYL_SIZE * 0.44,
    borderRadius: (VINYL_SIZE * 0.44) / 2,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  labelArtwork: {
    width: '100%',
    height: '100%',
  },
  spindleHole: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#07090E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#475569',
  },
  spindleCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#94A3B8',
  },
  toneArmPivot: {
    position: 'absolute',
    top: -10,
    right: 2,
    width: 70,
    height: 140,
    transformOrigin: 'top right',
    alignItems: 'flex-end',
  },
  toneArmBase: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#334155',
    borderWidth: 2,
    borderColor: '#94A3B8',
  },
  toneArmRod: {
    width: 4,
    height: 100,
    backgroundColor: '#94A3B8',
    marginRight: 8,
    borderRadius: 2,
  },
  toneArmHead: {
    width: 14,
    height: 22,
    backgroundColor: Colors.primary,
    borderRadius: 4,
    marginRight: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  artShadowBox: {
    width: VINYL_SIZE,
    height: VINYL_SIZE,
    borderRadius: 26,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.45,
    shadowRadius: 28,
    elevation: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  artworkGlassRing: {
    ...StyleSheet.absoluteFill,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  metaSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 6,
  },
  titleCol: {
    flex: 1,
    marginRight: 16,
  },
  trackTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.4,
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trackArtist: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    maxWidth: 180,
  },
  artistDot: {
    color: Colors.textMuted,
    marginHorizontal: 6,
    fontSize: 12,
  },
  genreTag: {
    fontSize: 11,
    color: Colors.accentViolet,
    fontWeight: '700',
  },
  metaActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  metaIconBtn: {
    padding: 6,
  },
  visualizerRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    height: 36,
  },
  progressSection: {
    paddingHorizontal: 24,
    position: 'relative',
  },
  scrubTooltip: {
    position: 'absolute',
    top: -28,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  scrubTooltipText: {
    color: '#07090E',
    fontSize: 11,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 3.5,
    position: 'relative',
    justifyContent: 'center',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3.5,
  },
  thumbKnob: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#FFF',
    marginLeft: -7.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  thumbKnobActive: {
    transform: [{ scale: 1.4 }],
    backgroundColor: Colors.primary,
    borderColor: '#FFF',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  progressCenterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pulseMiniDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textMuted,
  },
  pulseMiniDotLive: {
    backgroundColor: Colors.primary,
  },
  timeTextMuted: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  quickJumpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  quickJumpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 4,
  },
  quickJumpText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  controlsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 8,
  },
  auxControlBtn: {
    padding: 8,
    position: 'relative',
    alignItems: 'center',
  },
  activeDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  skipBtn: {
    padding: 8,
  },
  stepBtn: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
  },
  stepBtnBadge: {
    position: 'absolute',
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
    top: 10,
  },
  playPauseGlowWrapper: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 12,
  },
  playPauseBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  utilityBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  utilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  utilityPillActive: {
    backgroundColor: 'rgba(0, 245, 155, 0.18)',
    borderColor: Colors.primary,
  },
  utilityText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  utilityTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  qualityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 245, 155, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 155, 0.25)',
  },
  qualityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: 6,
  },
  qualityText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
