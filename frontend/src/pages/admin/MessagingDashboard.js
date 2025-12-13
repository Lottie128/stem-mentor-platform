import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getSocket } from '../../services/socket';
import '../../styles/MessagingDashboard.css';

const MessagingDashboard = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();

    // Set up Socket.io listener for new messages
    const socket = getSocket();
    if (socket) {
      socket.on('new_student_message', (data) => {
        console.log('New student message received:', data);
        fetchMessages();
        
        // Play notification sound
        const audio = new Audio('/notification.mp3');
        audio.play().catch(e => console.log('Audio play failed'));
      });
    }

    return () => {
      if (socket) {
        socket.off('new_student_message');
      }
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get('/api/chat/admin/messages');
      setConversations(data);
      
      // Update selected student if viewing conversation
      if (selectedStudent) {
        const updated = data.find(c => c.student_id === selectedStudent.student_id);
        if (updated) {
          setSelectedStudent(updated);
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async () => {
    if (!replyMessage.trim() || !selectedStudent) return;

    setSending(true);
    try {
      await axios.post(`/api/chat/admin/reply/${selectedStudent.student_id}`, {
        message: replyMessage
      });
      
      setReplyMessage('');
      fetchMessages();
    } catch (error) {
      alert('❌ Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const getUnreadCount = (conversation) => {
    const lastAdminMessage = conversation.messages.filter(m => m.role === 'admin').pop();
    const lastAdminTime = lastAdminMessage ? new Date(lastAdminMessage.created_at) : new Date(0);
    
    return conversation.messages.filter(m => 
      m.role === 'student' && new Date(m.created_at) > lastAdminTime
    ).length;
  };

  if (loading) {
    return <div className="loading">Loading messages...</div>;
  }

  return (
    <div className="messaging-dashboard">
      <div className="messaging-header glass-card">
        <button onClick={() => navigate('/admin')} className="back-btn">← Back</button>
        <div>
          <h1 className="gradient-text">💬 Student Messages</h1>
          <p>Respond to student inquiries and provide guidance</p>
        </div>
      </div>

      <div className="messaging-content">
        {/* Conversations List */}
        <div className="conversations-list glass-card">
          <h3>📬 Conversations ({conversations.length})</h3>
          {conversations.length === 0 ? (
            <div className="empty-state">
              <p>No messages yet</p>
            </div>
          ) : (
            <div className="conversation-items">
              {conversations.map(conv => {
                const unread = getUnreadCount(conv);
                return (
                  <div
                    key={conv.student_id}
                    className={`conversation-item ${selectedStudent?.student_id === conv.student_id ? 'active' : ''} ${unread > 0 ? 'has-unread' : ''}`}
                    onClick={() => setSelectedStudent(conv)}
                  >
                    <div className="conv-avatar">
                      {conv.profile_picture ? (
                        <img src={conv.profile_picture} alt={conv.full_name} />
                      ) : (
                        <div className="avatar-placeholder">{conv.full_name[0]}</div>
                      )}
                    </div>
                    <div className="conv-info">
                      <div className="conv-name">{conv.full_name}</div>
                      <div className="conv-preview">
                        {conv.messages[conv.messages.length - 1]?.content.substring(0, 50)}...
                      </div>
                    </div>
                    {unread > 0 && (
                      <div className="unread-badge">{unread}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Chat Window */}
        <div className="chat-window glass-card">
          {selectedStudent ? (
            <>
              <div className="chat-header">
                <div className="student-info">
                  {selectedStudent.profile_picture ? (
                    <img src={selectedStudent.profile_picture} alt={selectedStudent.full_name} />
                  ) : (
                    <div className="avatar-placeholder">{selectedStudent.full_name[0]}</div>
                  )}
                  <div>
                    <h3>{selectedStudent.full_name}</h3>
                    <p>{selectedStudent.email}</p>
                  </div>
                </div>
              </div>

              <div className="chat-messages">
                {selectedStudent.messages.map(msg => (
                  <div key={msg.id} className={`message ${msg.role}`}>
                    <div className="message-content">{msg.content}</div>
                    <div className="message-time">
                      {new Date(msg.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="chat-input">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendReply()}
                  placeholder="Type your reply..."
                  disabled={sending}
                />
                <button onClick={sendReply} disabled={sending || !replyMessage.trim()}>
                  {sending ? '⏳' : '➤'}
                </button>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <div className="empty-icon">💬</div>
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingDashboard;