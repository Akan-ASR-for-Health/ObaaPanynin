import { useCallback, useState } from 'react';
import { translationService } from '../services/translationService';

interface TranslationCache {
  [key: string]: string;
}

interface UseTranslationReturn {
  translateMessage: (messageId: string, text: string, isUserMessage?: boolean) => Promise<void>;
  getTranslation: (messageId: string) => string | null;
  isTranslating: (messageId: string) => boolean;
  clearTranslations: () => void;
}

export const useTranslation = (): UseTranslationReturn => {
  const [translations, setTranslations] = useState<TranslationCache>({});
  const [loadingTranslations, setLoadingTranslations] = useState<Set<string>>(new Set());

  const translateMessage = useCallback(async (
    messageId: string, 
    text: string, 
    isUserMessage: boolean = true
  ) => {
    console.log('🌐 translateMessage called with:', { messageId, text, isUserMessage });
    
    // Check if translation already exists
    if (translations[messageId]) {
      console.log('✅ Translation already exists for:', messageId, '→', translations[messageId]);
      return;
    }

    // Check if translation is already in progress
    if (loadingTranslations.has(messageId)) {
      console.log('⏳ Translation already in progress for:', messageId);
      return;
    }

    console.log('🚀 Starting new translation...');
    
    // Add to loading set
    setLoadingTranslations(prev => {
      const newSet = new Set(prev);
      newSet.add(messageId);
      console.log('📝 Added to loading set:', messageId, 'Current loading:', Array.from(newSet));
      return newSet;
    });

    try {
      let translatedText: string;
      
      if (isUserMessage) {
        // User messages are typically in Twi, translate to English
        console.log('📱 Translating user message from Twi to English');
        translatedText = await translationService.translateTwiToEnglish(text);
      } else {
        // Bot messages are typically in Twi, translate to English
        console.log('🤖 Translating bot message from Twi to English');
        translatedText = await translationService.translateTwiToEnglish(text);
      }

      console.log('✅ Translation successful:', translatedText);

      // Store the translation
      setTranslations(prev => {
        const newTranslations = {
          ...prev,
          [messageId]: translatedText,
        };
        console.log('💾 Storing translation for:', messageId, '→', translatedText);
        console.log('💾 All translations now:', newTranslations);
        return newTranslations;
      });

    } catch (error) {
      console.error('❌ Translation failed for message:', messageId, error);
      // Store error message instead of original text
      setTranslations(prev => {
        const newTranslations = {
          ...prev,
          [messageId]: 'Translation failed - please try again',
        };
        console.log('🚨 Storing error translation for:', messageId);
        return newTranslations;
      });
    } finally {
      // Remove from loading set
      setLoadingTranslations(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        console.log('🗑️ Removed from loading set:', messageId, 'Current loading:', Array.from(newSet));
        return newSet;
      });
    }
  }, [translations, loadingTranslations]);

  const getTranslation = useCallback((messageId: string): string | null => {
    const translation = translations[messageId] || null;
    console.log('🔍 getTranslation for:', messageId, '→', translation);
    return translation;
  }, [translations]);

  const isTranslating = useCallback((messageId: string): boolean => {
    const isLoading = loadingTranslations.has(messageId);
    console.log('⏳ isTranslating for:', messageId, '→', isLoading);
    return isLoading;
  }, [loadingTranslations]);

  const clearTranslations = useCallback(() => {
    console.log('🧹 Clearing all translations');
    setTranslations({});
    setLoadingTranslations(new Set());
  }, []);

  return {
    translateMessage,
    getTranslation,
    isTranslating,
    clearTranslations,
  };
};