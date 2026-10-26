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
      {/* Background Artwork with Blur Overlay */}
      <Image source={{ uri: track.artwork }} style={styles.bgImage} resizeMode="cover" blurRadius={25} />
      <View style={styles.darkGradientOverlay} />

      <View style={styles.content}>
        {/* Top Badges */}
        <View style={styles.topRow}>
          <View style={styles.featuredBadge}>
            <Ionicons name="flame" size={12} color="#FFF" style={{ marginRight: 4 }} />
            <Text style={styles.featuredText}>TRENDING #1</Text>
          </View>

          <View style={styles.qualityBadge}>
            <View style={styles.qualityDot} />
            <Text style={styles.qualityText}>Hi-Fi 320kbps</Text>
          </View>
        </View>

        {/* Center Artwork & Metadata */}
        <View style={styles.trackDetailsRow}>
          <View style={styles.thumbWrapper}>
            <Image source={{ uri: track.artwork }} style={styles.thumbImage} resizeMode="cover" />
            {isPlaying && (
              <View style={styles.playingBadge}>
                <SoundwaveVisualizer isPlaying={true} barColor="#FFF" size="small" />
              </View>
            )}
          </View>

          <View style={styles.textWrap}>
            <Text style={styles.trackTitle} numberOfLines={2}>
              {track.title}
            </Text>
            <Text style={styles.artistName} numberOfLines={1}>
              {track.artist}
            </Text>
            <Text style={styles.albumName} numberOfLines={1}>
              {track.album} • {track.genre}
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
              <SoundwaveVisualizer isPlaying={true} barColor="#07090E" size="small" />
            ) : (
              <Ionicons name="play" size={17} color="#07090E" style={{ marginRight: 6 }} />
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
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    height: 195,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 8,
  },
  bgImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  darkGradientOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(7, 9, 14, 0.82)',
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
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 10,
  },
  featuredText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 245, 155, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 155, 0.3)',
  },
  qualityDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primary,
    marginRight: 5,
  },
  qualityText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  trackDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  thumbWrapper: {
    width: 66,
    height: 66,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  playingBadge: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  albumName: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
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
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  playNowText: {
    color: '#07090E',
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 6,
  },
  downloadIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
