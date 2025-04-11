import { OpenAI } from 'openai';
import { config } from './config';

if (!config.openai.apiKey) {
  throw new Error('OPENAI_API_KEY is not defined in environment variables');
}

export const openaiClient = new OpenAI({
  apiKey: config.openai.apiKey,
});
