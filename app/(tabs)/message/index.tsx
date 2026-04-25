import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { Bubble, BubbleProps, GiftedChat, IMessage, Send, SendProps } from 'react-native-gifted-chat';
import { useAuth } from '../../../backend/src/hooks/useAuth';
import { useChat } from '../../../backend/src/hooks/useChat';

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { messages, loading, sendMessage, markAsRead } = useChat(id || '');
  const [formattedMessages, setFormattedMessages] = useState<IMessage[]>([]);

  // 1. Properly map and sort messages
  useEffect(() => {
    if (messages) {
      const mapped: IMessage[] = messages.map((msg: any) => ({
        _id: msg._id,
        text: msg.content || '',
        createdAt: new Date(msg.createdAt),
        user: {
          _id: msg.sender?._id || '',
          name: msg.sender?.fullName || 'User',
          avatar: msg.sender?.profileImage,
        },
      }));
      
      setFormattedMessages(
        mapped.sort((a, b) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
          const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
          return dateB - dateA;
        })
      );
    }
  }, [messages]);

  useEffect(() => {
    if (id) markAsRead();
  }, [id, markAsRead]);

  // 2. Strictly typed onSend
  const onSend = useCallback((newMessages: IMessage[] = []) => {
    if (newMessages.length > 0) {
      sendMessage(newMessages[0].text);
    }
  }, [sendMessage]);

  // 3. Typed Renderers
  const renderBubble = useCallback((props: BubbleProps<IMessage>) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: { backgroundColor: '#FF3B5C' },
        left: { backgroundColor: '#F2F2F7' },
      }}
    />
  ), []);

  const renderSend = useCallback((props: SendProps<IMessage>) => (
    <Send {...props} containerStyle={styles.sendContainer}>
      <View style={styles.sendButton}>
        <Ionicons name="send" size={24} color="#FF3B5C" />
      </View>
    </Send>
  ), []);

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Chat', 
          headerTintColor: '#FF3B5C',
          headerBackVisible: true,
          headerShadowVisible: false,
        }} 
      />

      <GiftedChat
        messages={formattedMessages}
        onSend={onSend}
        user={{
          _id: user?._id || '',
        }}
        renderBubble={renderBubble}
        renderSend={renderSend}
        // Force these standard props using 'any' if the library's IntrinsicAttributes are broken
        {...({
          placeholder: "Type a message...",
          alwaysShowSend: true,
          scrollToBottom: true,
          infiniteScroll: true,
          renderLoading: () => <ActivityIndicator color="#FF3B5C" />,
        } as any)}
      />

      {Platform.OS === 'ios' && (
        <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={90} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  sendContainer: { justifyContent: 'center', marginRight: 15 },
  sendButton: { justifyContent: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});