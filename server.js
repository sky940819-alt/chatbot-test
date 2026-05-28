import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;

let currentApiKey = process.env.OPENAI_API_KEY || '';
let openai = new OpenAI({ apiKey: currentApiKey });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/config', (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(400).json({ error: 'apiKey 값을 전달해야 합니다.' });
  }

  currentApiKey = apiKey.trim();
  openai = new OpenAI({ apiKey: currentApiKey });
  res.json({ success: true, message: 'API 키가 등록되었습니다.' });
});

app.post('/api/chat', async (req, res) => {
  try {
    if (!currentApiKey) {
      return res.status(400).json({ error: 'API 키가 설정되지 않았습니다. 설정 화면에서 등록하세요.' });
    }

    const { messages, model, temperature, systemPrompt } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages 배열을 전달해야 합니다.' });
    }

    const userMessages = [
      { role: 'system', content: systemPrompt || 'You are a helpful assistant.' },
      ...messages,
    ];

    const response = await openai.chat.completions.create({
      model: model || 'gpt-3.5-turbo',
      messages: userMessages,
      temperature: typeof temperature === 'number' ? temperature : 0.7,
    });

    const answer = response.choices?.[0]?.message;
    if (!answer) {
      throw new Error('OpenAI 응답이 올바르지 않습니다.');
    }

    res.json({ answer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || '서버 처리 중 오류가 발생했습니다.' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
