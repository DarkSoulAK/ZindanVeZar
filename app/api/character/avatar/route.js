import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { prompt } = await req.json();
    
    // Pollinations AI (Ücretsiz, API Key gerektirmeyen görsel motoru)
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Avatar Error:", error);
    return NextResponse.json({ error: "Görsel üretilemedi" }, { status: 500 });
  }
}
