"use client";
import React, { useState } from 'react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleChatBox = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async () => {
    if (input.trim()) {
      const newMessage = { text: input, sender: 'user' };
      setMessages([...messages, newMessage]);
      setInput('');
      setLoading(true);
      setError('');

      try {
        const res = await fetch('/api/openai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'sendMessage', message: newMessage.text }), // Include the action parameter
        });

        const data = await res.json();
        if (res.ok) {
          const aiMessage = { text: data.message, sender: 'bot' };
          setMessages([...messages, newMessage, aiMessage]);
        } else {
          setError(data.error || 'Something went wrong');
        }
      } catch (err) {
        setError('Failed to fetch data');
      }

      setLoading(false);
    }
  };

  // Function to handle key press event
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      <img src="/chat.png" onClick={toggleChatBox} style={styles.chatButton} />
      {isOpen && (
        <div style={styles.overlay}>
          <div style={styles.chatBox}>
            <img src="https://cdn-icons-png.flaticon.com/128/391/391331.png" alt="profile" style={styles.closeButton} onClick={toggleChatBox} />
            <div style={styles.messagesContainer}>
              {messages.map((msg, index) => (
                <div key={index} style={msg.sender === 'user' ? styles.userMessage : styles.botMessage}>
                  {msg.sender === 'user' && (
                    <>
                      <p style={styles.messageText}>{msg.text}</p>
                      <img
                        src="/user.png"
                        alt="profile"
                        style={styles.profilePic}
                      />
                    </>
                  )}
                  {msg.sender === 'bot' && (
                    <>
                      <img
                        src="/bot.png"
                        alt="profile"
                        style={styles.profilePic}
                      />
                      <p style={styles.messageText}>{msg.text}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div style={styles.inputContainer}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown} // Add onKeyDown event
                style={styles.input}
                placeholder="Type a message..."
              />
              <button onClick={handleSendMessage} style={styles.sendButton}>Send</button>
            </div>

            {error && <p style={styles.errorText}>{error}</p>}
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  chatButton: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '10px',
    borderRadius: '20%',
    backgroundColor: '#3DACF7',
    color: '#FFFFFF',
    cursor: 'pointer',
    height: '70px',
  },
  overlay: {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  chatBox: {
    width: '90%',
    height: '75%',
    borderRadius: '15px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'rgb(30, 33, 40)',
    boxShadow: '0px 0px 15px rgba(21, 162, 235, 0.3)',
    overflow: 'hidden',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: '15px',
    fontSize: '18px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    height: '40px',
    filter: 'invert(1)',
  },
  messagesContainer: {
    flex: '1',
    padding: '10px',
    overflowY: 'auto',
    background: 'rgb(30, 33, 40)',
  },
  userMessage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: '10px',
    textAlign: 'right',
  },
  botMessage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: '10px',
    textAlign: 'left',
  },
  profilePic: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    marginLeft: '10px',
    marginRight: '10px',
  },
  messageText: {
    backgroundColor: 'rgb(199, 199, 199)',
    padding: '10px',
    borderRadius: '12px',
    maxWidth: '70%',
    wordBreak: 'break-word',
    color: 'black',
  },
  inputContainer: {
    display: 'flex',
    padding: '10px',
    borderTop: '1px solid #3C4377',
    backgroundColor: 'rgb(30, 33, 40)',
  },
  input: {
    flex: '1',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #3C4377',
    backgroundColor: 'rgb(44, 48, 56)',
    color: '#FFFFFF',
    marginRight: '10px',
  },
  sendButton: {
    padding: '10px 20px',
    borderRadius: '8px',
    backgroundColor: '#19A4F2',
    color: '#FFFFFF',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0px 0px 10px rgba(25, 164, 242, 0.5)',
  },
  loadingText: {
    textAlign: 'center',
    color: '#FFFFFF',
  },
  errorText: {
    textAlign: 'center',
    color: '#FF5A5A',
  }
};

export default Chatbot;
