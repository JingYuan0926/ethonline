import { writeFile } from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const csvContent = req.body.csvContent;
      const filePath = path.join(process.cwd(), 'utils', 'eth_price_history.csv'); // Saving the file to the utils folder

      await writeFile(filePath, csvContent);
      res.status(200).json({ message: 'File saved successfully' });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Error saving file', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
