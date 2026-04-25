import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View
} from 'react-native';
import { Bubble, BubbleProps, GiftedChat, IMessage, Send, SendProps } from 'react-native-gifted-chat';
import { useAuth } from '../../../backend/src/hooks/useAuth';
import { useChat } from '../../../backend/src/hooks/useChat';

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { messages, loading, sendMessage, markAsRead } = useChat(id || '');
  const [formattedMessages, setFormattedMessages] = useState<IMessage[]>([]);

  useEffect(() => {
    if (messages) {
      const mapped: IMessage[] = messages.map((msg: any) => ({
        _id: msg._id,
        text: msg.content,
        createdAt: new Date(msg.createdAt),
        user: {
          _id: msg.sender._id,
          name: msg.sender.fullName,
          avatar: msg.sender.profileImage,
        },
      }));
      setFormattedMessages(mapped.reverse());
    }
  }, [messages]);

  useEffect(() => {
    if (id) markAsRead();
  }, [id, markAsRead]);

  const onSend = useCallback((newMessages: IMessage[] = []) => {
    if (newMessages.length > 0) {
      sendMessage(newMessages[0].text);
    }
  }, [sendMessage]);

  const renderBubble = (props: BubbleProps<IMessage>) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: { backgroundColor: '#FF3B5C' },
        left: { backgroundColor: '#F0F0F0' },
      }}
      textStyle={{
        right: { color: '#fff' },
        left: { color: '#1a1a1a' },
      }}
    />
  );

  // FIX: Use isSendButtonAlwaysVisible and cast props to 'any' to bypass strict interface mismatches
  const renderSend = (props: SendProps<IMessage>) => (
    <Send 
      {...(props as any)} 
      isSendButtonAlwaysVisible={true}
    >
      <View style={styles.sendButton}>
        <Ionicons name="send" size={24} color="#FF3B5C" />
      </View>
    </Send>
  );

  if (loading && formattedMessages.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF3B5C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Chat', headerTintColor: '#FF3B5C' }} />

      <GiftedChat
        messages={formattedMessages}
        onSend={onSend}
        user={{ _id: user?._id || '' }}
        renderBubble={renderBubble}
        renderSend={renderSend}
        // Force bypass for top-level GiftedChat prop conflicts
        {...({
          textInputProps: {
            placeholder: "Type a message...",
            multiline: true,
            style: styles.textInput
          },
          scrollToBottom: true,
          infiniteScroll: true,
        } as any)}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sendButton: { 
    marginRight: 10, 
    marginBottom: 8, // Adjusted for alignment
    justifyContent: 'center' 
  },
  textInput: {
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#000',
    flex: 1,
  }
});