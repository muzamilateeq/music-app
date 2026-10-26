import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '../constants/colors';

interface SoundwaveVisualizerProps {
  isPlaying: boolean;
  barColor?: string;
  size?: 'small' | 'medium' | 'large';
}

export const SoundwaveVisualizer: React.FC<SoundwaveVisualizerProps> = ({
  isPlaying,
  barColor = Colors.primary,
  size = 'small',
}) => {
  const isLarge = size === 'large';
  const isMedium = size === 'medium';
  
  const barCount = isLarge ? 16 : isMedium ? 8 : 4;
  const maxHeight = isLarge ? 32 : isMedium ? 22 : 16;
  const barWidth = isLarge ? 3 : isMedium ? 2.5 : 2.5;
  const gap = isLarge ? 3 : 2.5;

  // Staggered base rhythms for bars
  const durations = [
    340, 420, 290, 480, 360, 440, 310, 500,
    330, 410, 280, 470, 350, 430, 300, 490,
  ];

  const peakHeights = [
    0.9, 0.7, 1.0, 0.8, 0.95, 0.65, 0.85, 0.75,
    0.9, 0.7, 1.0, 0.8, 0.95, 0.65, 0.85, 0.75,
  ];

  const anims = useRef<Animated.Value[]>(
    Array.from({ length: 16 }, (_, i) => new Animated.Value(0.2 + (i % 3) * 0.1))
  ).current;

  useEffect(() => {
    if (!isPlaying) {
      anims.forEach((anim, i) => {
        anim.setValue(0.2 + (i % 2) * 0.1);
      });
      return;
    }

    const loops = anims.slice(0, barCount).map((anim, i) => {
      const duration = durations[i % durations.length];
      const peak = peakHeights[i % peakHeights.length];

      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: peak,
            duration,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 0.15,
            duration: duration * 0.9,
            useNativeDriver: false,
          }),
        ])
      );
    });

    loops.forEach((loop) => loop.start());

    return () => {
      loops.forEach((loop) => loop.stop());
    };
  }, [isPlaying, barCount]);

  const displayedAnims = anims.slice(0, barCount);

  return (
    <View style={[styles.container, { height: maxHeight, gap }]}>
      {displayedAnims.map((anim, idx) => {
        // Gradient color effect for studio visualizer
        let color = barColor;
        if (isLarge) {
          if (idx < 5) color = Colors.primary;
          else if (idx < 11) color = Colors.accentCyan;
          else color = Colors.accentViolet;
        }

        return (
          <Animated.View
            key={idx}
            style={[
              styles.bar,
              {
                width: barWidth,
                backgroundColor: color,
                height: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [3, maxHeight],
                }),
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  bar: {
    borderRadius: 3,
  },
});
