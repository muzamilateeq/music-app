import { Track } from '../types/music';

const BASE_URL = 'https://itunes.apple.com/search';

export const musicApiService = {
  /**
   * Searches tracks by query (artist, song name, album)
   */
  async searchTracks(query: string, limit = 25): Promise<Track[]> {
    if (!query.trim()) return [];

    try {
      const url = `${BASE_URL}?term=${encodeURIComponent(query.trim())}&media=music&entity=song&limit=${limit}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data.results) return [];

      return data.results
        .filter((item: any) => item.previewUrl && item.trackName)
        .map(mapItunesToTrack);
    } catch (err) {
      console.log('Error searching tracks:', err);
      return [];
    }
  },

  /**
   * Fetches trending tracks by genre or keyword
   */
  async getTrendingTracks(category = 'Top Hits', limit = 20): Promise<Track[]> {
    const searchTerms: Record<string, string> = {
      'Top Hits': 'Top Hits 2026',
      'Lo-Fi': 'Lofi Chill Beats',
      'Punjabi': 'Top Punjabi Hits',
      'Bollywood': 'Arijit Singh Atif Aslam',
      'Hip-Hop': 'Drake Kendrick Lamar Hip Hop',
      'EDM': 'Electronic Dance Hits',
      'Pop': 'Taylor Swift Dua Lipa Pop',
      'Rock': 'Classic Rock Hits',
    };

    const term = searchTerms[category] || category;
    return this.searchTracks(term, limit);
  },
};

function mapItunesToTrack(item: any): Track {
  // Replace 100x100 thumbnail with high-resolution 600x600 artwork
  const highResArtwork = item.artworkUrl100
    ? item.artworkUrl100.replace('100x100bb', '600x600bb')
    : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80';

  const releaseYear = item.releaseDate ? item.releaseDate.substring(0, 4) : undefined;

  return {
    id: item.trackId ? item.trackId.toString() : `${Date.now()}_${Math.random()}`,
    title: item.trackName || 'Unknown Title',
    artist: item.artistName || 'Unknown Artist',
    album: item.collectionName || 'Single',
    artwork: highResArtwork,
    previewUrl: item.previewUrl,
    durationMs: item.trackTimeMillis || 30000,
    genre: item.primaryGenreName || 'Music',
    releaseYear,
  };
}
