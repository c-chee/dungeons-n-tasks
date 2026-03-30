import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are a wise wizard mentor in a fantasy RPG helping an adventurer. 
The adventurer is stuck on a quest. Provide encouraging, practical advice in 2-3 sentences.
Be specific to their situation if possible. Be warm and supportive.`;

function sanitizeInput(input) {
    if (!input || typeof input !== 'string') return '';
    
    return input
        .slice(0, 500)
        .replace(/[\x00-\x1F\x7F]/g, '')
        .replace(/<[^>]*>/g, '')
        .trim();
}

function validateOutput(output) {
    if (!output || typeof output !== 'string') return false;
    if (output.length > 1000) return false;
    if (/<script|javascript:|on\w+=/i.test(output)) return false;
    return true;
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { userMessage, questTitle, questDescription } = body;

        if (!userMessage || typeof userMessage !== 'string') {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        const apiKey = process.env.HUGGINGFACE_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'AI service not configured. Please add HUGGINGFACE_API_KEY to environment.' },
                { status: 500 }
            );
        }

        const sanitizedMessage = sanitizeInput(userMessage);
        const sanitizedTitle = sanitizeInput(questTitle);
        const sanitizedDescription = sanitizeInput(questDescription);

        const questContext = sanitizedTitle || sanitizedDescription
            ? `\n\nQuest Context:\nTitle: ${sanitizedTitle}\nDescription: ${sanitizedDescription}`
            : '';

        const userPrompt = `System: ${SYSTEM_PROMPT}${questContext}\n\nAdventurer: ${sanitizedMessage}\nWizard:`;

        const response = await fetch(
            'https://api-inference.huggingface.co/models/Qwen/Qwen2.5-7B-Instruct/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'Qwen/Qwen2.5-7B-Instruct',
                    messages: [
                        { role: 'user', content: userPrompt }
                    ],
                    max_tokens: 200,
                    temperature: 0.7
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('HuggingFace API error:', response.status, errorData);
            
            if (response.status === 503) {
                return NextResponse.json(
                    { error: 'The wizard is temporarily unavailable. Please try again in a moment.' },
                    { status: 503 }
                );
            }
            
            return NextResponse.json(
                { error: 'Failed to consult the wizard. Please try again.' },
                { status: 500 }
            );
        }

        const data = await response.json();
        const suggestion = data.choices?.[0]?.message?.content?.trim();

        if (!validateOutput(suggestion)) {
            return NextResponse.json(
                { error: 'Received invalid response from wizard. Please try again.' },
                { status: 500 }
            );
        }

        return NextResponse.json({ suggestion });

    } catch (error) {
        console.error('Wizard API error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        );
    }
}
