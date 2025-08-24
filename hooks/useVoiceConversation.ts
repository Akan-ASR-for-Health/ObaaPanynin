import { useCallback, useRef, useState } from 'react';
import { audioPlaybackService } from '../services/audioPlaybackService';
import { audioRecordingService } from '../services/audioRecordingService';
import { transcriptionService } from '../services/transcriptionService';

export type VoiceState = 
  | 'idle'        // Not doing anything voice-related
  | 'listening'   // Recording user's voice
  | 'thinking'    // Processing: transcribing + sending to WebSocket
  | 'responding'; // Playing bot's audio response

interface VoiceConversationHook {
  voiceState: VoiceState;
  recordingDuration: number;
  isRecording: boolean;
  isPlayingResponse: boolean;
  startListening: () => Promise<boolean>;
  stopListening: () => Promise<void>;
  cancelListening: () => Promise<void>;
  stopResponse: () => Promise<void>;
  error: string | null;
}

export const useVoiceConversation = (
  sendMessage: (message: string) => void,
  onAudioResponseReceived?: (audioUrl: string) => void,
  onVoiceConversationEnd?: () => void // New callback to notify when voice conversation ends
): VoiceConversationHook & { playAudioResponse: (audioUrl: string) => Promise<void> } => {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for tracking state
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRecordingRef = useRef(false);
  const isPlayingResponseRef = useRef(false);

  // Clear any existing error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Update recording duration timer
  const startRecordingTimer = useCallback(() => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    
    setRecordingDuration(0);
    recordingTimerRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 0.1);
    }, 100);
  }, []);

  const stopRecordingTimer = useCallback(() => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setRecordingDuration(0);
  }, []);

  // Start listening (recording)
  const startListening = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🎤 Starting voice listening...');
      clearError();
      
      setVoiceState('listening');
      const success = await audioRecordingService.startRecording();
      
      if (success) {
        isRecordingRef.current = true;
        startRecordingTimer();
        console.log('✅ Voice listening started');
        return true;
      } else {
        setError('Failed to start recording. Please check microphone permissions.');
        setVoiceState('idle');
        return false;
      }
    } catch (error) {
      console.error('❌ Error starting listening:', error);
      setError('Failed to start recording');
      setVoiceState('idle');
      return false;
    }
  }, [clearError, startRecordingTimer]);

  // Stop listening and process audio
  const stopListening = useCallback(async (): Promise<void> => {
    try {
      console.log('⏹️ Stopping voice listening...');
      
      if (!isRecordingRef.current) {
        console.warn('⚠️ Not currently recording');
        return;
      }

      // Stop recording timer
      stopRecordingTimer();
      isRecordingRef.current = false;
      
      // Set state to thinking while processing
      setVoiceState('thinking');
      
      // Stop recording and get audio URI
      const audioUri = await audioRecordingService.stopRecording();
      
      if (!audioUri) {
        setError('Failed to save recording');
        setVoiceState('idle');
        return;
      }

      console.log('🎯 Processing audio recording...');
      
      // Transcribe the audio
      const transcription = await transcriptionService.transcribeAudioSafe(audioUri);
      
      if (!transcription) {
        setError('Failed to transcribe audio');
        setVoiceState('idle');
        return;
      }

      console.log('📝 Transcription successful:', transcription);
      
      // Send transcription as text message through WebSocket
      console.log('📤 Sending transcription to WebSocket:', transcription);
      sendMessage(transcription);
      
      // Keep state as 'thinking' until we receive audio response
      console.log('🔄 Keeping state as "thinking" until audio response...');
      // The state will change to 'responding' when playback starts
      
    } catch (error) {
      console.error('❌ Error stopping listening:', error);
      setError('Failed to process recording');
      setVoiceState('idle');
      stopRecordingTimer();
      isRecordingRef.current = false;
    }
  }, [stopRecordingTimer, sendMessage]);

  // Cancel listening without processing
  const cancelListening = useCallback(async (): Promise<void> => {
    try {
      console.log('🚫 Cancelling voice listening...');
      
      stopRecordingTimer();
      isRecordingRef.current = false;
      
      await audioRecordingService.cancelRecording();
      setVoiceState('idle');
      clearError();
      
      // Notify that voice conversation has ended
      if (onVoiceConversationEnd) {
        onVoiceConversationEnd();
      }
      
    } catch (error) {
      console.error('❌ Error cancelling listening:', error);
      setVoiceState('idle');
    }
  }, [stopRecordingTimer, clearError, onVoiceConversationEnd]);

  // Play audio response from WebSocket
  const playAudioResponse = useCallback(async (audioUrl: string): Promise<void> => {
    try {
      console.log('🔊 playAudioResponse called with URL:', audioUrl);
      console.log('🔊 Current voice state:', voiceState);
      
      setVoiceState('responding');
      isPlayingResponseRef.current = true;
      
      const success = await audioPlaybackService.playBotResponse(audioUrl, () => {
        // 🎯 KEY FIX: This callback runs when audio playback finishes
        console.log('🎯 Audio playback completed - transitioning to idle state for next interaction');
        setVoiceState('idle'); // ✅ Automatically transition to idle
        isPlayingResponseRef.current = false;
        
        // Notify that voice conversation cycle is complete (but ready for next interaction)
        // Don't end voice conversation here - just completed one cycle
      });
      
      if (!success) {
        console.error('❌ Failed to play audio response');
        setError('Failed to play audio response');
        setVoiceState('idle');
        isPlayingResponseRef.current = false;
      } else {
        console.log('✅ Audio playback started successfully');
      }
      
      // Notify parent component
      if (onAudioResponseReceived) {
        onAudioResponseReceived(audioUrl);
      }
      
    } catch (error) {
      console.error('❌ Error playing audio response:', error);
      setError('Failed to play audio response');
      setVoiceState('idle');
      isPlayingResponseRef.current = false;
    }
  }, [onAudioResponseReceived]); // Removed voiceState from dependencies to avoid stale closure

  // Stop audio response playback
  const stopResponse = useCallback(async (): Promise<void> => {
    try {
      console.log('⏹️ Stopping audio response...');
      
      await audioPlaybackService.stopPlayback();
      isPlayingResponseRef.current = false;
      setVoiceState('idle'); // ✅ Go to idle when manually stopped
      
    } catch (error) {
      console.error('❌ Error stopping response:', error);
      setVoiceState('idle');
    }
  }, []);

  return {
    voiceState,
    recordingDuration,
    isRecording: isRecordingRef.current && voiceState === 'listening',
    isPlayingResponse: isPlayingResponseRef.current && voiceState === 'responding',
    startListening,
    stopListening,
    cancelListening,
    stopResponse,
    playAudioResponse,
    error,
  };
};