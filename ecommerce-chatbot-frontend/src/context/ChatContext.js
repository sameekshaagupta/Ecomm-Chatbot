import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';
import { v4 as uuidv4 } from 'uuid';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createNewSession = () => {
    setCurrentSession(null);
    setMessages([]);
    setError(null);
  };

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      id: uuidv4(),
      message_type: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/chatbot/message/', {
        message,
        session_id: currentSession?.session_id
      });

      const { session_id, bot_response } = response.data;
      
      if (!currentSession) {
        setCurrentSession({ session_id });
      }

      setMessages(prev => [...prev, bot_response]);
      
      // Refresh sessions list
      await loadSessions();
      
    } catch (error) {
      setError('Failed to send message. Please try again.');
      const errorMessage = {
        id: uuidv4(),
        message_type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      const response = await api.get('/chatbot/sessions/');
      setSessions(response.data.sessions);
      setError(null);
    } catch (error) {
      setError('Failed to load chat sessions.');
      console.error('Failed to load sessions:', error);
    }
  };

  const loadSession = async (sessionId) => {
    try {
      setLoading(true);
      const response = await api.get(`/chatbot/sessions/${sessionId}/`);
      setCurrentSession(response.data);
      setMessages(response.data.messages || []);
      setError(null);
    } catch (error) {
      setError('Failed to load chat session.');
      console.error('Failed to load session:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      await api.delete(`/chatbot/sessions/${sessionId}/delete/`);
      setSessions(prev => prev.filter(s => s.session_id !== sessionId));
      
      if (currentSession?.session_id === sessionId) {
        createNewSession();
      }
      setError(null);
    } catch (error) {
      setError('Failed to delete chat session.');
      console.error('Failed to delete session:', error);
    }
  };

  const value = {
    currentSession,
    messages,
    sessions,
    loading,
    error,
    sendMessage,
    loadSessions,
    loadSession,
    deleteSession,
    createNewSession
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};