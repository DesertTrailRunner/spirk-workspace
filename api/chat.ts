type Agent = {
  name: string
  purpose: string
  personality: string
  knowledge: string[]
}

type ChatRequest = {
  agent: Agent
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 })
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return Response.json({ error: 'OPENAI_API_KEY is not configured.' }, { status: 500 })
  try {
    const { agent, messages } = await request.json() as ChatRequest
    if (!agent?.name || !Array.isArray(messages)) return Response.json({ error: 'Invalid chat request.' }, { status: 400 })
    const knowledge = agent.knowledge?.length ? `\n\nKnowledge sources:\n${agent.knowledge.map((source) => `- ${source}`).join('\n')}` : ''
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', temperature: 0.7, messages: [{ role: 'system', content: `You are ${agent.name}. Purpose: ${agent.purpose}\nPersonality: ${agent.personality || 'Helpful, thoughtful, and clear.'}${knowledge}` }, ...messages] }),
    })
    const data = await openAiResponse.json()
    if (!openAiResponse.ok) return Response.json({ error: data.error?.message || 'OpenAI request failed.' }, { status: openAiResponse.status })
    return Response.json({ content: data.choices?.[0]?.message?.content || 'I was not able to generate a response.' })
  } catch {
    return Response.json({ error: 'Could not process the chat request.' }, { status: 400 })
  }
}
