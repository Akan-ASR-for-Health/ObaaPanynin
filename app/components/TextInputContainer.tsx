import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface TextInputContainerProps {
  textMessage: string;
  onChangeText: (text: string) => void;
  onSendText: () => void;
  textInputRef: React.RefObject<TextInput | null>;
}

const TextInputContainer: React.FC<TextInputContainerProps> = ({
  textMessage,
  onChangeText,
  onSendText,
  textInputRef,
}) => {
  return (
    <View style={styles.textInputContainer}>
      <TextInput
        ref={textInputRef}
        style={styles.textInput}
        value={textMessage}
        onChangeText={onChangeText}
        placeholder="Kyerɛw wo nsɛm..."
        multiline
        maxLength={500}
        onSubmitEditing={onSendText}
        blurOnSubmit={false}
      />
      <TouchableOpacity 
        style={[styles.sendButton, !textMessage.trim() && styles.sendButtonDisabled]}
        onPress={onSendText}
        disabled={!textMessage.trim()}
      >
        <Text style={styles.sendButtonText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
    maxHeight: 100,
    color: '#333333',
  },
  sendButton: {
    backgroundColor: '#133D75',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    margin: 5,
  },
  sendButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default TextInputContainer;