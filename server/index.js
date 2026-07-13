import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import { HOST, PORT } from './network.js';
import { generateTailoredContent } from './openRouter.js';
import { buildDocxBuffer } from './docxBuilder.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();

app.use(cors({
  origin: ['http://127.0.0.1:5173', 'http://localhost:5173'],
}));
app.use(express.json({ limit: '2mb' }));

function getDownloadsPath() {
  const home = os.homedir();
  const candidates = [
    path.join(home, 'Downloads'),
    path.join(home, 'download'),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir;
  }
  return home;
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    hasApiKey: Boolean(process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'your_openrouter_api_key_here'),
    model: process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001',
  });
});

app.post('/api/tailor', async (req, res) => {
  try {
    const { jobDescription, resume } = req.body;
    if (!jobDescription?.trim()) {
      return res.status(400).json({ error: 'Job description is required.' });
    }
    if (!resume) {
      return res.status(400).json({ error: 'Resume data is required.' });
    }

    const tailored = await generateTailoredContent(jobDescription, resume);
    res.json(tailored);
  } catch (err) {
    console.error('Tailor error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to tailor resume.' });
  }
});

app.post('/api/download', async (req, res) => {
  try {
    const { resume, jobTitle } = req.body;
    if (!resume) {
      return res.status(400).json({ error: 'Resume data is required.' });
    }

    const buffer = await buildDocxBuffer(resume);
    const safeTitle = (jobTitle || 'Resume')
      .replace(/[^a-zA-Z0-9\s-_]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .slice(0, 50) || 'Resume';
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `Resume_${safeTitle}_${timestamp}.docx`;

    const downloadsPath = getDownloadsPath();
    const filePath = path.join(downloadsPath, filename);
    fs.writeFileSync(filePath, buffer);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('X-Saved-Path', filePath);
    res.send(buffer);
  } catch (err) {
    console.error('Download error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to generate resume file.' });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Resume Writer API running on http://${HOST}:${PORT}`);
});
