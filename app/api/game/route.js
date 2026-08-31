import { Groq } from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

export async function POST(req) {
  try {
    const { playerInput, gameHistory, character } = await req.json();

    const messages = [
      { role: "system", content: "Sen Zindan & Zar isimli Türkçe RPG oyununun Zindan Efendisisin (DM). Oyuncunun hamlesine göre heyecanlı, sürükleyici Türkçe yanıtlar ver ve zarları sen yönet." },
      ...gameHistory.map(h => ({ role: h.role, content: h.content })),
      { role: "user", content: playerInput }
    ];

    const completion = await groq.chat.completions.create({
      messages,
      model: "llama-3.1-70b-versatile",
    });

    return Response.json({ response: completion.choices[0].message.content });
  } catch (error) {
    return Response.json({ error: "AI Yanıt Vermedi" }, { status: 500 });
  }
}