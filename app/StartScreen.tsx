import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TextInput
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
import { useAnimations } from '../hooks/useAnimations';
import { useVoiceConversation } from '../hooks/useVoiceConversation';
import { useWebSocket } from '../hooks/useWebSocket';

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
  const [isVoiceConversation, setIsVoiceConversation] = useState(false); // Track if we're in voice mode
  
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
    setOnAudioResponse,
    getMessageTranslation,
  } = useWebSocket();
  
  const { 
    pulseAnim, 
    waveAnim1, 
    waveAnim2, 
    waveAnim3 
  } = useAnimations(isListening);

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
  } = useVoiceConversation(
    sendMessage, 
    (audioUrl: string) => {
      // onAudioResponseReceived callback
      console.log('🎵 Voice conversation received audio URL:', audioUrl);
    },
    () => {
      // onVoiceConversationEnd callback
      console.log('🏁 Voice conversation ended - resetting voice flag');
      setIsVoiceConversation(false);
    }
  );

  // Set up audio response callback only for voice conversations
  const hasSetupAudioRef = useRef(false);

  useEffect(() => {
    console.log('🔧 Setting up audio callback, hasSetupAudio:', hasSetupAudioRef.current);
    
    if (setOnAudioResponse && playAudioResponse) {
      setOnAudioResponse((audioUrl: string) => {
        console.log('🎵 Audio callback triggered with URL:', audioUrl);
        console.log('🔍 Is voice conversation?', isVoiceConversation);
        
        // Only play audio if we're in a voice conversation
        if (isVoiceConversation) {
          console.log('🎵 Playing audio for voice conversation');
          playAudioResponse(audioUrl);
        } else {
          console.log('📝 Skipping audio playback for text conversation');
        }
      });
    }
  }, [setOnAudioResponse, playAudioResponse, isVoiceConversation]); // Re-run when isVoiceConversation changes

  // Event handlers
  const onSend = useCallback((newMessages: IMessage[] = []) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
  }, [setMessages]);

  const handleMicPress = useCallback(async () => {
    console.log('🎤 handleMicPress called, current voiceState:', voiceState, 'currentState:', currentState);
    
    // Set voice conversation flag when starting voice interaction
    setIsVoiceConversation(true);
    
    if (voiceState === 'idle') {
      // Start new voice conversation
      console.log('🆕 Starting new voice conversation from idle state');
      setCurrentState('listening');
      const success = await startListening();
      if (success) {
        setIsListening(true);
      } else {
        setCurrentState('chat'); // Go to chat if failed to start listening
        setIsVoiceConversation(false); // Reset voice flag on failure
        console.error('Failed to start listening');
      }
    } else if (voiceState === 'listening') {
      // Stop recording and process
      console.log('⏹️ Stopping current recording');
      setIsListening(false);
      await stopListening();
      // State will automatically change based on voice conversation flow
    } else if (voiceState === 'responding') {
      // Stop audio playback
      console.log('🛑 Stopping audio playback');
      await stopResponse();
      // Stay in listening screen and transition to idle
    }
  }, [voiceState, currentState, startListening, stopListening, stopResponse]);

  const handleStopListening = useCallback(async () => {
    console.log('🛑 handleStopListening called');
    setIsListening(false);
    setIsVoiceConversation(false); // Reset voice conversation flag
    await cancelListening();
    setCurrentState('chat');
    setShowKeyboard(false);
    setTextMessage('');
  }, [cancelListening]);

  // Update current state based on voice state - THIS IS THE KEY FIX
  useEffect(() => {
    console.log('🔄 Voice state changed to:', voiceState, 'Current app state:', currentState);
    
    switch (voiceState) {
      case 'idle':
        // IMPORTANT: When voice goes to idle, stay in listening screen if we were already there
        if (currentState === 'listening') {
          console.log('🎯 Voice conversation completed - staying in listening screen, ready for next interaction');
          setIsListening(false);
          // Stay in listening screen - don't change currentState
        } else {
          // If we're not in listening screen and voice goes to idle, reset voice conversation flag
          setIsVoiceConversation(false);
        }
        break;
      case 'listening':
        setCurrentState('listening');
        setIsListening(true);
        break;
      case 'thinking':
        // Stay in listening screen during thinking
        if (currentState !== 'listening') {
          setCurrentState('listening');
        }
        setIsListening(false);
        break;
      case 'responding':
        // Stay in listening screen during response
        if (currentState !== 'listening') {
          setCurrentState('listening');
        }
        setIsListening(false);
        break;
    }
  }, [voiceState, currentState]);

  // Add a safety timeout to prevent getting stuck in thinking state
  useEffect(() => {
    if (voiceState === 'thinking') {
      console.log('⏰ Starting thinking state timeout...');
      const timeout = setTimeout(() => {
        console.log('⏰ Thinking state timeout - forcing return to chat');
        setCurrentState('chat');
      }, 15000); // 15 second timeout

      return () => {
        console.log('⏰ Clearing thinking state timeout');
        clearTimeout(timeout);
      };
    }
  }, [voiceState]);

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
      console.log('📝 Sending text message - this is NOT a voice conversation');
      setIsVoiceConversation(false); // Ensure we're not in voice mode for text messages
      sendMessage(textMessage.trim());
      setTextMessage('');
    }
  }, [textMessage, sendMessage]);

  const handleToggleTranslation = useCallback((messageId: string) => {
    console.log('🔄 Toggling translation for message:', messageId);
    
    setTranslationVisibility(prev => {
      const currentValue = prev[messageId] || false;
      const newValue = !currentValue;
      const newVisibility = {
        ...prev,
        [messageId]: newValue
      };
      console.log('📋 Setting translation visibility:', messageId, 'from', currentValue, 'to', newValue);
      console.log('📋 New translation visibility state:', newVisibility);
      return newVisibility;
    });
  }, []);

  // Simplified translation function that uses WebSocket data
  const getTranslation = useCallback((messageId: string) => {
    const translation = getMessageTranslation(messageId);
    console.log('🔍 Getting translation for message:', messageId, '→', translation);
    return translation;
  }, [getMessageTranslation]);

  // Create enhanced messages with translation visibility info
  const enhancedMessages = React.useMemo(() => {
    return messages.map(msg => ({
      ...msg,
      _translationVisible: translationVisibility[String(msg._id)] || false,
    }));
  }, [messages, translationVisibility]);

  // Force re-render by creating a unique key for GiftedChat
  const chatKey = `chat-${Object.keys(translationVisibility).length}-${Object.values(translationVisibility).filter(Boolean).length}`;

  // Render functions
  const renderBubble = useCallback((props: any) => {
    const messageId = String(props.currentMessage?._id || '');
    const showTranslation = translationVisibility[messageId] || false;
    
    console.log(`🎯 renderBubble called for ${messageId}, showTranslation: ${showTranslation}`);
    
    return (
      <CustomBubble
        {...props}
        translationVisibility={translationVisibility}
        onToggleTranslation={handleToggleTranslation}
        getTranslation={getTranslation}
      />
    );
  }, [translationVisibility, handleToggleTranslation, getTranslation]);

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
          voiceState={voiceState} // Pass the actual voice state
          onBackToChat={() => {
            console.log('🔙 Back to chat pressed');
            setIsVoiceConversation(false); // Reset voice conversation flag
            setCurrentState('chat');
          }}
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
    waveAnim3,
    recordingDuration,
    voiceState // Include voiceState in dependencies
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ConnectionStatus 
        connectionStatus={connectionStatus} 
        onReconnect={reconnect} 
      />
      
      <GiftedChat
        key={chatKey}
        messages={enhancedMessages}
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