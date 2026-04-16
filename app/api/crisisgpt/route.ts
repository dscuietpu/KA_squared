import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { crisisState, userQuery } = await req.json();

    const systemPrompt = `You are CrisisGPT, an AI disaster response coordinator 
for Uttarakhand district disaster management authority.
Give CONCISE, ACTIONABLE recommendations in 2-3 sentences max.
Always mention: which team to send where, via which route.
Flag any resource conflicts (two teams needing the same road).
Speak like an operations commander — direct, clear, no fluff.`;

    const userPrompt = userQuery
      ? `Crisis state: ${JSON.stringify(crisisState)}\n\nCoordinator asks: ${userQuery}`
      : `Analyze this crisis and give optimal dispatch recommendation: ${JSON.stringify(crisisState)}`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 300,
      temperature: 0.3,
    });

    const response = completion.choices[0].message.content;
    return NextResponse.json({ response });

  } catch (error) {
    console.error('CrisisGPT error:', error);
    return NextResponse.json({ error: 'CrisisGPT failed' }, { status: 500 });
  }
}