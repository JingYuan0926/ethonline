import OpenAI from 'openai';

const openai = new OpenAI({
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const prompt = `You are a professional crypto assistant. The user wants to transfer tokens from Ethereum to either Polygon or Arbitrum. Provide a brief step-by-step guide for the process they mentioned. If they didn't specify Polygon or Arbitrum, ask them which one they prefer. Answer in around 100 words. User message: ${message}`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant specializing in cryptocurrency and blockchain technology.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
        top_p: 1,
      });

      return res.status(200).json({ message: response.choices[0].message.content.trim() });
    } catch (error) {
      console.error('OpenAI API Error:', error);
      
      if (error.response) {
        console.error(error.response.status, error.response.data);
        return res.status(error.response.status).json(error.response.data);
      } else {
        return res.status(500).json({ error: 'An error occurred while processing your request' });
      }
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}