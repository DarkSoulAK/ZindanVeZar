import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST() {
  try {
    const prompt = `
      Sen RPG oyunları için karakter üreten bir uzmansın.
      Bana Rastgele, tutarlı ve etkileyici bir RPG karakteri oluştur.
      Yanıtı SADECE ve SADECE aşağıdaki JSON formatında ver, başka hiçbir açıklama yazma:

      {
        "name": "Karakter Adı",
        "race": "İnsan / Elf / Cüce / Ork vb.",
        "className": "Sınıf adı (Özel veya klasik)",
        "customClassDetails": "Sınıfın kısa açıklaması ve yetenekleri",
        "backstory": "2-3 cümlelik gizemli veya etkileyici geçmiş hikayesi",
        "appearance": "İngilizce olarak detaylı görünüş tanımı (görsel üretimi için kullanılacak, örn: A battle-scarred dwarf with a glowing rune hammer and golden armor)",
        "stats": {
          "str": 14,
          "dex": 12,
          "con": 15,
          "int": 8,
          "wis": 10,
          "cha": 11
        }
      }
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.8,
      response_format: { type: "json_object" }
    });

    const data = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return NextResponse.json({ character: data });
  } catch (error) {
    console.error("AI Generate Error:", error);
    return NextResponse.json({ error: "Karakter oluşturulamadı" }, { status: 500 });
  }
}
