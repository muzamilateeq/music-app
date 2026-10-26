import CryptoJS from 'crypto-js';
import { Track } from '../types/music';

const SAAVN_BASE_URL = 'https://www.jiosaavn.com/api.php';
const ITUNES_BASE_URL = 'https://itunes.apple.com/search';
const SAAVN_DES_KEY = '38346591';

export const musicApiService = {
  /**
   * Searches full-length tracks by query (artist, song name, album)
   * Primary: JioSaavn (provides 100% complete 320kbps songs)
   * Fallback: iTunes search
   */
  async searchTracks(query: string, limit = 25): Promise<Track[]> {
    if (!query.trim()) return [];

    try {
      // 1. Try JioSaavn for full-length songs
      const saavnUrl = `${SAAVN_BASE_URL}?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&q=${encodeURIComponent(
        query.trim()
      )}&n=${limit}&p=1`;

      const response = await fetch(saavnUrl);
      const data = await response.json();

      if (data && Array.isArray(data.results) && data.results.length > 0) {
        const fullTracks: Track[] = [];

        for (const item of data.results) {
          const track = mapSaavnToTrack(item);
          if (track) {
            fullTracks.push(track);
          }
        }

        if (fullTracks.length > 0) {
          return fullTracks;
        }
      }
    } catch (err) {
      console.log('Error searching JioSaavn, falling back to iTunes:', err);
    }

    // 2. Fallback to iTunes if JioSaavn returns no matches or fails
    return this.searchItunesTracks(query, limit);
  },

  /**
   * Fallback iTunes search
   */
  async searchItunesTracks(query: string, limit = 25): Promise<Track[]> {
    try {
      const url = `${ITUNES_BASE_URL}?term=${encodeURIComponent(
        query.trim()
      )}&media=music&entity=song&limit=${limit}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data.results) return [];

      return data.results
        .filter((item: any) => item.previewUrl && item.trackName)
        .map(mapItunesToTrack);
    } catch (err) {
      console.log('Error searching iTunes tracks:', err);
      return [];
    }
  },

  /**
   * Fetches trending full-length tracks by genre or keyword
   */
  async getTrendingTracks(category = 'Top Hits', limit = 20): Promise<Track[]> {
    const searchTerms: Record<string, string> = {
      'Top Hits': 'Top Hits',
      'Lo-Fi': 'Lofi Chill',
      'Punjabi': 'Punjabi Hits',
      'Bollywood': 'Bollywood Hits',
      'Hip-Hop': 'Hip Hop',
      'EDM': 'EDM Hits',
      'Pop': 'Pop Hits',
      'Rock': 'Rock Hits',
    };

    const term = searchTerms[category] || category;
    return this.searchTracks(term, limit);
  },
};

/**
 * Decodes HTML entities commonly returned by music databases
 */
function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

/**
 * Decrypts JioSaavn DES-ECB encrypted media stream URL into a direct 320kbps audio link
 */
function decryptSaavnMediaUrl(encryptedUrl: string): string {
  if (!encryptedUrl) return '';

  try {
    const key = CryptoJS.enc.Utf8.parse(SAAVN_DES_KEY);
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl),
    });
    const decrypted = CryptoJS.DES.decrypt(
      cipherParams,
      key,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    const rawUrl = decrypted.toString(CryptoJS.enc.Utf8);
    if (!rawUrl) return '';

    // Upgrade to 320kbps high quality audio stream
    return rawUrl.replace(/_[0-9]+\.mp4$/, '_320.mp4');
  } catch (err) {
    console.log('Error decrypting Saavn media url:', err);
    return '';
  }
}

/**
 * Maps JioSaavn result object to SoundWave Track model with full duration & HD artwork
 */
function mapSaavnToTrack(item: any): Track | null {
  const audioUrl = decryptSaavnMediaUrl(item.more_info?.encrypted_media_url);
  if (!audioUrl) return null;

  // Extract artist names cleanly
  let artistName = '';
  if (item.more_info?.artistMap?.primary_artists?.length > 0) {
    artistName = item.more_info.artistMap.primary_artists
      .map((a: any) => a.name)
      .join(', ');
  } else if (item.subtitle) {
    artistName = item.subtitle.split('-')[0].trim();
  } else {
    artistName = item.more_info?.music || 'Unknown Artist';
  }

  // Upgrade 150x150 thumbnail to 500x500 high-resolution artwork
  const artwork = item.image
    ? item.image.replace('150x150.jpg', '500x500.jpg')
    : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80';

  // Duration in seconds to milliseconds
  const durationSec = parseInt(item.more_info?.duration || '210', 10);
  const durationMs = durationSec > 0 ? durationSec * 1000 : 210000;

  return {
    id: item.id ? String(item.id) : `${Date.now()}_${Math.random()}`,
    title: decodeHtmlEntities(item.title || 'Unknown Title'),
    artist: decodeHtmlEntities(artistName),
    album: decodeHtmlEntities(item.more_info?.album || 'Single'),
    artwork,
    previewUrl: audioUrl, // Full-length 320kbps audio stream URL
    durationMs,
    genre: item.language
      ? item.language.charAt(0).toUpperCase() + item.language.slice(1)
      : 'Music',
    releaseYear: item.year || undefined,
  };
}

/**
 * Maps iTunes item to Track model (fallback)
 */
function mapItunesToTrack(item: any): Track {
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
