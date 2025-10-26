import { NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(req: Request) {
  try {
    const imageBuffer = Buffer.from(await req.arrayBuffer());
    const processed = await sharp(imageBuffer)
      .greyscale()
      .threshold(100)
      .blur(0.3)
      .sharpen({ sigma: 1, m1: 1, m2: 3 })
      .normalize()
      .png()
      .toBuffer();

    return new Response(new Uint8Array(processed), {
      status: 200,
      headers: { 'Content-Type': 'image/png' },
    });
  } catch (error) {
    console.error('Preprocessing Error:', error);
    return NextResponse.json({ error: 'Failed to preprocess image' }, { status: 500 });
  }
}