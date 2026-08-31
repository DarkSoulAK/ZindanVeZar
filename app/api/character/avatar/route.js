import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { prompt } = await req.json();
    
    // Prompt'u temizle ve gereksiz karakterleri süz
    const cleanPrompt = encodeURIComponent(
      (prompt || "fantasy rpg warrior character portrait")
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .trim()
    );

    // Rastgele seed ekleyerek önbellek (cache) sorunlarını önle
    const randomSeed = Math.floor(Math.random() * 10000);
    const imageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=512&height=512&nologo=true&seed=${randomSeed}`;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Avatar Error:", error);
    return NextResponse.json({ error: "Görsel üretilemedi" }, { status: 500 });
  }
}
