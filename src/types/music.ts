export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  artwork: string;
  previewUrl: string;
  durationMs: number;
  genre: string;
  releaseYear?: string;
  isDownloaded?: boolean;
  localUri?: string;
}

export type MusicTab = 'discover' | 'search' | 'downloads' | 'favorites';

export interface DownloadedItem {
  id: string;
  track: Track;
  localPath: string;
  downloadedAt: number;
}
