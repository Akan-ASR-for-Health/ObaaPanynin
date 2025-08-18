import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TextInput,
} from 'react-native';
import type { IMessage } from 'react-native-gifted-chat';
import { GiftedChat } from 'react-native-gifted-chat';

// Component imports
import ConnectionStatus from './components/ConnectionStatus';
import CustomAvatar from './components/CustomAvatar';
import CustomBubble from './components/CustomBubble';
import CustomInputToolbar from './components/CustomInputToolbar';
import InitialScreen from './components/InitialScreen';
import ListeningScreen from './components/ListeningScreen';
import TypingAnimation from './components/TypingAnimation';

// Hook imports
import { useAnimations } from './hooks/useAnimations';
import { useTranslation } from './hooks/useTranslation';
import { useVoiceConversation } from './hooks/useVoiceConversation';
import { useWebSocket } from './hooks/useWebSocket';

type CustomMessage = IMessage & {
  hasTranslation?: boolean;
  translation?: string;
};

const ChatScreen: React.FC = () => {
  // State management
  const [isListening, setIsListening] = useState(false);
  const [currentState, setCurrentState] = useState('initial'); // 'initial', 'listening', 'chat'
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [textMessage, setTextMessage] = useState('');
  const [translationVisibility, setTranslationVisibility] = useState<Record<string, boolean>>({});
  
  // Refs
  const textInputRef = useRef<TextInput | null>(null);
  
  // Custom hooks
  const { 
    connectionStatus, 
    messages, 
    isTyping, 
    setMessages, 
    reconnect, 
    sendMessage,
    setOnAudioResponse
  } = useWebSocket();
  
  const { 
    pulseAnim, 
    waveAnim1, 
    waveAnim2, 
    waveAnim3 
  } = useAnimations(isListening);

  const {
    translateMessage,
    getTranslation,
    isTranslating,
  } = useTranslation();

  // Voice conversation hook
  const {
    voiceState,
    recordingDuration,
    isRecording,
    isPlayingResponse,
    startListening,
    stopListening,
    cancelListening,
    stopResponse,
    playAudioResponse,
    error: voiceError,
  } = useVoiceConversation(sendMessage);

  // Set up audio response callback immediately when both hooks are ready
const hasSetupAudioRef = useRef(false);

useEffect(() => {
  if (!hasSetupAudioRef.current && setOnAudioResponse && playAudioResponse) {
    setOnAudioResponse((audioUrl: string) => {
      console.log('🎵 Audio callback triggered with URL:', audioUrl);
      playAudioResponse(audioUrl);
    });
    hasSetupAudioRef.current = true;
  }
}, [setOnAudioResponse, playAudioResponse]);

  // Event handlers
  const onSend = useCallback((newMessages: IMessage[] = []) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
  }, [setMessages]);

  const handleMicPress = useCallback(async () => {
    if (voiceState === 'idle') {
      // Start voice conversation
      setCurrentState('listening');
      const success = await startListening();
      if (success) {
        setIsListening(true);
      } else {
        setCurrentState('initial');
        console.error('Failed to start listening');
      }
    } else if (voiceState === 'listening') {
      // Stop recording and process
      setIsListening(false);
      await stopListening();
      // State will automatically change based on voice conversation flow
    } else if (voiceState === 'responding') {
      // Stop audio playback
      await stopResponse();
      setCurrentState('chat');
    }
  }, [voiceState, startListening, stopListening, stopResponse]);

  const handleStopListening = useCallback(async () => {
    setIsListening(false);
    await cancelListening();
    setCurrentState('initial');
    setShowKeyboard(false);
    setTextMessage('');
  }, [cancelListening]);

  // Update current state based on voice state
  useEffect(() => {
    switch (voiceState) {
      case 'idle':
        if (currentState === 'listening') {
          setCurrentState('chat'); // Go to chat after voice interaction
        }
        setIsListening(false);
        break;
      case 'listening':
        setCurrentState('listening');
        setIsListening(true);
        break;
      case 'thinking':
      case 'responding':
        setCurrentState('listening'); // Keep showing listening screen
        setIsListening(false);
        break;
    }
  }, [voiceState, currentState]);

  const handleKeyboardPress = useCallback(() => {
    if (currentState === 'initial') {
      setCurrentState('chat');
    }
    setShowKeyboard(!showKeyboard);
    if (!showKeyboard) {
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 100);
    } else {
      textInputRef.current?.blur();
    }
  }, [currentState, showKeyboard]);

  const handleSendText = useCallback(() => {
    if (textMessage.trim()) {
      sendMessage(textMessage.trim());
      setTextMessage('');
    }
  }, [textMessage, sendMessage]);

  const handleToggleTranslation = useCallback((messageId: string) => {
    setTranslationVisibility(prev => ({
      ...prev,
      [messageId]: !(prev[messageId] || false)
    }));
  }, []);

  // Render functions
  const renderBubble = useCallback((props: any) => {
    return (
      <CustomBubble
        {...props}
        translationVisibility={translationVisibility}
        onToggleTranslation={handleToggleTranslation}
        translateMessage={translateMessage}
        getTranslation={getTranslation}
        isTranslating={isTranslating}
      />
    );
  }, [translationVisibility, handleToggleTranslation, translateMessage, getTranslation, isTranslating]);

  const renderAvatar = useCallback((props: any) => (
    <CustomAvatar {...props} />
  ), []);

  const renderInputToolbar = useCallback((props: any) => (
    <CustomInputToolbar
      {...props}
      currentState={currentState}
      showKeyboard={showKeyboard}
      textMessage={textMessage}
      isListening={isListening}
      onChangeText={setTextMessage}
      onSendText={handleSendText}
      onKeyboardPress={handleKeyboardPress}
      onMicPress={handleMicPress}
      textInputRef={textInputRef}
      waveAnim1={waveAnim1}
      waveAnim2={waveAnim2}
      waveAnim3={waveAnim3}
    />
  ), [
    currentState, 
    showKeyboard, 
    textMessage, 
    isListening, 
    handleSendText, 
    handleKeyboardPress, 
    handleMicPress,
    waveAnim1,
    waveAnim2,
    waveAnim3
  ]);

  const renderOverlay = useCallback(() => {
    if (currentState === 'initial') {
      return (
        <InitialScreen
          showKeyboard={showKeyboard}
          textMessage={textMessage}
          isListening={isListening}
          onChangeText={setTextMessage}
          onSendText={handleSendText}
          onKeyboardPress={handleKeyboardPress}
          onMicPress={handleMicPress}
          textInputRef={textInputRef}
          waveAnim1={waveAnim1}
          waveAnim2={waveAnim2}
          waveAnim3={waveAnim3}
        />
      );
    }

    if (currentState === 'listening') {
      return (
        <ListeningScreen
          onMicPress={handleMicPress}
          onStopListening={handleStopListening}
          pulseAnim={pulseAnim}
          waveAnim1={waveAnim1}
          waveAnim2={waveAnim2}
          waveAnim3={waveAnim3}
          recordingDuration={recordingDuration}
          voiceState={
            voiceState === 'listening' || voiceState === 'thinking' || voiceState === 'responding'
              ? voiceState
              : undefined
          }
        />
      );
    }

    return null;
  }, [
    currentState, 
    showKeyboard, 
    textMessage, 
    isListening, 
    handleSendText, 
    handleKeyboardPress, 
    handleMicPress, 
    handleStopListening,
    pulseAnim,
    waveAnim1,
    waveAnim2,
    waveAnim3
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ConnectionStatus 
        connectionStatus={connectionStatus} 
        onReconnect={reconnect} 
      />
      
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{ _id: 1 }}
        renderBubble={renderBubble}
        renderAvatar={renderAvatar}
        renderInputToolbar={renderInputToolbar}
        bottomOffset={0}
        minInputToolbarHeight={0}
        showUserAvatar={false}
        alignTop={true}
        renderFooter={() => isTyping ? <TypingAnimation /> : null}
      />
      
      {renderOverlay()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default ChatScreen;