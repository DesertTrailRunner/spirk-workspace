/**
 * ChatGPT API
 */
import OpenAI from 'openai';

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

export async function sendMessage(agent: Agent, messages: Array<{ role: 'user' | 'assistant'; content: string }>): Promise<string> {
  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });
  const model = import.meta.env.VITE_OPENAI_MODEL,
    temperature = 0.7;
  if (!openai.apiKey) throw new Error('OPENAI_API_KEY is not configured.');

  if (messages.length > 0 && messages[0] != undefined && messages[0].content != undefined) {

    const knowledge = agent.knowledge?.length ? `\n\nSearch the following sources and include in your response:\n${agent.knowledge.map((source) => `- ${source}`).join('\n')}` : '';

    const content = `You are ${agent.name}. Purpose: ${agent.purpose}\nPersonality: ${agent.personality || 'Helpful, thoughtful, and clear.'}${knowledge}\n\nUser: ${messages[0].content}`;

    console.log(content);

    const response = await openai.responses.create({
      model: "gpt-4.1",
      tools: [{ type: "web_search" }],
      input: content
    });

    console.log(response.output);

    return response.output_text;
  } else {
    throw new Error('Invalid chat request.');
  }

  // const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
  //   method: 'POST',
  //   headers: { Authorization: `Bearer ${openai.apiKey}`, 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ model, temperature, messages: [{ role: 'system', content: `You are ${agent.name}. Purpose: ${agent.purpose}\nPersonality: ${agent.personality || 'Helpful, thoughtful, and clear.'}${knowledge}` }, ...messages] }),
  // })
  // const data = await openAiResponse.json()
  // if (!openAiResponse.ok) throw new Error(data.error?.message || 'OpenAI request failed.')
  // return data.choices?.[0]?.message?.content || 'I was not able to generate a response.'
}

// export default async function handler(request: Request): Promise<Response> {
//   if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 })
//   const apiKey = process.env.OPENAI_API_KEY
//   if (!apiKey) return Response.json({ error: 'OPENAI_API_KEY is not configured.' }, { status: 500 })
//   try {
//     const { agent, messages } = await request.json() as ChatRequest
//     if (!agent?.name || !Array.isArray(messages)) return Response.json({ error: 'Invalid chat request.' }, { status: 400 })
//     const knowledge = agent.knowledge?.length ? `\n\nKnowledge sources:\n${agent.knowledge.map((source) => `- ${source}`).join('\n')}` : ''
//     const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
//       method: 'POST',
//       headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
//       body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4o', temperature: 0.7, messages: [{ role: 'system', content: `You are ${agent.name}. Purpose: ${agent.purpose}\nPersonality: ${agent.personality || 'Helpful, thoughtful, and clear.'}${knowledge}` }, ...messages] }),
//     })
//     const data = await openAiResponse.json()
//     if (!openAiResponse.ok) return Response.json({ error: data.error?.message || 'OpenAI request failed.' }, { status: openAiResponse.status })
//     return Response.json({ content: data.choices?.[0]?.message?.content || 'I was not able to generate a response.' })
//   } catch {
//     return Response.json({ error: 'Could not process the chat request.' }, { status: 400 })
//   }
// }
