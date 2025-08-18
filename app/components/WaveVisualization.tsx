import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface WaveVisualizationProps {
  isListening: boolean;
  waveAnim1: Animated.Value;
  waveAnim2: Animated.Value;
  waveAnim3: Animated.Value;
}

const WaveVisualization: React.FC<WaveVisualizationProps> = ({
  isListening,
  waveAnim1,
  waveAnim2,
  waveAnim3,
}) => {
  return (
    <View style={styles.waveVisualization}>
      <Animated.View 
        style={[
          styles.staticWave, 
          styles.staticWave1, 
          isListening && { opacity: waveAnim1 }
        ]} 
      />
      <Animated.View 
        style={[
          styles.staticWave, 
          styles.staticWave2, 
          isListening && { opacity: waveAnim2 }
        ]} 
      />
      <Animated.View 
        style={[
          styles.staticWave, 
          styles.staticWave3, 
          isListening && { opacity: waveAnim3 }
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  waveVisualization: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
  },
  staticWave: {
    width: 4,
    backgroundColor: '#4A90E2',
    borderRadius: 2,
    marginHorizontal: 2,
  },
  staticWave1: {
    height: 16,
    opacity: 0.7,
  },
  staticWave2: {
    height: 24,
    opacity: 0.9,
  },
  staticWave3: {
    height: 18,
    opacity: 0.8,
  },
});

export default WaveVisualization;