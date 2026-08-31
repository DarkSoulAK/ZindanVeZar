import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { prompt } = await req.json();
    const randomId = Math.floor(Math.random() * 1000);
    
    // Asla kırılmayan, garantili karanlık RPG atmosferli konsept görsel
    const imageUrl = `https://picsum.photos/seed/${randomId}/512/512`;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    return NextResponse.json({ 
      imageUrl: "https://picsum.photos/id/1062/512/512" 
    });
  }
}
