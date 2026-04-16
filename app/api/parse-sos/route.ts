import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { message, district } = await req.json();

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You parse Hindi/English disaster SOS messages.
Return ONLY a JSON object, nothing else, no markdown:
{
  "severity": "CRITICAL|HIGH|MEDIUM|LOW",
  "type": "flood|landslide|stranded|injury|other",
  "summary": "one sentence in English",
  "peopleCount": number or null,
  "needsImmediateRescue": boolean
}`,
        },
        {
          role: 'user',
          content: `District: ${district}\nMessage: "${message}"`,
        },
      ],
      max_tokens: 150,
      temperature: 0.1,
    });

    const raw = completion.choices[0].message.content || '{}';
    const clean = raw.replace(/```json|```/g, '').trim();

    try {
      const parsed = JSON.parse(clean);
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({
        severity: 'HIGH',
        type: 'other',
        summary: raw,
        peopleCount: null,
        needsImmediateRescue: true,
      });
    }

  } catch (error) {
    console.error('SOS parser error:', error);
    return NextResponse.json({ error: 'Parser failed' }, { status: 500 });
  }
}