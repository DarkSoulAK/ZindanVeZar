import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY;
  const randomId = Math.floor(Math.random() * 800);

  // API Key tanımlı değilse çökme, direkt hazır AI karakterini bas
  if (!apiKey) {
    return NextResponse.json({
      character: {
        name: "Valerius Shadowblade",
        race: "Elf",
        className: "Savaşçı",
        appearance: "Sol gözü yaralı, siyah zırhlı ve gümüş saçlı bir savaşçı",
        backstory: "Kuzey krallıklarının yıkılışından sonra intikam yemini etmiş eski bir muhafız.",
        avatarUrl: `https://picsum.photos/seed/${randomId}/512/512`,
        stats: { str: 16, dex: 14, con: 14, int: 10, wis: 12, cha: 8 }
      }
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `RPG oyunu için rastgele bir karakter oluştur. Sadece geçerli bir JSON nesnesi döndür (markdown veya ek açıklama yazma):
    {
      "name": "Karakter Adı",
      "race": "İnsan",
      "className": "Savaşçı",
      "appearance": "Sol gözü yaralı, siyah zırhlı bir savaşçı",
      "backstory": "Eski bir krallık muhafızı.",
      "stats": {"str": 14, "dex": 12, "con": 13, "int": 10, "wis": 11, "cha": 9}
    }`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const charData = JSON.parse(text);

    return NextResponse.json({
      character: {
        ...charData,
        avatarUrl: `https://picsum.photos/seed/${randomId}/512/512`
      }
    });

  } catch (error) {
    // API veya Parsing hatası durumunda yedek karaktere düş
    return NextResponse.json({
      character: {
        name: "Kaelen the Red",
        race: "İnsan",
        className: "Büyücü",
        appearance: "Kırmızı pelerinli, elinde asa tutan yaşlı büyücü",
        backstory: "Akademi patronlarından kaçan yasaklı bir büyücü.",
        avatarUrl: `https://picsum.photos/seed/${randomId}/512/512`,
        stats: { str: 8, dex: 12, con: 10, int: 18, wis: 15, cha: 11 }
      }
    });
  }
}
