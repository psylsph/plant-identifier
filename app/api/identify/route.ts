import { Groq } from 'groq-sdk';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 10;

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
      "messages": [
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": prompt
            },
            {
              "type": "image_url",
              "image_url": {
                "url": imageString,
              }
            }
          ]
        }
      ],
      "model": "meta-llama/llama-4-scout-17b-16e-instruct",
      "temperature": 0.2,
      "max_completion_tokens": 1024,
      "top_p": 1,
      "stream": false,
      "stop": null
    });



  let rawContent = chatCompletion.choices[0].message.content;
  try {
    // Remove markdown code block if present
    if (rawContent.startsWith('```json\n')) {
      rawContent = rawContent.substring(8, rawContent.lastIndexOf('```'));
    } else if (rawContent.startsWith('```\n')) {
      rawContent = rawContent.substring(4, rawContent.lastIndexOf('```'));
    }
    const plantInfo = JSON.parse(rawContent);
    return plantInfo;
  } catch (error) {
    console.error('Failed to parse plant info:', error);
    throw new Error('Invalid response format from API');
  }

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

    return NextResponse.json(result);
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
