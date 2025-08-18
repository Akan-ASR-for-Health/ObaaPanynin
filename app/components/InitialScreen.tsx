import React from 'react';
import { Animated, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import OpLogo from '../../assets/images/oplogo.svg';
import ControlButtons from './ControlButtons';
import TextInputContainer from './TextInputContainer';

interface InitialScreenProps {
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

const InitialScreen: React.FC<InitialScreenProps> = ({
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
  return (
    <KeyboardAvoidingView 
      style={styles.overlayContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.centerContainer}>
        <View style={styles.botIcon}>
          <OpLogo width={72} height={72} />
        </View>
        <View style={styles.initialMessageContainer}>
          <Text style={styles.initialMessageText}>
            Bisa me biribiara.{'\n'}Mewɔ ha sε merebeboa
          </Text>
        </View>
      </View>
      
      <View style={styles.bottomContainer}>
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
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    flex: 1,
    justifyContent: 'space-between',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  botIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  initialMessageContainer: {
    alignItems: 'center',
  },
  initialMessageText: {
    fontSize: 24,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 32,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  bottomText: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 10,
  },
});

export default InitialScreen;