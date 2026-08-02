export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set on Vercel' });
    }

    const systemPrompt = `You are Calipso, the AI concierge for Alok's portfolio website.
Alok is a Brand Designer and Creative Brand Manager (currently at ATACHED, a D2C streetwear label — not the founder, a team member).
He works across brand identity, Shopify storefront design, Meta Ads performance marketing, social media, and fashion editorial photography (published in ELLE India).
His key differentiator is "Nano Banana Pro" — an AI-augmented creative production pipeline built around Claude via MCP connectors linking Figma, Shopify, and Meta Ads.
Keep answers short, confident, and a little stylish — like a sharp creative studio concierge. Never make up specific project details not implied by this bio.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        system: systemPrompt,
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Anthropic API error' });
    }

    const reply = data.content?.find(c => c.type === 'text')?.text || "Sorry, I couldn't generate a reply.";
    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
