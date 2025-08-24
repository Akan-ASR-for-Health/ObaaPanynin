import React from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ListeningScreenProps {
  onMicPress: () => void;
  onStopListening: () => void;
  pulseAnim: Animated.Value;
  waveAnim1: Animated.Value;
  waveAnim2: Animated.Value;
  waveAnim3: Animated.Value;
  recordingDuration?: number;
  voiceState?: 'listening' | 'thinking' | 'responding' | 'idle';
  onBackToChat?: () => void;
}

const ListeningScreen: React.FC<ListeningScreenProps> = ({
  onMicPress,
  onStopListening,
  pulseAnim,
  waveAnim1,
  waveAnim2,
  waveAnim3,
  recordingDuration = 0,
  voiceState = 'listening',
  onBackToChat,
}) => {
  const formatDuration = (duration: number): string => {
    const seconds = Math.floor(duration);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStateInfo = () => {
    switch (voiceState) {
      case 'listening':
        return {
          title: 'Merɛtie...',
          subtitle: 'Kasa na me ntie wo',
          buttonText: 'Gyae',
          showDuration: true,
          circleColor: '#F0F8FF',
          borderColor: '#4A90E2',
          showTapToSpeak: false,
        };
      case 'thinking':
        return {
          title: 'Merɛdwen...',
          subtitle: 'Merɛyɛ wo nsɛm no',
          buttonText: 'Back to Chat',
          showDuration: false,
          circleColor: '#FFF8DC',
          borderColor: '#FFD700',
          showTapToSpeak: false,
        };
      case 'responding':
        return {
          title: 'Merɛkasa...',
          subtitle: 'Tie mɛanooɛ',
          buttonText: 'Gyae',
          showDuration: false,
          circleColor: '#F0FFF0',
          borderColor: '#32CD32',
          showTapToSpeak: false,
        };
      default: // 'idle' state - ready to listen again
        return {
          title: 'Ready to listen',
          subtitle: 'Tap to speak again',
          buttonText: 'Back to Chat',
          showDuration: false,
          circleColor: '#F0F8FF',
          borderColor: '#4A90E2',
          showTapToSpeak: true,
        };
    }
  };

  const stateInfo = getStateInfo();

  const handleButtonPress = () => {
    if (voiceState === 'thinking' && onBackToChat) {
      console.log('🔙 Back to chat pressed from thinking state');
      onBackToChat();
    } else {
      onStopListening();
    }
  };

  // Handle circle press - this is the key fix
  const handleCirclePress = () => {
    console.log('🎯 Circle pressed, voice state:', voiceState);
    
    if (voiceState === 'listening') {
      // Stop current recording
      onMicPress();
    } else if (voiceState === 'idle') {
      // Start new recording when in idle state
      console.log('🎤 Starting new recording from idle state');
      onMicPress();
    } else if (voiceState === 'responding') {
      // Stop playback
      onMicPress();
    }
    // Don't handle thinking state - let it process
  };

  return (
    <View style={styles.overlayContainer}>
      <View style={styles.centerContainer}>
        <Text style={styles.titleText}>{stateInfo.title}</Text>
        <Text style={styles.subtitleText}>{stateInfo.subtitle}</Text>
        
        {stateInfo.showDuration && (
          <Text style={styles.durationText}>
            {formatDuration(recordingDuration)}
          </Text>
        )}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleCirclePress}
          disabled={voiceState === 'thinking'} // Only disable during thinking
        >
          <Animated.View 
            style={[
              styles.listeningCircle, 
              { 
                transform: [{ scale: pulseAnim }],
                backgroundColor: stateInfo.circleColor,
                borderColor: stateInfo.borderColor,
              }
            ]}
          >
            <View style={styles.waveContainer}>
              {voiceState === 'listening' && (
                <>
                  <Animated.View style={[styles.wave, { opacity: waveAnim1 }]} />
                  <Animated.View style={[styles.wave, styles.wave2, { opacity: waveAnim2 }]} />
                  <Animated.View style={[styles.wave, styles.wave3, { opacity: waveAnim3 }]} />
                </>
              )}
              
              {voiceState === 'thinking' && (
                <View style={styles.thinkingIndicator}>
                  <View style={[styles.thinkingDot, styles.thinkingDot1]} />
                  <View style={[styles.thinkingDot, styles.thinkingDot2]} />
                  <View style={[styles.thinkingDot, styles.thinkingDot3]} />
                </View>
              )}
              
              {voiceState === 'responding' && (
                <View style={styles.respondingIndicator}>
                  <Animated.View style={[styles.soundWave, { opacity: waveAnim1 }]} />
                  <Animated.View style={[styles.soundWave, { opacity: waveAnim2 }]} />
                  <Animated.View style={[styles.soundWave, { opacity: waveAnim3 }]} />
                </View>
              )}

              {/* Show microphone icon for idle state */}
              {voiceState === 'idle' && (
                <View style={styles.readyIndicator}>
                  <Text style={styles.micIcon}>🎤</Text>
                </View>
              )}
            </View>
          </Animated.View>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomContainer}>
        <View style={styles.controlsContainer}>
          {stateInfo.buttonText && (
            <TouchableOpacity 
              style={[
                styles.controlButton, 
                voiceState === 'thinking' ? styles.backToChatButton : styles.stopButton
              ]} 
              onPress={handleButtonPress}
            >
              <Text style={[
                voiceState === 'thinking' ? styles.backToChatButtonText : styles.stopButtonText
              ]}>
                {stateInfo.buttonText}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        {voiceState === 'listening' && (
          <Text style={styles.instructionText}>
            Kasa wo nsɛm na bɔ gyae sɛ wo wie a
          </Text>
        )}
        
        {voiceState === 'thinking' && (
          <>
            <Text style={styles.instructionText}>
              Merɛyɛ wo nsɛm no yiye...
            </Text>
            <Text style={[styles.instructionText, styles.helpText]}>
              Tap "Back to Chat" if you want to return to text mode
            </Text>
          </>
        )}
        
        {voiceState === 'responding' && (
          <Text style={styles.instructionText}>
            Obaa Panyin reka...
          </Text>
        )}

        {voiceState === 'idle' && (
          <Text style={styles.instructionText}>
            Tap the circle to speak again or use "Back to Chat" for text mode
          </Text>
        )}
      </View>
    </View>
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
  titleText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
  },
  durationText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4A90E2',
    marginBottom: 30,
    fontFamily: 'monospace',
  },
  listeningCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  waveContainer: {
    width: 120,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wave: {
    position: 'absolute',
    width: 20,
    height: 40,
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    marginHorizontal: 4,
  },
  wave2: {
    left: 30,
    height: 50,
  },
  wave3: {
    left: 60,
    height: 35,
  },
  thinkingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thinkingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFD700',
    marginHorizontal: 4,
  },
  thinkingDot1: {
    animationDelay: '0s',
  },
  thinkingDot2: {
    animationDelay: '0.2s',
  },
  thinkingDot3: {
    animationDelay: '0.4s',
  },
  respondingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundWave: {
    width: 8,
    height: 40,
    backgroundColor: '#32CD32',
    borderRadius: 4,
    marginHorizontal: 3,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 50,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  controlButton: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
    paddingHorizontal: 20,
  },
  stopButton: {
    backgroundColor: '#FF6B6B',
    minWidth: 80,
  },
  backToChatButton: {
    backgroundColor: '#4A90E2',
    minWidth: 120,
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  backToChatButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  instructionText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  readyIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  micIcon: {
    fontSize: 40,
    textAlign: 'center',
  },
  helpText: {
    marginTop: 8,
    fontSize: 12,
    color: '#4A90E2',
    fontStyle: 'italic',
  },
});

export default ListeningScreen;