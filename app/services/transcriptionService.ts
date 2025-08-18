interface TranscriptionResponse {
  transcription: string;
}

class TranscriptionService {
  private readonly baseUrl = 'https://h3vwf0fhff24pc-9090.proxy.runpod.net/transcribe/';

  async transcribeAudio(audioUri: string): Promise<string | null> {
    try {
      console.log('🎯 Starting transcription for audio:', audioUri);

      // Create FormData to send audio file
      const formData = new FormData();
      
      // API expects field name "audio_file" with audio/x-m4a type (based on curl example)
      const audioFile = {
        uri: audioUri,
        type: 'audio/x-m4a',  // Correct MIME type from curl
        name: 'recording.m4a',
      } as any;

      // Use "audio_file" as the field name (from curl example)
      formData.append('audio_file', audioFile);

      console.log('📤 Sending audio to transcription service...');
      console.log('📋 Using field name: "audio_file", type: audio/x-m4a');

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          // Don't set Content-Type - let FormData set multipart/form-data with boundary
        },
        body: formData,
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`Transcription API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data: TranscriptionResponse = await response.json();
      
      console.log('✅ Transcription successful:', data.transcription);
      return data.transcription;

    } catch (error) {
      console.error('❌ Transcription failed:', error);
      return null;
    }
  }

  async transcribeAudioWithRetry(
    audioUri: string, 
    maxRetries: number = 3
  ): Promise<string | null> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Transcription attempt ${attempt}/${maxRetries}`);
        
        const result = await this.transcribeAudio(audioUri);
        if (result) {
          return result;
        }
        
        throw new Error('Transcription returned null');
        
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Transcription attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    console.error('❌ All transcription attempts failed:', lastError);
    return null;
  }

  // Validate audio file before sending
  private isValidAudioFile(uri: string): boolean {
    if (!uri) return false;
    
    const validExtensions = ['.m4a', '.wav', '.mp3', '.aac'];
    return validExtensions.some(ext => uri.toLowerCase().includes(ext));
  }

  async transcribeAudioSafe(audioUri: string): Promise<string | null> {
    try {
      // Validate input
      if (!this.isValidAudioFile(audioUri)) {
        console.error('❌ Invalid audio file URI:', audioUri);
        return null;
      }

      console.log('🔍 Validating audio file... ✅');

      // Attempt transcription with retry
      return await this.transcribeAudioWithRetry(audioUri, 2); // Reduced retries since we know the format now
      
    } catch (error) {
      console.error('❌ Safe transcription failed:', error);
      return null;
    }
  }
}

export const transcriptionService = new TranscriptionService();