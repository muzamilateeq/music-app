import React from 'react';
import { ScrollView, Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface GenreItem {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const GENRES: GenreItem[] = [
  { name: 'Top Hits', icon: 'flame' },
  { name: 'Lo-Fi', icon: 'cafe' },
  { name: 'Punjabi', icon: 'musical-notes' },
  { name: 'Bollywood', icon: 'film' },
  { name: 'Hip-Hop', icon: 'mic' },
  { name: 'Pop', icon: 'sparkles' },
  { name: 'EDM', icon: 'flash' },
  { name: 'Rock', icon: 'radio' },
];

interface GenreChipsProps {
  selected: string;
  onSelect: (genre: string) => void;
}

export const GenreChips: React.FC<GenreChipsProps> = ({ selected, onSelect }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollList}
    >
      {GENRES.map((genre) => {
        const isSelected = selected === genre.name;
        return (
          <TouchableOpacity
            key={genre.name}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => onSelect(genre.name)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={genre.icon}
              size={13}
              color={isSelected ? '#07090E' : Colors.textSecondary}
              style={{ marginRight: 5 }}
            />
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {genre.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#111520',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#07090E',
    fontWeight: '800',
  },
});
