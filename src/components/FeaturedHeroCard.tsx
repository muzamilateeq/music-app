import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Track } from '../types/music';
import { Colors } from '../constants/colors';
import { SoundwaveVisualizer } from './SoundwaveVisualizer';

interface FeaturedHeroCardProps {
  track: Track;
  isPlaying: boolean;
  isDownloaded: boolean;
  onPlayPress: () => void;
  onDownloadPress: () => void;
}

export const FeaturedHeroCard: React.FC<FeaturedHeroCardProps> = ({
  track,
  isPlaying,
  isDownloaded,
  onPlayPress,
  onDownloadPress,
}) => {
  return (
    <View style={styles.cardContainer}>
      {/* Background Artwork with Gradient Overlay */}
      <Image source={{ uri: track.artwork }} style={styles.bgImage} resizeMode="cover" blurRadius={18} />
      <View style={styles.darkGradientOverlay} />

      <View style={styles.content}>
        {/* Top Tag Row */}
        <View style={styles.topRow}>
          <View style={styles.featuredBadge}>
            <Ionicons name="flame" size={12} color="#FFF" style={{ marginRight: 4 }} />
            <Text style={styles.featuredText}>FEATURED HIT</Text>
          </View>

          <View style={styles.genreBadge}>
            <Text style={styles.genreText}>{track.genre}</Text>
          </View>
        </View>

        {/* Center Artwork & Metadata */}
        <View style={styles.trackDetailsRow}>
          <Image source={{ uri: track.artwork }} style={styles.thumbImage} resizeMode="cover" />

          <View style={styles.textWrap}>
            <Text style={styles.trackTitle} numberOfLines={2}>
              {track.title}
            </Text>
            <Text style={styles.artistName} numberOfLines={1}>
              {track.artist}
            </Text>
            <Text style={styles.albumName} numberOfLines={1}>
              {track.album}
            </Text>
          </View>
        </View>

        {/* Action Controls */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.playNowBtn}
            onPress={onPlayPress}
            activeOpacity={0.85}
          >
            {isPlaying ? (
              <SoundwaveVisualizer isPlaying={true} barColor="#FFF" size="small" />
            ) : (
              <Ionicons name="play" size={18} color="#FFF" style={{ marginRight: 6 }} />
            )}
            <Text style={styles.playNowText}>
              {isPlaying ? 'Now Playing' : 'Play Track'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.downloadIconBtn}
            onPress={onDownloadPress}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isDownloaded ? 'checkmark-circle' : 'arrow-down-circle-outline'}
              size={24}
              color={isDownloaded ? Colors.primary : '#FFF'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    height: 195,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  bgImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  darkGradientOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(11, 13, 19, 0.82)',
  },
  content: {
    padding: 16,
    justifyContent: 'space-between',
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  featuredText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  genreBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  genreText: {
    color: '#C4B5FD',
    fontSize: 10,
    fontWeight: '700',
  },
  trackDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  thumbImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  textWrap: {
    flex: 1,
    marginLeft: 14,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  artistName: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  albumName: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  playNowText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 6,
  },
  downloadIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
