import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';

interface Message {
  _id: string;
  match: string;
  sender: {
    _id: string;
    fullName: string;
    profileImage: string;
  };
  content: string;
  messageType: 'text' | 'image' | 'video' | 'voice';
  mediaUrl?: string;
  status: 'sent' | 'delivered' | 'read';
  createdAt: string;
}

export const useChat = (matchId: string) => {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  /**
   * Fetch Message History
   */
  const fetchMessages = useCallback(async () => {
    if (!matchId) return;
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/chats/${matchId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }, [matchId, token]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  /**
   * Send Message
   * @param content - Text content of the message
   * @param type - Type of message (defaults to text)
   */
  const sendMessage = async (content: string, type: Message['messageType'] = 'text', mediaUrl?: string) => {
    if (!content.trim() && !mediaUrl) return;

    try {
      setSending(true);
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/chats/${matchId}`,
        { content, messageType: type, mediaUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Append new message to local state for instant UI update
      setMessages((prev) => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    } finally {
      setSending(false);
    }
  };

  /**
   * Mark as Read
   * Updates the backend and local status
   */
  const markAsRead = async () => {
    try {
      await axios.put(`${process.env.EXPO_PUBLIC_API_URL}/api/matches/${matchId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  return {
    messages,
    loading,
    sending,
    sendMessage,
    refreshMessages: fetchMessages,
    markAsRead
  };
};