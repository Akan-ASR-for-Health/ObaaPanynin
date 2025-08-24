import { useEffect, useRef, useState } from 'react';
import type { IMessage } from 'react-native-gifted-chat';
import { GiftedChat } from 'react-native-gifted-chat';
import { v4 as uuidv4 } from 'uuid';

type CustomMessage = IMessage & {
  hasTranslation?: boolean;
  translation?: string;
};

type ConnectionStatus = 'connected' | 'disconnected' | 'pending';

interface WebSocketHookReturn {
  socket: WebSocket | null;
  connectionStatus: ConnectionStatus;
  messages: CustomMessage[];
  isTyping: boolean;
  setMessages: React.Dispatch<React.SetStateAction<CustomMessage[]>>;
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
  reconnect: () => void;
  sendMessage: (message: string) => void;
  onAudioResponse?: (audioUrl: string) => void;
  setOnAudioResponse: (callback: (audioUrl: string) => void) => void;
  getMessageTranslation: (messageId: string) => string | null;
}

const WEBSOCKET_URL = 'wss://h3vwf0fhff24pc-9090.proxy.runpod.net/chat';

export const useWebSocket = (): WebSocketHookReturn => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('pending');
  const [messages, setMessages] = useState<CustomMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const systemMessageShownRef = useRef(false);

  // Store translations separately
  const [translations, setTranslations] = useState<Record<string, string>>({});

  // Audio response callback
  const onAudioResponseRef = useRef<((audioUrl: string) => void) | undefined>(undefined);

  const setOnAudioResponse = (callback: (audioUrl: string) => void) => {
    onAudioResponseRef.current = callback;
  };

  const getMessageTranslation = (messageId: string): string | null => {
    return translations[messageId] || null;
  };

  const createWebSocketConnection = (userId: string): WebSocket => {
    const ws = new WebSocket(`${WEBSOCKET_URL}/${userId}`);

    ws.onopen = () => {
      console.log('WebSocket connection established');
      setConnectionStatus('connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'typing') {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 10000);
      } else if (data.type === 'system') {
        setIsTyping(false);
        if (!systemMessageShownRef.current) {
          systemMessageShownRef.current = true;
          console.log('System message received:', data.message);
          const systemMessage: CustomMessage = {
            _id: data.message_id || Math.round(Math.random() * 1000000),
            text: "Sɛ wopɛ nsɛm a ɛfa wo ho anaa wo ba ho a, bɔ mmɔden kɔ mpɔtam anaa dɔkita. Sɛ wunya nsɛm a ɛyɛ den a, bɔ mmɔden kɔ mpɔtam. Mɛhyɛ nyansa sɛ, bɔ mmɔden kɔ dɔkita. Sɛ wopɛ nsɛm a ɛyɛ nokware a, bɔ mmɔden kɔ dɔkita.",
            createdAt: new Date(data.timestamp * 1000),
            user: {
              _id: 2,
              name: 'System',
            },
            hasTranslation: true,
            translation: "If you need information about yourself or your baby, please see a healthcare provider or doctor. If you have urgent concerns, please seek immediate medical care. I recommend consulting with a doctor. For accurate medical information, please consult a healthcare professional.",
          };

          // Store the translation
          setTranslations(prev => ({
            ...prev,
            [String(systemMessage._id)]: systemMessage.translation!,
          }));

          setMessages((prevMessages) => GiftedChat.append(prevMessages, [systemMessage]));
        }
      } else if (data.type === 'dual_memory_response') {
        setIsTyping(false);
        console.log('Dual memory response received:', data.response.text);

        const messageId = data.message_id || Math.round(Math.random() * 1000000);
        
        const botMessage: CustomMessage = {
          _id: messageId,
          text: data.response.text, // This is the Twi text
          createdAt: new Date(data.timestamp * 1000),
          user: {
            _id: 2,
            name: 'Obaa Panyin',
          },
          hasTranslation: true,
        };

        // Extract English translation from the response
        const englishTranslation = data.safety_bounded_llm?.english_response;
        
        if (englishTranslation) {
          console.log('📝 Storing built-in translation for bot message:', messageId);
          console.log('🇬🇭 Twi:', data.response.text);
          console.log('🇺🇸 English:', englishTranslation);
          
          botMessage.translation = englishTranslation;
          
          // Store the translation
          setTranslations(prev => ({
            ...prev,
            [String(messageId)]: englishTranslation,
          }));
        }

        // 🆕 Handle user message translation from the same response
        if (data.user_input && data.variant_memory?.canonical_query) {
          const userTwiText = data.user_input.text;
          const userEnglishTranslation = data.variant_memory.canonical_query;
          
          console.log('📝 Processing user message translation:');
          console.log('🇬🇭 User Twi:', userTwiText);
          console.log('🇺🇸 User English:', userEnglishTranslation);
          
          // Find and update the matching user message
          setMessages(prevMessages => {
            const updatedMessages = prevMessages.map(msg => {
              // Match user messages that have the same text and don't have translation yet
              if (msg.user._id === 1 && 
                  msg.text.trim() === userTwiText.trim() && 
                  !msg.hasTranslation) {
                
                console.log('✅ Found matching user message:', msg._id, 'Text:', msg.text);
                
                // Store user message translation in the main translations object
                const messageIdStr = String(msg._id);
                setTranslations(prev => {
                  const newTranslations = {
                    ...prev,
                    [messageIdStr]: userEnglishTranslation,
                  };
                  console.log('💾 Stored user translation for:', messageIdStr, '→', userEnglishTranslation);
                  console.log('💾 All translations after user update:', newTranslations);
                  return newTranslations;
                });
                
                return {
                  ...msg,
                  hasTranslation: true,
                  translation: userEnglishTranslation,
                };
              }
              return msg;
            });
            
            console.log('📋 Updated messages with user translation');
            return updatedMessages;
          });
        }

        setMessages((prevMessages) => GiftedChat.append(prevMessages, [botMessage]));

        // Handle audio response
        if (data.response?.audio_url) {
          console.log('🔊 Audio response available:', data.response.audio_url);
          if (onAudioResponseRef.current) {
            console.log('🎵 Calling audio response callback');
            onAudioResponseRef.current(data.response.audio_url);
          } else {
            console.log('🔊 Audio response available but no callback set');
          }
        }
      } else {
        setIsTyping(false);
        console.log('Unknown message type received:', data);
        const errorMessage: CustomMessage = {
          _id: data.message_id || Math.round(Math.random() * 1000000),
          text: data.message || 'Unknown message type',
          createdAt: new Date(data.timestamp * 1000),
          user: {
            _id: 0,
            name: 'Error',
          },
        };
        setMessages((prevMessages) => GiftedChat.append(prevMessages, [errorMessage]));
      }
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setConnectionStatus('disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('disconnected');
    };

    return ws;
  };

  const reconnect = () => {
    setConnectionStatus('pending');
    const userId = uuidv4();
    const newSocket = createWebSocketConnection(userId);
    setSocket(newSocket);
  };

  const sendMessage = (message: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const outgoingMessage = {
        type: 'text',
        message: message.trim(),
      };

      socket.send(JSON.stringify(outgoingMessage));

      const messageId = Math.round(Math.random() * 1000000);
      const userMessage: CustomMessage = {
        _id: messageId,
        text: message.trim(),
        createdAt: new Date(),
        user: {
          _id: 1,
        },
        hasTranslation: false, // Will be updated when bot response comes back with user translation
      };

      setMessages((prevMessages) => GiftedChat.append(prevMessages, [userMessage]));
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 30000);
    }
  };

  useEffect(() => {
    const userId = uuidv4();
    const ws = createWebSocketConnection(userId);
    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  return {
    socket,
    connectionStatus,
    messages,
    isTyping,
    setMessages,
    setIsTyping,
    reconnect,
    sendMessage,
    onAudioResponse: onAudioResponseRef.current,
    setOnAudioResponse,
    getMessageTranslation,
  };
};