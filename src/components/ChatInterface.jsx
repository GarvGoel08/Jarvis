import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader, Trash2, Settings, Info } from 'lucide-react';
import MessageBubble from './MessageBubble';
import SystemInfo from './SystemInfo';
import './ChatInterface.css';

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Hello! I\'m JarvisAI, your intelligent assistant. I can help you with web browsing, data extraction, research, and many other tasks. What would you like me to do today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSystemInfo, setShowSystemInfo] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPrompt: inputMessage,
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: data.result?.response || data.message || 'I completed your request, but no response was provided.',
        timestamp: new Date(),
        metadata: {
          jobId: data.jobId,
          processingTime: data.processingTime,
          agent: data.result?.agent,
          isCompleted: data.result?.isCompleted,
          totalIterations: data.result?.totalIterations,
          agentChain: data.agentChain
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again or check if the backend server is running.',
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'assistant',
        content: 'Chat cleared! How can I help you today?',
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="chat-interface">
      {/* Header */}
      <header className="chat-header">
        <div className="header-left">
          <div className="logo">
            <Bot size={24} />
            <span>JarvisAI</span>
          </div>
        </div>
        <div className="header-right">
          <button 
            className="header-btn"
            onClick={() => setShowSystemInfo(!showSystemInfo)}
            title="System Info"
          >
            <Info size={18} />
          </button>
          <button 
            className="header-btn"
            onClick={clearChat}
            title="Clear Chat"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      {/* System Info Panel */}
      {showSystemInfo && (
        <SystemInfo onClose={() => setShowSystemInfo(false)} />
      )}

      {/* Messages Container */}
      <div className="messages-container">
        <div className="messages-list">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {isLoading && (
            <div className="message-bubble assistant">
              <div className="message-avatar">
                <Bot size={20} />
              </div>
              <div className="message-content">
                <div className="loading-indicator">
                  <Loader className="spinner" size={16} />
                  <span>JarvisAI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="input-area">
        <div className="input-container">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask JarvisAI anything... (e.g., 'Find phones under ₹20,000 on Amazon', 'Search for AI news', 'Help me with web scraping')"
            className="message-input"
            rows="1"
            disabled={isLoading}
          />
          <button 
            onClick={sendMessage}
            className={`send-btn ${(!inputMessage.trim() || isLoading) ? 'disabled' : ''}`}
            disabled={!inputMessage.trim() || isLoading}
          >
            <Send size={18} />
          </button>
        </div>
        
        <div className="input-footer">
          <span className="disclaimer">
            JarvisAI can browse websites, extract data, and perform web automation tasks.
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
