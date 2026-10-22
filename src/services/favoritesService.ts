import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'soundwave_liked_track_ids';

export const favoritesService = {
  async getFavoriteIds(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(FAVORITES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async toggleFavorite(trackId: string): Promise<{ isLiked: boolean }> {
    try {
      const list = await this.getFavoriteIds();
      let updated: string[];
      let isLiked: boolean;

      if (list.includes(trackId)) {
        updated = list.filter((id) => id !== trackId);
        isLiked = false;
      } else {
        updated = [trackId, ...list];
        isLiked = true;
      }

      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return { isLiked };
    } catch {
      return { isLiked: false };
    }
  },

  async isFavorite(trackId: string): Promise<boolean> {
    const list = await this.getFavoriteIds();
    return list.includes(trackId);
  },
};
