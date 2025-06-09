import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './Chat.css';

const Chat = () => {
  const { user } = useAuth();
  const {
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
  } = useChat();
  
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [isSessionsOpen, setIsSessionsOpen] = useState(false);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;
    
    sendMessage(message);
    setMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSessionSelect = (sessionId) => {
    if (currentSession?.session_id !== sessionId) {
      loadSession(sessionId);
    }
    setIsSessionsOpen(false);
  };

  const handleNewSession = () => {
    createNewSession();
    setIsSessionsOpen(false);
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat session?')) {
      await deleteSession(sessionId);
      toast.success('Chat session deleted');
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        <aside className={`chat-sidebar ${isSessionsOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h2>Chat Sessions</h2>
            <button
              onClick={handleNewSession}
              className="btn btn-primary btn-sm"
              disabled={loading}
            >
              New Chat
            </button>
          </div>
          
          <div className="sessions-list">
            {sessions.length === 0 ? (
              <div className="no-sessions">
                <p>No chat sessions yet</p>
              </div>
            ) : (
              sessions.map(session => (
                <div
                  key={session.session_id}
                  className={`session-item ${
                    currentSession?.session_id === session.session_id ? 'active' : ''
                  }`}
                  onClick={() => handleSessionSelect(session.session_id)}
                >
                  <div className="session-preview">
                    {session.messages[0]?.content.substring(0, 50)}...
                  </div>
                  <div className="session-meta">
                    <span>{new Date(session.created_at).toLocaleDateString()}</span>
                    <button
                      onClick={(e) => handleDeleteSession(session.session_id, e)}
                      className="delete-session-btn"
                      disabled={loading}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        <main className="chat-main">
          <div className="chat-header">
            <button
              className="mobile-menu-toggle"
              onClick={() => setIsSessionsOpen(!isSessionsOpen)}
              disabled={loading}
            >
              {isSessionsOpen ? '✕' : '☰'}
            </button>
            <h1>Chat with ShopBot</h1>
            {currentSession && (
              <button
                onClick={() => {
                  if (window.confirm('Start a new chat session?')) {
                    createNewSession();
                  }
                }}
                className="btn btn-secondary btn-sm"
                disabled={loading}
              >
                New Chat
              </button>
            )}
          </div>

          <div className="chat-messages">
            {messages.length === 0 && !loading ? (
              <div className="welcome-message">
                <h2>Welcome, {user?.username}!</h2>
                <p>
                  I'm your shopping assistant. You can ask me to:
                </p>
                <ul>
                  <li>Find products by name, brand, or category</li>
                  <li>Filter products by price range or availability</li>
                  <li>Get details about specific products</li>
                  <li>Compare different products</li>
                </ul>
                <p>How can I help you today?</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${msg.message_type}`}
                >
                  <div className="message-content">
                    {msg.message_type === 'user' ? (
                      <div className="user-message">
                        <div className="avatar">
                          {user?.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="text">{msg.content}</div>
                      </div>
                    ) : (
                      <div className="bot-message">
                        <div className="avatar">🤖</div>
                        <div className="text">
                          {msg.content.split('\n').map((paragraph, i) => (
                            <p key={i}>{paragraph}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ))
            )}
            
            {loading && (
              <div className="message bot">
                <div className="message-content">
                  <div className="bot-message">
                    <div className="avatar">🤖</div>
                    <div className="text">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="chat-input">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              rows="1"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!message.trim() || loading}
              className="send-btn"
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
};

export default Chat;