import React from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HelpIcon from '../../assets/images/help.svg';
import KeyboardIcon from '../../assets/images/keyboard.svg';
import WaveVisualization from './WaveVisualization';

interface ControlButtonsProps {
  showKeyboard: boolean;
  isListening: boolean;
  onKeyboardPress: () => void;
  onMicPress: () => void;
  onHelpPress?: () => void;
  waveAnim1: Animated.Value;
  waveAnim2: Animated.Value;
  waveAnim3: Animated.Value;
}

const ControlButtons: React.FC<ControlButtonsProps> = ({
  showKeyboard,
  isListening,
  onKeyboardPress,
  onMicPress,
  onHelpPress,
  waveAnim1,
  waveAnim2,
  waveAnim3,
}) => {
  return (
    <View style={styles.controlsContainer}>
      {/* Keyboard Button */}
      <TouchableOpacity 
        style={[styles.controlButton, showKeyboard && styles.controlButtonActive]}
        onPress={onKeyboardPress}
      >
        <KeyboardIcon width={30} height={30} />
      </TouchableOpacity>

      {/* Microphone Button */}
      <TouchableOpacity 
        style={[styles.micButton, isListening && styles.micButtonActive]}
        onPress={onMicPress}
      >
        <WaveVisualization
          isListening={isListening}
          waveAnim1={waveAnim1}
          waveAnim2={waveAnim2}
          waveAnim3={waveAnim3}
        />
      </TouchableOpacity>

      {/* Help Button */}
      <TouchableOpacity style={styles.controlButton} onPress={onHelpPress}>
        <HelpIcon width={30} height={30} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  controlButtonActive: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  micButton: {
    width: 110,
    height: 110,
    borderRadius: 90,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginHorizontal: 20,
    marginBottom: 26,
  },
  micButtonActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#4A90E2',
  },
});

export default ControlButtons;