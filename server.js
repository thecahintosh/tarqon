import express from 'express';
import { Groq } from 'groq-sdk';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    const knowledge = JSON.parse(readFileSync(join(__dirname, 'data', 'knowledge.json'), 'utf8'));

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are Tarqon Intelligence's AI assistant. Only use the supplied knowledge. If information is unavailable, say "I don't have enough information about that. Please contact Tarqon Intelligence directly." Be concise and professional.\n\nKnowledge:\n${JSON.stringify(knowledge, null, 2)}`
        },
        ...history.slice(-10),
        { role: 'user', content: message }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    res.json({ answer: completion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(3000, () => console.log('Tarqon running on http://localhost:3000'));