import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Alert,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from './src/constants/colors';
import { Track, MusicTab, DownloadedItem } from './src/types/music';
import { musicApiService } from './src/services/musicApiService';
import { downloadService } from './src/services/downloadService';
import { Header } from './src/components/Header';
import { SearchBar } from './src/components/SearchBar';
import { GenreChips } from './src/components/GenreChips';
import { TrackListItem } from './src/components/TrackListItem';
import { MiniPlayerBar } from './src/components/MiniPlayerBar';
import { FullPlayerModal } from './src/components/FullPlayerModal';
import { BottomNavigation } from './src/components/BottomNavigation';

export default function App() {
  const [currentTab, setCurrentTab] = useState<MusicTab>('discover');
  const [selectedGenre, setSelectedGenre] = useState('Top Hits');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [tracks, setTracks] = useState<Track[]>([]);
  const [downloadedItems, setDownloadedItems] = useState<DownloadedItem[]>([]);
  const [downloadingIds, setDownloadingIds] = useState<Record<string, boolean>>({});
  
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Audio Engine using official Expo SDK 57 expo-audio
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);

  // Load downloaded tracks from offline storage
  const loadDownloadedTracks = useCallback(async () => {
    const items = await downloadService.getDownloadedTracks();
    setDownloadedItems(items);
    return items;
  }, []);

  // Load tracks based on tab and genre
  const loadContent = useCallback(async () => {
    setLoading(true);
    await loadDownloadedTracks();

    if (currentTab === 'discover') {
      const results = await musicApiService.getTrendingTracks(selectedGenre, 25);
      setTracks(results);
    } else if (currentTab === 'search') {
      if (searchQuery.trim().length > 0) {
        const results = await musicApiService.searchTracks(searchQuery, 30);
        setTracks(results);
      } else {
        const trending = await musicApiService.getTrendingTracks('Top Hits', 15);
        setTracks(trending);
      }
    } else if (currentTab === 'downloads') {
      const items = await loadDownloadedTracks();
      setTracks(items.map((i) => i.track));
    }

    setLoading(false);
    setRefreshing(false);
  }, [currentTab, selectedGenre, searchQuery, loadDownloadedTracks]);

  useEffect(() => {
    loadContent();
  }, [currentTab, selectedGenre, loadContent]);

  // Handle auto-advancing to next track when finished
  const currentTrackRef = useRef(currentTrack);
  currentTrackRef.current = currentTrack;
  const tracksRef = useRef(tracks);
  tracksRef.current = tracks;

  useEffect(() => {
    if (status.currentTime > 0 && status.duration > 0) {
      if (status.currentTime >= status.duration - 0.5) {
        if (!isLooping) {
          handleNextTrack();
        }
      }
    }
  }, [status.currentTime, status.duration, isLooping]);

  const handlePlayTrack = async (track: Track) => {
    try {
      if (currentTrack?.id === track.id) {
        if (status.playing) {
          player.pause();
        } else {
          player.play();
        }
        return;
      }

      // Check if local downloaded copy exists for instant zero-lag playback
      const downloaded = downloadedItems.find((d) => d.id === track.id);
      const audioSource = downloaded ? downloaded.localPath : track.previewUrl;

      setCurrentTrack(track);
      player.replace(audioSource);
      player.loop = isLooping;
      player.play();
    } catch (err) {
      console.log('Error playing audio track:', err);
    }
  };

  const handleNextTrack = () => {
    const currentList = currentTab === 'downloads' ? downloadedItems.map((d) => d.track) : tracks;
    if (currentList.length === 0) return;

    if (isShuffling) {
      const randomIndex = Math.floor(Math.random() * currentList.length);
      handlePlayTrack(currentList[randomIndex]);
      return;
    }

    const currentIndex = currentList.findIndex((t) => t.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % currentList.length;
    handlePlayTrack(currentList[nextIndex]);
  };

  const handlePrevTrack = () => {
    const currentList = currentTab === 'downloads' ? downloadedItems.map((d) => d.track) : tracks;
    if (currentList.length === 0) return;

    const currentIndex = currentList.findIndex((t) => t.id === currentTrack?.id);
    const prevIndex = currentIndex <= 0 ? currentList.length - 1 : currentIndex - 1;
    handlePlayTrack(currentList[prevIndex]);
  };

  const handleDownload = async (track: Track) => {
    setDownloadingIds((prev) => ({ ...prev, [track.id]: true }));
    const res = await downloadService.downloadTrack(track);
    setDownloadingIds((prev) => {
      const next = { ...prev };
      delete next[track.id];
      return next;
    });

    if (res.success) {
      await loadDownloadedTracks();
      Alert.alert('Downloaded! 💾', res.message);
    } else {
      Alert.alert('Notice', res.message);
    }
  };

  const handleDeleteDownload = (track: Track) => {
    Alert.alert(
      'Remove from Downloads',
      `Are you sure you want to delete "${track.title}" from your offline library?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await downloadService.deleteDownloadedTrack(track.id);
            await loadDownloadedTracks();
            if (currentTab === 'downloads') {
              setTracks((prev) => prev.filter((t) => t.id !== track.id));
            }
          },
        },
      ]
    );
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim().length > 0) {
      loadContent();
    }
  };

  const isDownloaded = (id: string) => downloadedItems.some((d) => d.id === id);

  const durationSec = status.duration > 0 ? status.duration : (currentTrack ? currentTrack.durationMs / 1000 : 30);
  const currentTimeSec = status.currentTime || 0;
  const progressRatio = durationSec > 0 ? currentTimeSec / durationSec : 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Top Header */}
      <Header
        title="SoundWave"
        subtitle={
          currentTab === 'downloads'
            ? 'Offline Music Library'
            : currentTab === 'search'
            ? 'Search & Discover'
            : 'Trending Music'
        }
        rightBadge={currentTab === 'downloads' ? 'OFFLINE' : undefined}
      />

      {/* Tab Specific Top Bars */}
      {currentTab === 'discover' && (
        <GenreChips selected={selectedGenre} onSelect={(genre) => setSelectedGenre(genre)} />
      )}

      {currentTab === 'search' && (
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmit={handleSearchSubmit}
          onClear={() => {
            setSearchQuery('');
            loadContent();
          }}
        />
      )}

      {/* Main Track List */}
      <View style={styles.listContainer}>
        {loading ? (
          <View style={styles.loaderCenter}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loaderText}>
              {currentTab === 'downloads' ? 'Loading offline tracks...' : 'Fetching music...'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={tracks}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  loadContent();
                }}
                tintColor={Colors.primary}
              />
            }
            renderItem={({ item }) => (
              <TrackListItem
                track={item}
                isCurrent={currentTrack?.id === item.id}
                isPlaying={currentTrack?.id === item.id && status.playing}
                isDownloaded={isDownloaded(item.id)}
                isDownloading={!!downloadingIds[item.id]}
                onPress={() => handlePlayTrack(item)}
                onDownload={() => handleDownload(item)}
                onDeleteDownload={
                  currentTab === 'downloads' ? () => handleDeleteDownload(item) : undefined
                }
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name={currentTab === 'downloads' ? 'cloud-offline-outline' : 'musical-note-outline'}
                  size={54}
                  color={Colors.textMuted}
                />
                <Text style={styles.emptyTitle}>
                  {currentTab === 'downloads'
                    ? 'No Downloaded Songs Yet'
                    : 'No Tracks Found'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {currentTab === 'downloads'
                    ? 'Tap the download arrow on any track in Explore or Search to save it for offline listening!'
                    : 'Try searching for an artist, song title, or change the genre category.'}
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* Persistent Mini Player Bar */}
      {currentTrack && (
        <MiniPlayerBar
          track={currentTrack}
          isPlaying={status.playing}
          progressPercent={progressRatio}
          onPlayPause={() => {
            if (status.playing) player.pause();
            else player.play();
          }}
          onNext={handleNextTrack}
          onPress={() => setShowFullPlayer(true)}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        downloadCount={downloadedItems.length}
      />

      {/* Fullscreen Player Modal */}
      <FullPlayerModal
        visible={showFullPlayer}
        track={currentTrack}
        isPlaying={status.playing}
        currentTimeSec={currentTimeSec}
        durationSec={durationSec}
        isLooping={isLooping}
        isShuffling={isShuffling}
        isDownloaded={currentTrack ? isDownloaded(currentTrack.id) : false}
        onClose={() => setShowFullPlayer(false)}
        onPlayPause={() => {
          if (status.playing) player.pause();
          else player.play();
        }}
        onNext={handleNextTrack}
        onPrev={handlePrevTrack}
        onToggleLoop={() => {
          const next = !isLooping;
          setIsLooping(next);
          player.loop = next;
        }}
        onToggleShuffle={() => setIsShuffling(!isShuffling)}
        onDownload={() => {
          if (currentTrack) handleDownload(currentTrack);
        }}
        onSeek={(seconds) => {
          player.seekTo(seconds);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loaderCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loaderText: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 14,
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
});
