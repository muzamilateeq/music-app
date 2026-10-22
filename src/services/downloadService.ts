import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Track, DownloadedItem } from '../types/music';

const DOWNLOADS_KEY = 'soundwave_downloaded_tracks';

export const downloadService = {
  /**
   * Retrieves all downloaded offline tracks
   */
  async getDownloadedTracks(): Promise<DownloadedItem[]> {
    try {
      const data = await AsyncStorage.getItem(DOWNLOADS_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  /**
   * Checks if a track is already downloaded
   */
  async isTrackDownloaded(trackId: string): Promise<boolean> {
    const list = await this.getDownloadedTracks();
    return list.some((item) => item.id === trackId);
  },

  /**
   * Downloads a track for offline listening
   */
  async downloadTrack(track: Track): Promise<{ success: boolean; message: string; localPath?: string }> {
    try {
      const isAlready = await this.isTrackDownloaded(track.id);
      if (isAlready) {
        return { success: true, message: 'Track is already in your offline library!' };
      }

      // Ensure download directory exists
      const downloadDir = `${FileSystem.documentDirectory}soundwave_music/`;
      const dirInfo = await FileSystem.getInfoAsync(downloadDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
      }

      // Download audio file
      const targetAudioPath = `${downloadDir}track_${track.id}.m4a`;
      const downloadRes = await FileSystem.downloadAsync(track.previewUrl, targetAudioPath);

      if (downloadRes.status !== 200) {
        return { success: false, message: 'Failed to download audio stream.' };
      }

      // Cache artwork locally for offline viewing
      let localArtPath = track.artwork;
      try {
        const artTarget = `${downloadDir}art_${track.id}.jpg`;
        const artRes = await FileSystem.downloadAsync(track.artwork, artTarget);
        if (artRes.status === 200) {
          localArtPath = artRes.uri;
        }
      } catch {}

      const downloadedItem: DownloadedItem = {
        id: track.id,
        track: {
          ...track,
          isDownloaded: true,
          localUri: downloadRes.uri,
          artwork: localArtPath,
        },
        localPath: downloadRes.uri,
        downloadedAt: Date.now(),
      };

      const existing = await this.getDownloadedTracks();
      const updated = [downloadedItem, ...existing];
      await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(updated));

      return {
        success: true,
        message: `"${track.title}" downloaded for offline listening! 🎵`,
        localPath: downloadRes.uri,
      };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Download error occurred.' };
    }
  },

  /**
   * Deletes a downloaded track to free up storage
   */
  async deleteDownloadedTrack(trackId: string): Promise<boolean> {
    try {
      const list = await this.getDownloadedTracks();
      const itemToDelete = list.find((item) => item.id === trackId);

      if (itemToDelete) {
        // Remove local file
        const fileInfo = await FileSystem.getInfoAsync(itemToDelete.localPath);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(itemToDelete.localPath, { idempotent: true });
        }
      }

      const updated = list.filter((item) => item.id !== trackId);
      await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(updated));
      return true;
    } catch {
      return false;
    }
  },
};
