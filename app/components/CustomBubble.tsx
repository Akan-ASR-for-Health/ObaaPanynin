import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { IMessage } from 'react-native-gifted-chat';
import { Bubble } from 'react-native-gifted-chat';

type CustomMessage = IMessage & {
  hasTranslation?: boolean;
  translation?: string;
};

interface CustomBubbleProps {
  translationVisibility: Record<string, boolean>;
  onToggleTranslation: (messageId: string) => void;
  getTranslation: (messageId: string) => string | null;
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

  // Only show translation button if there's a translation available
  const hasTranslation = !!translation;

  console.log(`🔍 Bubble render for ${messageId}:`, {
    showTranslation,
    hasTranslation,
    translation: translation ? translation.substring(0, 50) + '...' : null,
    messageText: currentMessage.text.substring(0, 50) + '...',
    isUserMessage,
    allTranslationVisibility: props.translationVisibility,
    translationVisibilityForThisMessage: props.translationVisibility[messageId],
  });

  const handleToggleTranslation = useCallback(() => {
    console.log('🔄 Translation button clicked for message:', messageId);
    console.log('📋 Current state - showTranslation:', showTranslation, 'hasTranslation:', hasTranslation);
    props.onToggleTranslation(messageId);
  }, [messageId, showTranslation, hasTranslation, props.onToggleTranslation]);

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
      
      {/* Only show translation button if translation is available */}
      {hasTranslation && (
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
      )}
      
      {/* Show translation bubble if translation is visible and available */}
      {showTranslation && hasTranslation && (
        <View style={[
          styles.translationBubble,
          styles.translationBubbleGrey,
          isUserMessage ? styles.translationBubbleRight : styles.translationBubbleLeft
        ]}>
          <Text style={styles.translationBubbleText}>
            {translation}
          </Text>
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
});

export default CustomBubble;