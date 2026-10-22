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
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from './src/constants/colors';
import { Track, MusicTab, DownloadedItem } from './src/types/music';
import { musicApiService } from './src/services/musicApiService';
import { downloadService } from './src/services/downloadService';
import { favoritesService } from './src/services/favoritesService';
import { Header } from './src/components/Header';
import { SearchBar } from './src/components/SearchBar';
import { GenreChips } from './src/components/GenreChips';
import { FeaturedHeroCard } from './src/components/FeaturedHeroCard';
import { TrackListItem } from './src/components/TrackListItem';
import { MiniPlayerBar } from './src/components/MiniPlayerBar';
import { FullPlayerModal } from './src/components/FullPlayerModal';
import { SleepTimerModal } from './src/components/SleepTimerModal';
import { QueueModal } from './src/components/QueueModal';
import { BottomNavigation } from './src/components/BottomNavigation';

export default function App() {
  const [currentTab, setCurrentTab] = useState<MusicTab>('discover');
  const [selectedGenre, setSelectedGenre] = useState('Top Hits');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [tracks, setTracks] = useState<Track[]>([]);
  const [downloadedItems, setDownloadedItems] = useState<DownloadedItem[]>([]);
  const [downloadingIds, setDownloadingIds] = useState<Record<string, boolean>>({});
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  
  // Modals
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const [showSleepTimer, setShowSleepTimer] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Audio Engine using official Expo SDK 57 expo-audio
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);

  // Load favorites & downloads on mount
  const loadInitialData = useCallback(async () => {
    const [downloads, favs] = await Promise.all([
      downloadService.getDownloadedTracks(),
      favoritesService.getFavoriteIds(),
    ]);
    setDownloadedItems(downloads);
    setFavoriteIds(favs);
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load content when tab or genre changes
  const loadContent = useCallback(async () => {
    setLoading(true);

    if (currentTab === 'discover') {
      const results = await musicApiService.getTrendingTracks(selectedGenre, 25);
      setTracks(results);
    } else if (currentTab === 'search') {
      if (searchQuery.trim().length > 0) {
        const results = await musicApiService.searchTracks(searchQuery, 30);
        setTracks(results);
      } else {
        const trending = await musicApiService.getTrendingTracks('Top Hits', 20);
        setTracks(trending);
      }
    } else if (currentTab === 'downloads') {
      const items = await downloadService.getDownloadedTracks();
      setDownloadedItems(items);
      setTracks(items.map((i) => i.track));
    }

    setLoading(false);
    setRefreshing(false);
  }, [currentTab, selectedGenre, searchQuery]);

  useEffect(() => {
    loadContent();
  }, [currentTab, selectedGenre, loadContent]);

  // Sleep Timer interval countdown
  useEffect(() => {
    if (sleepTimerMinutes === null || sleepTimerMinutes <= 0) return;

    const interval = setInterval(() => {
      setSleepTimerMinutes((prev) => {
        if (prev === null || prev <= 1) {
          player.pause();
          Alert.alert('Sleep Timer', 'Your sleep timer has finished. Playback paused.');
          return null;
        }
        return prev - 1;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [sleepTimerMinutes, player]);

  // Auto transition to next track
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

      // Check if local downloaded copy exists for instant zero-data playback
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

  const handleToggleFavorite = async (trackId: string) => {
    const res = await favoritesService.toggleFavorite(trackId);
    setFavoriteIds((prev) =>
      res.isLiked ? [trackId, ...prev] : prev.filter((id) => id !== trackId)
    );
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
      const updated = await downloadService.getDownloadedTracks();
      setDownloadedItems(updated);
      Alert.alert('Saved Offline! 💾', res.message);
    } else {
      Alert.alert('Notice', res.message);
    }
  };

  const handleDeleteDownload = (track: Track) => {
    Alert.alert(
      'Remove from Offline Library',
      `Delete "${track.title}" from your phone storage?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await downloadService.deleteDownloadedTrack(track.id);
            const updated = await downloadService.getDownloadedTracks();
            setDownloadedItems(updated);
            if (currentTab === 'downloads') {
              setTracks(updated.map((i) => i.track));
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

  const featuredTrack = currentTab === 'discover' && tracks.length > 0 ? tracks[0] : null;
  const listTracks = currentTab === 'discover' && tracks.length > 0 ? tracks.slice(1) : tracks;

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
            : 'Trending Music Feed'
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

      {/* Offline Storage Status Card in Downloads tab */}
      {currentTab === 'downloads' && (
        <View style={styles.offlineStatsCard}>
          <View style={styles.offlineStatsLeft}>
            <View style={styles.offlineIconBadge}>
              <Ionicons name="folder" size={20} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.offlineTitle}>
                {downloadedItems.length} {downloadedItems.length === 1 ? 'Track' : 'Tracks'} Saved
              </Text>
              <Text style={styles.offlineSub}>Playable anywhere without mobile data</Text>
            </View>
          </View>

          {downloadedItems.length > 0 && (
            <TouchableOpacity
              style={styles.playAllBtn}
              onPress={() => handlePlayTrack(downloadedItems[0].track)}
              activeOpacity={0.85}
            >
              <Ionicons name="play" size={14} color="#FFF" style={{ marginRight: 4 }} />
              <Text style={styles.playAllText}>Play All</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Main Track List with Hero Banner */}
      <View style={styles.listContainer}>
        {loading ? (
          <View style={styles.loaderCenter}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loaderText}>
              {currentTab === 'downloads' ? 'Loading offline library...' : 'Fetching music...'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={listTracks}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              featuredTrack ? (
                <FeaturedHeroCard
                  track={featuredTrack}
                  isPlaying={currentTrack?.id === featuredTrack.id && status.playing}
                  isDownloaded={isDownloaded(featuredTrack.id)}
                  onPlayPress={() => handlePlayTrack(featuredTrack)}
                  onDownloadPress={() => handleDownload(featuredTrack)}
                />
              ) : null
            }
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
                isFavorite={favoriteIds.includes(item.id)}
                onPress={() => handlePlayTrack(item)}
                onDownload={() => handleDownload(item)}
                onToggleFavorite={() => handleToggleFavorite(item.id)}
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
        isFavorite={currentTrack ? favoriteIds.includes(currentTrack.id) : false}
        sleepTimerMinutes={sleepTimerMinutes}
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
        onToggleFavorite={() => {
          if (currentTrack) handleToggleFavorite(currentTrack.id);
        }}
        onDownload={() => {
          if (currentTrack) handleDownload(currentTrack);
        }}
        onSeek={(seconds) => {
          player.seekTo(seconds);
        }}
        onOpenSleepTimer={() => setShowSleepTimer(true)}
        onOpenQueue={() => setShowQueue(true)}
      />

      {/* Sleep Timer Modal */}
      <SleepTimerModal
        visible={showSleepTimer}
        activeMinutes={sleepTimerMinutes}
        onClose={() => setShowSleepTimer(false)}
        onSetTimer={(mins) => setSleepTimerMinutes(mins)}
      />

      {/* Queue Modal */}
      <QueueModal
        visible={showQueue}
        queue={currentTab === 'downloads' ? downloadedItems.map((d) => d.track) : tracks}
        currentTrackId={currentTrack?.id}
        isPlaying={status.playing}
        onClose={() => setShowQueue(false)}
        onSelectTrack={(track) => handlePlayTrack(track)}
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
  offlineStatsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#151924',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#242B3D',
  },
  offlineStatsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offlineIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(29, 185, 84, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  offlineTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  offlineSub: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  playAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  playAllText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
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
