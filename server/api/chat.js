import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: body.message }]
  });

  return response.choices[0].message.content;
});
