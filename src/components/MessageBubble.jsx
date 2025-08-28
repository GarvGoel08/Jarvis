import React, { useState } from 'react';
import { User, Bot, Clock, CheckCircle, AlertCircle, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './MessageBubble.css';

const MessageBubble = ({ message }) => {
  const [copied, setCopied] = useState(false);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const isUser = message.type === 'user';
  const isError = message.isError;

  return (
    <div className={`message-bubble ${isUser ? 'user' : 'assistant'} ${isError ? 'error' : ''}`}>
      <div className="message-avatar">
        {isUser ? <User size={20} /> : <Bot size={20} />}
      </div>
      
      <div className="message-content">
        <div className="message-body">
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <div className="markdown-content">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Metadata for assistant messages */}
        {!isUser && message.metadata && (
          <div className="message-metadata">
            <div className="metadata-row">
              {message.metadata.isCompleted ? (
                <span className="status completed">
                  <CheckCircle size={14} />
                  Completed
                </span>
              ) : (
                <span className="status partial">
                  <AlertCircle size={14} />
                  Partial
                </span>
              )}
              
              {message.metadata.agent && (
                <span className="agent">
                  Agent: {message.metadata.agent}
                </span>
              )}
              
              {message.metadata.processingTime && (
                <span className="processing-time">
                  <Clock size={14} />
                  {(message.metadata.processingTime / 1000).toFixed(2)}s
                </span>
              )}
            </div>

            {message.metadata.agentChain && message.metadata.agentChain.length > 1 && (
              <div className="agent-chain">
                <span className="chain-label">Agent Chain:</span>
                <div className="chain-items">
                  {message.metadata.agentChain.map((agent, index) => (
                    <span key={index} className="chain-item">
                      {agent}
                      {index < message.metadata.agentChain.length - 1 && ' → '}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {message.metadata.totalIterations && (
              <div className="iterations">
                Iterations: {message.metadata.totalIterations}
              </div>
            )}
          </div>
        )}

        <div className="message-footer">
          <span className="timestamp">
            <Clock size={12} />
            {formatTime(message.timestamp)}
          </span>
          
          <button 
            className="copy-btn"
            onClick={() => copyToClipboard(message.content)}
            title="Copy message"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
