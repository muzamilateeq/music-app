import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Track } from '../types/music';
import { Colors } from '../constants/colors';

interface TrackListItemProps {
  track: Track;
  isCurrent: boolean;
  isPlaying: boolean;
  isDownloaded: boolean;
  isDownloading: boolean;
  onPress: () => void;
  onDownload: () => void;
  onDeleteDownload?: () => void;
}

export const TrackListItem: React.FC<TrackListItemProps> = ({
  track,
  isCurrent,
  isPlaying,
  isDownloaded,
  isDownloading,
  onPress,
  onDownload,
  onDeleteDownload,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, isCurrent && styles.containerActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Artwork */}
      <View style={styles.artContainer}>
        <Image source={{ uri: track.artwork }} style={styles.artwork} resizeMode="cover" />
        {isCurrent && (
          <View style={styles.playingOverlay}>
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={18}
              color="#FFF"
            />
          </View>
        )}
      </View>

      {/* Track Details */}
      <View style={styles.infoContainer}>
        <Text
          style={[styles.title, isCurrent && styles.titleActive]}
          numberOfLines={1}
        >
          {track.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {track.artist} • <Text style={styles.album}>{track.album}</Text>
        </Text>
        <View style={styles.tagRow}>
          <Text style={styles.genreTag}>{track.genre}</Text>
          {track.releaseYear && <Text style={styles.yearTag}>{track.releaseYear}</Text>}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        {isDownloading ? (
          <ActivityIndicator size="small" color={Colors.primary} style={styles.iconBtn} />
        ) : isDownloaded ? (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onDeleteDownload || onDownload}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.downloadBtn}
            onPress={onDownload}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-down-circle-outline" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1E29',
  },
  containerActive: {
    backgroundColor: '#161B26',
  },
  artContainer: {
    width: 52,
    height: 52,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.card,
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  playingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  titleActive: {
    color: Colors.primary,
  },
  artist: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  album: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  genreTag: {
    fontSize: 10,
    color: Colors.accentViolet,
    fontWeight: '600',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  yearTag: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 4,
  },
  downloadBtn: {
    padding: 4,
  },
});
