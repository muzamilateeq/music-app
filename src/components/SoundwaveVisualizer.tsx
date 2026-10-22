import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '../constants/colors';

interface SoundwaveVisualizerProps {
  isPlaying: boolean;
  barColor?: string;
  size?: 'small' | 'large';
}

export const SoundwaveVisualizer: React.FC<SoundwaveVisualizerProps> = ({
  isPlaying,
  barColor = Colors.primary,
  size = 'small',
}) => {
  const isLarge = size === 'large';
  const maxHeight = isLarge ? 36 : 18;
  const barWidth = isLarge ? 4 : 2.5;

  const anim1 = useRef(new Animated.Value(0.3)).current;
  const anim2 = useRef(new Animated.Value(0.7)).current;
  const anim3 = useRef(new Animated.Value(0.5)).current;
  const anim4 = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (!isPlaying) {
      anim1.setValue(0.3);
      anim2.setValue(0.4);
      anim3.setValue(0.3);
      anim4.setValue(0.4);
      return;
    }

    const createPulse = (anim: Animated.Value, duration: number, toValue: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue,
            duration,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 0.2,
            duration,
            useNativeDriver: false,
          }),
        ])
      );
    };

    const loop1 = createPulse(anim1, 380, 1);
    const loop2 = createPulse(anim2, 450, 0.85);
    const loop3 = createPulse(anim3, 320, 0.95);
    const loop4 = createPulse(anim4, 520, 0.8);

    loop1.start();
    loop2.start();
    loop3.start();
    loop4.start();

    return () => {
      loop1.stop();
      loop2.stop();
      loop3.stop();
      loop4.stop();
    };
  }, [isPlaying]);

  return (
    <View style={[styles.container, { height: maxHeight }]}>
      {[anim1, anim2, anim3, anim4].map((anim, idx) => (
        <Animated.View
          key={idx}
          style={[
            styles.bar,
            {
              width: barWidth,
              backgroundColor: barColor,
              height: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [4, maxHeight],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2.5,
  },
  bar: {
    borderRadius: 2,
  },
});
