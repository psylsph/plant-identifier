import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 10;

async function identifyPlant(base64Image: string) {
  const apiKey = process.env.PLANT_ID_API_KEY;
  
  if (!apiKey) {
    throw new Error('API key not configured');
  }

  const data = {
    api_key: apiKey,
    images: [base64Image],
    modifiers: ["crops_fast", "similar_images"],
    plant_language: "en",
    plant_details: ["common_names", "url", "description", "taxonomy"]
  };

  const response = await fetch('https://api.plant.id/v2/identify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Plant.id API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function POST(request: Request) {
  try {
    if (!process.env.PLANT_ID_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const data = await request.formData();
    const file = data.get('image') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an image.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    const result = await identifyPlant(base64Image);

    if (!result.suggestions || result.suggestions.length === 0) {
      return NextResponse.json(
        { error: 'No plants identified' },
        { status: 404 }
      );
    }

    const plantInfo = {
      name: result.suggestions[0].plant_name,
      confidence: result.suggestions[0].probability,
      description: result.suggestions[0].plant_details?.description || {
        value: 'No description available',
        citation: '',
        license_name: '',
        license_url: ''
      },
      additionalLabels: result.suggestions.slice(1, 4).map((s: any) => ({
        name: s.plant_name,
        score: s.probability
      }))
    };

    return NextResponse.json(plantInfo);
  } catch (error) {
    console.error('Error in plant identification:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
