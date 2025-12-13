import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import '../styles/ChatModal.css';

const ChatModal = ({ isOpen, onClose, chatType, title }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
      
      if (chatType === 'teacher') {
        pollIntervalRef.current = setInterval(loadHistory, 5000);
      }
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isOpen, chatType]);

  const loadHistory = async () => {
    try {
      const endpoint = chatType === 'ai' ? '/api/chat/ai-history' : '/api/chat/teacher-history';
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setLoading(true);

    try {
      const endpoint = chatType === 'ai' ? '/api/chat/ai' : '/api/chat/teacher';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: userMessage })
      });

      if (response.ok) {
        await loadHistory();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="chat-modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'user' || msg.role === 'student' ? '👤' : 
                 msg.role === 'assistant' ? '🤖' : '👨‍🏫'}
              </div>
              <div className="message-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                    // Custom paragraph rendering to preserve formatting
                    p({ children }) {
                      return <p>{children}</p>;
                    },
                    // Better list rendering
                    ul({ children }) {
                      return <ul className="md-list">{children}</ul>;
                    },
                    ol({ children }) {
                      return <ol className="md-list">{children}</ol>;
                    },
                    li({ children }) {
                      return <li className="md-list-item">{children}</li>;
                    },
                    // Headings with custom styling
                    h1({ children }) {
                      return <h1 className="md-h1">{children}</h1>;
                    },
                    h2({ children }) {
                      return <h2 className="md-h2">{children}</h2>;
                    },
                    h3({ children }) {
                      return <h3 className="md-h3">{children}</h3>;
                    },
                    h4({ children }) {
                      return <h4 className="md-h4">{children}</h4>;
                    },
                    // Strong (bold) text
                    strong({ children }) {
                      return <strong className="md-bold">{children}</strong>;
                    },
                    // Emphasis (italic) text
                    em({ children }) {
                      return <em className="md-italic">{children}</em>;
                    },
                    // Blockquote
                    blockquote({ children }) {
                      return <blockquote className="md-blockquote">{children}</blockquote>;
                    }
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
                <div className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="message assistant">
              <div className="message-avatar">🤖</div>
              <div className="message-content typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={chatType === 'ai' ? 'Ask me anything about STEM...' : 'Message your teacher...'}
            disabled={loading}
            rows={3}
          />
          <button onClick={handleSend} disabled={loading || !input.trim()}>
            {loading ? '⏳' : '📤'} Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;