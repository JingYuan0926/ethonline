// pages/index.js

import { useState } from 'react';

export default function Chatbot() {
  const [userInput, setUserInput] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/chat?chatQuery=${encodeURIComponent(userInput)}&model=gpt-4o`, {
        method: 'GET',
      });

      const data = await res.json();
      // Extract only the body message content from the JSON response
      setResponse(data.message);
    } catch (error) {
      console.error('Error fetching data:', error);
      setResponse('Error fetching response from agent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Chat with the Agent</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your query..."
          required
        />
        <button type="submit">Send</button>
      </form>

      {loading && <p>Loading...</p>}
      {response && <div><h3>Response from Agent:</h3><p>{response}</p></div>}
    </div>
  );
}