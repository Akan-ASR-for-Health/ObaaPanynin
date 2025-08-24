import { Audio } from 'expo-av';

interface PlaybackStatus {
  isPlaying: boolean;
  duration?: number;
  position?: number;
  isLoaded: boolean;
}

class AudioPlaybackService {
  private sound: Audio.Sound | null = null;
  private isPlaying = false;
  private onPlaybackFinished?: () => void;

  constructor() {
    this.setupAudio();
  }

  private async setupAudio(): Promise<void> {
    try {
      // Configure audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('❌ Error setting up audio mode:', error);
    }
  }

  async playAudioFromUrl(
    audioUrl: string, 
    onFinished?: () => void
  ): Promise<boolean> {
    try {
      console.log('🔊 Starting audio playback from:', audioUrl);

      // Stop any currently playing audio
      await this.stopPlayback();

      // Store callback
      this.onPlaybackFinished = onFinished;

      // Create new sound object
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { 
          shouldPlay: true,
          volume: 1.0,
        },
        this.onPlaybackStatusUpdate.bind(this)
      );

      this.sound = sound;
      this.isPlaying = true;

      console.log('✅ Audio playback started successfully');
      return true;

    } catch (error) {
      console.error('❌ Audio playback failed:', error);
      this.isPlaying = false;
      return false;
    }
  }

  private onPlaybackStatusUpdate(status: any): void {
    console.log('🎵 Playback status update:', {
      isLoaded: status.isLoaded,
      isPlaying: status.isPlaying,
      didJustFinish: status.didJustFinish,
      positionMillis: status.positionMillis,
      durationMillis: status.durationMillis,
      error: status.error
    });

    if (status.isLoaded) {
      if (status.didJustFinish && !status.isLooping) {
        console.log('🔊 Audio playback finished - calling completion callback');
        this.isPlaying = false;
        
        // Call the finished callback
        if (this.onPlaybackFinished) {
          console.log('📞 Triggering onPlaybackFinished callback');
          const callback = this.onPlaybackFinished;
          this.onPlaybackFinished = undefined; // Clear callback first to prevent double-calls
          callback();
        } else {
          console.log('⚠️ No callback registered for playback completion');
        }
        
        // Clean up the sound object
        this.cleanupSound();
      } else if (status.isPlaying) {
        // Update playing state
        this.isPlaying = true;
      }
    } else if (status.error) {
      console.error('❌ Audio playback error:', status.error);
      this.isPlaying = false;
      
      // Call error callback if available
      if (this.onPlaybackFinished) {
        console.log('📞 Triggering error callback');
        const callback = this.onPlaybackFinished;
        this.onPlaybackFinished = undefined;
        callback();
      }
      
      this.cleanupSound();
    }
  }

  async stopPlayback(): Promise<void> {
    try {
      if (this.sound) {
        console.log('⏹️ Stopping audio playback...');
        await this.sound.stopAsync();
        await this.cleanupSound();
      }
      this.isPlaying = false;
      // Clear callback when manually stopped
      this.onPlaybackFinished = undefined;
    } catch (error) {
      console.error('❌ Error stopping playback:', error);
      this.isPlaying = false;
    }
  }

  async pausePlayback(): Promise<void> {
    try {
      if (this.sound && this.isPlaying) {
        console.log('⏸️ Pausing audio playback...');
        await this.sound.pauseAsync();
        this.isPlaying = false;
      }
    } catch (error) {
      console.error('❌ Error pausing playback:', error);
    }
  }

  async resumePlayback(): Promise<void> {
    try {
      if (this.sound && !this.isPlaying) {
        console.log('▶️ Resuming audio playback...');
        await this.sound.playAsync();
        this.isPlaying = true;
      }
    } catch (error) {
      console.error('❌ Error resuming playback:', error);
    }
  }

  private async cleanupSound(): Promise<void> {
    try {
      if (this.sound) {
        console.log('🧹 Cleaning up sound object...');
        await this.sound.unloadAsync();
        this.sound = null;
      }
    } catch (error) {
      console.error('❌ Error cleaning up sound:', error);
      this.sound = null;
    }
  }

  getPlaybackStatus(): PlaybackStatus {
    return {
      isPlaying: this.isPlaying,
      isLoaded: !!this.sound,
    };
  }

  async getDetailedStatus(): Promise<PlaybackStatus> {
    if (!this.sound) {
      return {
        isPlaying: false,
        isLoaded: false,
      };
    }

    try {
      const status = await this.sound.getStatusAsync();
      
      if (status.isLoaded) {
        return {
          isPlaying: status.isPlaying || false,
          duration: status.durationMillis ? status.durationMillis / 1000 : undefined,
          position: status.positionMillis ? status.positionMillis / 1000 : undefined,
          isLoaded: true,
        };
      }
      
      return {
        isPlaying: false,
        isLoaded: false,
      };
    } catch (error) {
      console.error('❌ Error getting playback status:', error);
      return {
        isPlaying: false,
        isLoaded: false,
      };
    }
  }

  // Play audio from the WebSocket response
  async playBotResponse(audioUrl: string, onComplete?: () => void): Promise<boolean> {
    const fullUrl = `https://h3vwf0fhff24pc-9090.proxy.runpod.net${audioUrl}`;
    console.log('🤖 Playing bot response audio:', fullUrl);
    console.log('📞 Registering completion callback:', !!onComplete);
    
    return this.playAudioFromUrl(fullUrl, () => {
      console.log('🤖 Bot response playback completed - executing callback');
      if (onComplete) {
        onComplete();
      }
    });
  }

  // Cleanup when component unmounts
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up audio service...');
    await this.stopPlayback();
    this.onPlaybackFinished = undefined;
  }
}

export const audioPlaybackService = new AudioPlaybackService();