import React, { useState } from 'react';
import ChatBot from '../components/Chatbox';
import Bubble from '../components/Bubble';
import Header from '../components/Header';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setResponse("This is a sample response. In a real application, this would be the AI's reply.");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <>
      <ChatBot />
      <Bubble />
      <Header />
      <br />
      <br />
      <div style={{
        margin: '0 auto',
        padding: '32px 16px',
        maxWidth: '60%',
        position: 'relative',
        backgroundColor: '#1E2128',
        color: '#FFFFFF',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '24px',
          textAlign: 'center',
          color: '#c7c7c7'
        }}>AI Crypto Swap Assistant</h1>
        <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex' }}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g., How can I swap ETH to SOL?"
              style={{
                flexGrow: 1,
                padding: '12px',
                backgroundColor: '#2C3038',
                color: '#FFFFFF',
                border: '1px solid #3D4148',
                borderRadius: '4px 0 0 4px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                backgroundColor: '#512DA8',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '0 4px 4px 0',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '120px',
                transition: 'background-color 0.3s ease',
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
        {response && (
          <div style={{
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: '#2C3038',
            color: '#FFFFFF',
            textAlign: 'left'
          }}>
            <p>{response}</p>
            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
              <button
                style={{
                  backgroundColor: '#3DACF7',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  width: '48%',
                }}
              >
                Confirm
              </button>
              <button
                onClick={() => setResponse('')}
                style={{
                  backgroundColor: '#512DA8',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  width: '48%'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Chat;