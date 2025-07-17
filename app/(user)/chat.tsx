import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput as RNTextInput,
} from 'react-native';
import {
  Text,
  ActivityIndicator,
  IconButton,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const GEMINI_API_KEY = 'AIzaSyA4CcjsXJ9tSKkKLa19T9XXkNptmsXhZPk';

export default function ChatScreen() {
  const { theme, isDark } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  
  const styles = createStyles(theme);

  // Tính toán tab bar height (88px) + padding
  const TAB_BAR_HEIGHT = 88;
  const BOTTOM_SAFE_AREA = insets.bottom;

  useEffect(() => {
    // Tự động scroll xuống cuối khi có tin nhắn mới
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText.trim();
    setInputText('');
    setIsLoading(true);

    try {
      const requestBody = {
        contents: [{
          parts: [{
            text: currentInput
          }]
        }]
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Unknown error';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error?.message || errorText;
        } catch (e) {
          errorMessage = errorText;
        }
        throw new Error(`API Error (${response.status}): ${errorMessage}`);
      }

      const data = await response.json();
      if (!data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
        throw new Error('Invalid response from AI');
      }
      const botResponse = data.candidates[0].content.parts[0].text;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: botResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to get response from AI.');
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (item: Message) => {
    const isUser = item.role === 'user';
    return (
      <View key={item.id} style={[styles.messageContainer, isUser ? styles.userContainer : styles.botContainer]}>
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.botBubble
        ]}>
          <Text style={[styles.messageText, !isUser && styles.botText]}>
            {item.content}
          </Text>
          <Text style={[styles.timestamp, !isUser && styles.botTimestamp]}>
            {item.timestamp.toLocaleTimeString()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>  
        <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>  
          <MaterialIcons name="smart-toy" size={32} color={theme.colors.onPrimary} />
          <Text style={[styles.headerTitle, { color: theme.colors.onPrimary }]}>AI Chat</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.onPrimary }]}>Powered by Gemini AI</Text>
        </View>
        
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.messagesContainer, 
            { 
              paddingBottom: 20 // Giảm padding xuống vì không cần tránh input nữa
            }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map(renderMessage)}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>AI is thinking...</Text>
            </View>
          )}
        </ScrollView>
        
        <View style={[
          styles.inputContainer, 
          { 
            backgroundColor: theme.colors.background,
            marginBottom: 80, // Thay đổi về margin để không đè lên
            paddingBottom: Math.max(BOTTOM_SAFE_AREA, 16),
          }
        ]}>  
          <View style={[
            styles.inputWrapper,
            { 
              backgroundColor: theme.colors.surfaceVariant,
              borderColor: theme.colors.outline,
            }
          ]}>
            <RNTextInput
              style={[
                styles.textInput, 
                { 
                  backgroundColor: 'transparent',
                  color: theme.colors.onSurface,
                }
              ]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              placeholderTextColor={theme.colors.onSurfaceVariant + '80'}
              multiline={false}
              maxLength={500}
              onSubmitEditing={sendMessage}
              editable={!isLoading}
              underlineColorAndroid="transparent"
              cursorColor={theme.colors.primary}
              selectionColor={theme.colors.primary + '30'}
              autoFocus={false}
              returnKeyType="send"
            />
          </View>
          <IconButton
            icon="send"
            size={24}
            iconColor={theme.colors.onPrimary}
            style={[
              styles.sendButton,
              { 
                backgroundColor: inputText.trim() === '' || isLoading 
                  ? theme.colors.outline 
                  : theme.colors.primary 
              }
            ]}
            onPress={sendMessage}
            disabled={isLoading || inputText.trim() === ''}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingTop: 50,
    paddingBottom: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    alignItems: "center",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.onPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.onPrimary + '80',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContainer: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginVertical: 6,
    maxWidth: "80%",
  },
  userContainer: {
    alignSelf: "flex-end",
  },
  botContainer: {
    alignSelf: "flex-start",
  },
  messageBubble: {
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: theme.colors.primary,
  },
  botBubble: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  messageText: {
    fontSize: 16,
    color: theme.colors.onPrimary,
  },
  botText: {
    color: theme.colors.onSurface,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 8,
    textAlign: "right",
    color: theme.colors.onPrimary + '80',
  },
  botTimestamp: {
    color: theme.colors.onSurface + '80',
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
    fontStyle: "italic",
    color: theme.colors.onSurfaceVariant,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
    backgroundColor: theme.colors.background,
    // Xóa position absolute để không đè lên content
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    backgroundColor: theme.colors.surfaceVariant,
    marginRight: 12,
    height: 48,
    justifyContent: "center",
  },
  textInput: {
    fontSize: 16,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
    color: theme.colors.onSurface,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});