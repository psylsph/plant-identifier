import { Groq } from 'groq-sdk';
import { NextResponse } from 'next/server';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const maxDuration = 30;

const MAX_DIMENSION = 1024;
const JPEG_QUALITY = 80;
const MAX_INPUT_BYTES = 20 * 1024 * 1024; // 20MB safety cap

const groq = new Groq();

async function identifyPlant(base64Image: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('API key not configured');
  }

  const prompt = `What plant is in this image?
  1. Be specific about the plant type
  2. Give a certainty score out of 100%
  3. Provide details of the type of plant
  4. If the plant is healthy or the disease it might have if unhealthy
  5. Some information on how to care for the plant

  Format your response as JSON with this structure:
  {
    "name": "plant name",
    "confidence": "certainty percentage",
    "details": "plant details",
    "healthy": "if the plant is healthy or the disease it might have if unhealthy",
    "care": "some information on how to care for the plant"
  }`;

  const imageString = "data:image/jpeg;base64," + base64Image;

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageString } },
        ],
      },
    ],
    model: 'qwen/qwen3.6-27b',
    temperature: 0.7,
    top_p: 0.8,
    max_completion_tokens: 4096,
    reasoning_format: 'hidden',
    stream: false,
  });

  let rawContent = chatCompletion.choices?.[0]?.message?.content ?? '';
  if (!rawContent) {
    throw new Error('Empty response from API');
  }

  // Strip markdown code fences if present
  rawContent = rawContent.trim();
  if (rawContent.startsWith('```')) {
    rawContent = rawContent.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  }

  // Try to find the JSON object in the response
  const firstBrace = rawContent.indexOf('{');
  const lastBrace = rawContent.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    rawContent = rawContent.slice(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(rawContent);
  } catch (err) {
    console.error('Failed to parse plant info. Raw content:', rawContent);
    throw new Error('Invalid response format from API');
  }
}

async function resizeImage(buffer: Buffer): Promise<Buffer> {
  const image = sharp(buffer, { failOn: 'none' });
  const metadata = await image.metadata();

  // Resize down if either dimension exceeds the cap, preserving aspect ratio.
  const needsResize =
    (metadata.width && metadata.width > MAX_DIMENSION) ||
    (metadata.height && metadata.height > MAX_DIMENSION);

  const pipeline = needsResize
    ? image.resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true,
      })
    : image;

  return pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
}

export async function POST(request: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const data = await request.formData();
    const file = data.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an image.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_INPUT_BYTES) {
      return NextResponse.json(
        { error: 'Image too large. Please upload a photo under 20MB.' },
        { status: 413 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let resized: Buffer;
    try {
      resized = await resizeImage(buffer);
    } catch (err) {
      console.error('Image processing failed:', err);
      return NextResponse.json(
        { error: 'Could not process the image. Try a different photo.' },
        { status: 400 }
      );
    }

    const base64Image = resized.toString('base64');
    const result = await identifyPlant(base64Image);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in plant identification:', error);
    return NextResponse.json(
      {
        error: 'Failed to process image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}