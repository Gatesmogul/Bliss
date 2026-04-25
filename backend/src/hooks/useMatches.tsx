import axios from 'axios';
import { useCallback, useState } from 'react';
import { useAuth } from './useAuth';

// Interface for User Profiles in the discovery/match flow
interface MatchCandidate {
  _id: string;
  fullName: string;
  age: number;
  country: string;
  profession: string;
  profileImage: string;
  about: string;
  compatibilityScore?: number;
}

export const useMatches = () => {
  const { token } = useAuth();
  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [activeMatches, setActiveMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * Fetch Discovery Feed
   * Gets potential matches based on compatibility and filtering
   */
  const fetchDiscovery = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/matches/discovery`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCandidates(response.data);
    } catch (error) {
      console.error("Discovery Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  /**
   * Fetch Active Chat List
   * Gets matches where a conversation has been established
   */
  const fetchActiveMatches = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/matches/chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveMatches(response.data);
    } catch (error) {
      console.error("Active Matches Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  /**
   * Send Connection Request
   * Triggered when a user "Likes" or "Connects" with someone
   */
  const sendRequest = async (targetUserId: string) => {
    try {
      await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/matches/request`,
        { targetUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Remove the candidate from local state after taking action
      setCandidates((prev) => prev.filter(c => c._id !== targetUserId));
    } catch (error) {
      console.error("Connection Request Error:", error);
      throw error;
    }
  };

  /**
   * Respond to Connection Request
   * @param matchId - The ID of the match/request
   * @param action - 'accepted' | 'rejected'
   */
  const respondToRequest = async (matchId: string, action: 'accepted' | 'rejected') => {
    try {
      await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/api/matches/respond`,
        { matchId, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh active matches if a request was accepted
      if (action === 'accepted') fetchActiveMatches();
    } catch (error) {
      console.error("Response Error:", error);
    }
  };

  return {
    candidates,
    activeMatches,
    loading,
    fetchDiscovery,
    fetchActiveMatches,
    sendRequest,
    respondToRequest
  };
};