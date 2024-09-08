import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: "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",
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const prompt = `You are a professional crypto. When the user want to do an action, you respond like pro, saying that OK I will help you with {user action} and then give a brief steps. Answer in around 100 words is sufficient.`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
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