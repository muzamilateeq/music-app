import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Track } from '../types/music';
import { Colors } from '../constants/colors';
import { SoundwaveVisualizer } from './SoundwaveVisualizer';

interface QueueModalProps {
  visible: boolean;
  queue: Track[];
  currentTrackId?: string;
  isPlaying: boolean;
  onClose: () => void;
  onSelectTrack: (track: Track) => void;
}

export const QueueModal: React.FC<QueueModalProps> = ({
  visible,
  queue,
  currentTrackId,
  isPlaying,
  onClose,
  onSelectTrack,
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.circleBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.titleWrap}>
            <Text style={styles.title}>Now Playing Queue</Text>
            <Text style={styles.sub}>{queue.length} Tracks in Queue</Text>
          </View>

          <View style={{ width: 40 }} />
        </View>

        {/* Queue List */}
        <FlatList
          data={queue}
          keyExtractor={(item) => `q_${item.id}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => {
            const isCurrent = item.id === currentTrackId;
            return (
              <TouchableOpacity
                style={[styles.itemRow, isCurrent && styles.itemRowActive]}
                onPress={() => {
                  onSelectTrack(item);
                  onClose();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.indexNum}>{index + 1}</Text>
                <Image source={{ uri: item.artwork }} style={styles.art} />

                <View style={styles.meta}>
                  <Text style={[styles.songTitle, isCurrent && styles.songTitleActive]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.artistName} numberOfLines={1}>
                    {item.artist}
                  </Text>
                </View>

                {isCurrent && (
                  <View style={styles.visualizerWrap}>
                    <SoundwaveVisualizer isPlaying={isPlaying} barColor={Colors.primary} size="small" />
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F121C',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2333',
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E2333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWrap: {
    alignItems: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  sub: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  listContent: {
    paddingVertical: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#161B26',
  },
  itemRowActive: {
    backgroundColor: 'rgba(29, 185, 84, 0.08)',
  },
  indexNum: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    width: 24,
  },
  art: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#1E2333',
  },
  meta: {
    flex: 1,
    marginLeft: 12,
  },
  songTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  songTitleActive: {
    color: Colors.primary,
  },
  artistName: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  visualizerWrap: {
    marginLeft: 10,
  },
});
