import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

interface AnimationValues {
  pulseAnim: Animated.Value;
  waveAnim1: Animated.Value;
  waveAnim2: Animated.Value;
  waveAnim3: Animated.Value;
}

export const useAnimations = (isListening: boolean): AnimationValues => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim1 = useRef(new Animated.Value(0.3)).current;
  const waveAnim2 = useRef(new Animated.Value(0.5)).current;
  const waveAnim3 = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    if (isListening) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      // Wave animations for listening
      const waveAnimations = [
        Animated.loop(
          Animated.sequence([
            Animated.timing(waveAnim1, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(waveAnim1, { toValue: 0.3, duration: 800, useNativeDriver: true }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(waveAnim2, { toValue: 1, duration: 1000, useNativeDriver: true }),
            Animated.timing(waveAnim2, { toValue: 0.5, duration: 1000, useNativeDriver: true }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(waveAnim3, { toValue: 1, duration: 1200, useNativeDriver: true }),
            Animated.timing(waveAnim3, { toValue: 0.7, duration: 1200, useNativeDriver: true }),
          ])
        ),
      ];

      waveAnimations.forEach(anim => anim.start());

      return () => {
        pulseAnimation.stop();
        waveAnimations.forEach(anim => anim.stop());
      };
    }
  }, [isListening, pulseAnim, waveAnim1, waveAnim2, waveAnim3]);

  return {
    pulseAnim,
    waveAnim1,
    waveAnim2,
    waveAnim3,
  };
};