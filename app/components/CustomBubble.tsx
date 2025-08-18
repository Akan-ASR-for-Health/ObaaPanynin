import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { IMessage } from 'react-native-gifted-chat';
import { Bubble } from 'react-native-gifted-chat';

type CustomMessage = IMessage & {
  hasTranslation?: boolean;
  translation?: string;
};

interface CustomBubbleProps {
  translationVisibility: Record<string, boolean>;
  onToggleTranslation: (messageId: string) => void;
  translateMessage: (messageId: string, text: string, isUserMessage?: boolean) => Promise<void>;
  getTranslation: (messageId: string) => string | null;
  isTranslating: (messageId: string) => boolean;
  [key: string]: any;
}

const CustomBubble: React.FC<CustomBubbleProps> = (props) => {
  // Simple fallback if no currentMessage
  if (!props.currentMessage) {
    return null;
  }

  const currentMessage = props.currentMessage as CustomMessage;
  const messageId = String(currentMessage._id);
  const showTranslation = props.translationVisibility[messageId] || false;
  const isUserMessage = currentMessage.user._id === 1;
  const translation = props.getTranslation(messageId);
  const isLoadingTranslation = props.isTranslating(messageId);

  // Debug logging to see what's happening
  console.log(`🔍 Bubble render for ${messageId}:`, {
    showTranslation,
    hasTranslation: !!translation,
    isLoadingTranslation,
    translationVisibilityForThisMessage: props.translationVisibility[messageId],
    allTranslationVisibility: props.translationVisibility
  });

  // Auto-translate when translation is requested and not already available
  useEffect(() => {
    console.log('🔄 useEffect triggered with:', {
      showTranslation,
      hasTranslation: !!translation,
      isLoadingTranslation,
      messageId
    });
    
    if (showTranslation && !translation && !isLoadingTranslation) {
      console.log('🚀 Starting translation for:', currentMessage.text);
      props.translateMessage(messageId, currentMessage.text, isUserMessage);
    }
  }, [showTranslation, translation, isLoadingTranslation, messageId, currentMessage.text, isUserMessage, props.translateMessage]);

  const handleToggleTranslation = () => {
    console.log('Translation button clicked for message:', messageId);
    console.log('Current showTranslation state:', showTranslation);
    console.log('Available translation functions:', {
      hasTranslateMessage: typeof props.translateMessage === 'function',
      hasGetTranslation: typeof props.getTranslation === 'function',
      hasIsTranslating: typeof props.isTranslating === 'function'
    });
    props.onToggleTranslation(messageId);
  };

  return (
    <View>
      <Bubble
        {...props}
        wrapperStyle={{
          right: { 
            backgroundColor: '#133D75',
            marginRight: 8,
          },
          left: { 
            backgroundColor: '#C19D5D',
            marginLeft: 8,
          },
        }}
        textStyle={{
          right: { color: '#FFFFFF' },
          left: { color: '#FFFFFF' },
        }}
      />
      
      {/* Translation toggle button - ALWAYS SHOW (removed hasTranslation condition) */}
      <TouchableOpacity 
        style={[
          styles.translationButton,
          isUserMessage ? styles.translationRight : styles.translationLeft
        ]}
        onPress={handleToggleTranslation}
      >
        <Text style={styles.translationText}>
          {showTranslation ? "Hide translation" : "See English translation"}
        </Text>
      </TouchableOpacity>
      
      {/* Show translation bubble if translation is visible */}
      {showTranslation && (
        <View style={[
          styles.translationBubble,
          styles.translationBubbleGrey,
          isUserMessage ? styles.translationBubbleRight : styles.translationBubbleLeft
        ]}>
          {isLoadingTranslation ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#133D75" />
              <Text style={styles.loadingText}>Translating...</Text>
            </View>
          ) : (
            <Text style={styles.translationBubbleText}>
              {translation || "Translation not available"}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  translationBubble: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 2,
    maxWidth: '80%',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  translationBubbleGrey: {
    backgroundColor: '#E0E0E0',
    borderColor: '#CCCCCC',
  },
  translationBubbleLeft: {
    marginLeft: 50,
    alignSelf: 'flex-start',
  },
  translationBubbleRight: {
    marginRight: 50,
    alignSelf: 'flex-end',
  },
  translationBubbleText: {
    color: '#133D75',
    fontSize: 14,
    fontWeight: '500',
  },
  translationButton: {
    marginTop: 6,
    marginBottom: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  translationLeft: {
    marginLeft: 50, // Account for avatar space
    alignSelf: 'flex-start',
  },
  translationRight: {
    alignSelf: 'flex-end',
    marginRight: 16,
  },
  translationText: {
    fontSize: 14,
    color: '#C19D5D',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  loadingText: {
    color: '#133D75',
    fontSize: 14,
    fontStyle: 'italic',
    marginLeft: 8,
  },
});

export default CustomBubble;