import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import OpLogo from '../../assets/images/oplogo.svg';

const TypingAnimation: React.FC = () => {
  const dot1Anim = useRef(new Animated.Value(0.3)).current;
  const dot2Anim = useRef(new Animated.Value(0.3)).current;
  const dot3Anim = useRef(new Animated.Value(0.3)).current;
  const containerFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in the container
    Animated.timing(containerFadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Create looping animation for each dot
    const createDotAnimation = (dotAnim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dotAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const dot1Animation = createDotAnimation(dot1Anim, 0);
    const dot2Animation = createDotAnimation(dot2Anim, 200);
    const dot3Animation = createDotAnimation(dot3Anim, 400);

    // Start all animations
    dot1Animation.start();
    dot2Animation.start();
    dot3Animation.start();

    // Cleanup function
    return () => {
      dot1Animation.stop();
      dot2Animation.stop();
      dot3Animation.stop();
    };
  }, [dot1Anim, dot2Anim, dot3Anim, containerFadeAnim]);

  return (
    <Animated.View style={[styles.typingContainer, { opacity: containerFadeAnim }]}>
      <View style={styles.typingBubble}>
        <OpLogo width={24} height={24} />
        <View style={styles.typingDotsContainer}>
          <Animated.View style={[styles.typingDot, { opacity: dot1Anim }]} />
          <Animated.View style={[styles.typingDot, { opacity: dot2Anim }]} />
          <Animated.View style={[styles.typingDot, { opacity: dot3Anim }]} />
        </View>
      </View>
      <Text style={styles.typingText}>Obaa Panyin is typing...</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  typingContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginVertical: 10,
    marginHorizontal: 16,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C19D5D',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typingDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 2,
  },
  typingText: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic',
    marginTop: 4,
    marginLeft: 16,
  },
});

export default TypingAnimation;