import React from 'react';
import { Animated, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import ControlButtons from './ControlButtons';
import TextInputContainer from './TextInputContainer';

interface CustomInputToolbarProps {
  currentState: string;
  showKeyboard: boolean;
  textMessage: string;
  isListening: boolean;
  onChangeText: (text: string) => void;
  onSendText: () => void;
  onKeyboardPress: () => void;
  onMicPress: () => void;
  textInputRef: React.RefObject<TextInput | null>;
  waveAnim1: Animated.Value;
  waveAnim2: Animated.Value;
  waveAnim3: Animated.Value;
}

const CustomInputToolbar: React.FC<CustomInputToolbarProps> = ({
  currentState,
  showKeyboard,
  textMessage,
  isListening,
  onChangeText,
  onSendText,
  onKeyboardPress,
  onMicPress,
  textInputRef,
  waveAnim1,
  waveAnim2,
  waveAnim3,
}) => {
  if (currentState === 'initial' || currentState === 'listening') {
    return null;
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
    >
      <View style={styles.customInputContainer}>
        {showKeyboard && (
          <TextInputContainer
            textMessage={textMessage}
            onChangeText={onChangeText}
            onSendText={onSendText}
            textInputRef={textInputRef}
          />
        )}
        
        <Text style={styles.bottomText}>Mia so na kasa</Text>
        
        <ControlButtons
          showKeyboard={showKeyboard}
          isListening={isListening}
          onKeyboardPress={onKeyboardPress}
          onMicPress={onMicPress}
          waveAnim1={waveAnim1}
          waveAnim2={waveAnim2}
          waveAnim3={waveAnim3}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    backgroundColor: '#FFFFFF',
  },
  customInputContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  bottomText: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 10,
  },
});

export default CustomInputToolbar;