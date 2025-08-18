import { Audio } from 'expo-av';
import { Platform } from 'react-native';

interface AudioRecordingOptions {
  android: {
    extension: string;
    outputFormat: typeof Audio.AndroidOutputFormat[keyof typeof Audio.AndroidOutputFormat];
    audioEncoder: number;
    sampleRate: number;
    numberOfChannels: number;
    bitRate: number;
  };
  ios: {
    extension: string;
    outputFormat: typeof Audio.IOSOutputFormat[keyof typeof Audio.IOSOutputFormat];
    audioQuality: number;
    sampleRate: number;
    numberOfChannels: number;
    bitRate: number;
    linearPCMBitDepth: number;
    linearPCMIsBigEndian: boolean;
    linearPCMIsFloat: boolean;
  };
  web: {
    mimeType: string;
    bitsPerSecond: number;
  };
}

class AudioRecordingService {
  private recording: Audio.Recording | null = null;
  private isRecording = false;

  // Audio recording configuration
  private readonly recordingOptions: AudioRecordingOptions = {
    android: {
      extension: '.m4a',
      outputFormat: Audio.AndroidOutputFormat.MPEG_4,
      audioEncoder: Audio.AndroidAudioEncoder.AAC,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
    },
    ios: {
      extension: '.m4a',
      outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
      audioQuality: Audio.IOSAudioQuality.HIGH,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
    web: {
      mimeType: 'audio/webm;codecs=opus',
      bitsPerSecond: 128000,
    },
  };

  async requestPermissions(): Promise<boolean> {
    try {
      console.log('🎤 Requesting audio permissions...');
      const permission = await Audio.requestPermissionsAsync();
      
      if (permission.status !== 'granted') {
        console.error('❌ Audio permission denied');
        return false;
      }
      
      console.log('✅ Audio permission granted');
      return true;
    } catch (error) {
      console.error('❌ Error requesting audio permissions:', error);
      return false;
    }
  }

  async startRecording(): Promise<boolean> {
    try {
      if (this.isRecording) {
        console.warn('⚠️ Already recording');
        return false;
      }

      console.log('🎙️ Starting audio recording...');
      
      // Request permissions first
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return false;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create new recording instance
      this.recording = new Audio.Recording();
      
      // Start recording with platform-specific options
      const options = {
        android: this.recordingOptions.android,
        ios: this.recordingOptions.ios,
        web: this.recordingOptions.web,
      };
      await this.recording.prepareToRecordAsync(options);
      await this.recording.startAsync();
      
      this.isRecording = true;
      console.log('✅ Recording started successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      this.isRecording = false;
      return false;
    }
  }

  async stopRecording(): Promise<string | null> {
    try {
      if (!this.isRecording || !this.recording) {
        console.warn('⚠️ No active recording to stop');
        return null;
      }

      console.log('⏹️ Stopping audio recording...');
      
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      
      // Reset recording state
      this.recording = null;
      this.isRecording = false;
      
      console.log('✅ Recording stopped successfully. URI:', uri);
      return uri;
      
    } catch (error) {
      console.error('❌ Failed to stop recording:', error);
      this.isRecording = false;
      this.recording = null;
      return null;
    }
  }

  async cancelRecording(): Promise<void> {
    try {
      if (this.recording) {
        console.log('🚫 Cancelling recording...');
        await this.recording.stopAndUnloadAsync();
        this.recording = null;
      }
      this.isRecording = false;
    } catch (error) {
      console.error('❌ Error cancelling recording:', error);
      this.isRecording = false;
      this.recording = null;
    }
  }

  getRecordingStatus(): { isRecording: boolean; duration?: number } {
    if (!this.recording || !this.isRecording) {
      return { isRecording: false };
    }

    return {
      isRecording: this.isRecording,
    };
  }

  // Get recording duration in seconds
  async getRecordingDuration(): Promise<number> {
    if (!this.recording || !this.isRecording) {
      return 0;
    }

    try {
      const status = await this.recording.getStatusAsync();
      return status.durationMillis ? status.durationMillis / 1000 : 0;
    } catch (error) {
      console.error('❌ Error getting recording duration:', error);
      return 0;
    }
  }
}

export const audioRecordingService = new AudioRecordingService();