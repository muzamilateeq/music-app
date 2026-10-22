import React from 'react';
import { ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';

const GENRES = [
  'Top Hits',
  'Lo-Fi',
  'Punjabi',
  'Bollywood',
  'Hip-Hop',
  'Pop',
  'EDM',
  'Rock',
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
        const isSelected = selected === genre;
        return (
          <TouchableOpacity
            key={genre}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => onSelect(genre)}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {genre}
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
