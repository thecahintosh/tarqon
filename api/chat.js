import { Groq } from "groq-sdk";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const knowledge = require("../data/knowledge.json");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, history = [] } = req.body;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are Tarqon Intelligence's AI assistant. Only use the supplied knowledge. If information is unavailable, say "I don't have enough information about that. Please contact Tarqon Intelligence directly." Be concise and professional.\n\nKnowledge:\n${JSON.stringify(knowledge, null, 2)}`
        },
        ...history.slice(-10),
        { role: "user", content: message }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    return res.status(200).json({
      answer: completion.choices[0].message.content
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
