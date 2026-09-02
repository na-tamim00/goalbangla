import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { db } from './server/database';

dotenv.config();

const PORT = 3000;

// Initialize Google GenAI lazily if key exists
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Request logger
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // Current user helper middleware (supports switching role in headers or defaults to Super Admin)
  const getCurrentUser = (req: express.Request) => {
    const role = (req.headers['x-user-role'] as string) || 'Super Admin';
    const userId = (req.headers['x-user-id'] as string) || 'usr-1';
    const userName = (req.headers['x-user-name'] as string) || 'Tanvir Ahmed (Editor)';
    return { id: userId, name: userName, role };
  };

  // --- API Endpoints ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString(), platform: 'GoalBangla' });
  });

  // --- Articles ---
  app.get('/api/articles', (req, res) => {
    try {
      const { lang, category, clubId, playerId, competitionId, status, search, tag, limit, offset } = req.query;
      const result = db.getArticles({
        lang: (lang as any) || 'bn',
        category: category as string,
        clubId: clubId as string,
        playerId: playerId as string,
        competitionId: competitionId as string,
        status: status as any,
        search: search as string,
        tag: tag as string,
        limit: limit ? parseInt(limit as string, 10) : 20,
        offset: offset ? parseInt(offset as string, 10) : 0
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/articles/:slug', (req, res) => {
    try {
      const article = db.getArticleBySlug(req.params.slug);
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }
      res.json(article);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/articles', (req, res) => {
    try {
      const user = getCurrentUser(req);
      const created = db.createArticle(req.body, user);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/articles/:id', (req, res) => {
    try {
      const user = getCurrentUser(req);
      const updated = db.updateArticle(req.params.id, req.body, user);
      if (!updated) return res.status(404).json({ error: 'Article not found' });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/articles/:id', (req, res) => {
    try {
      const user = getCurrentUser(req);
      const success = db.deleteArticle(req.params.id, user);
      if (!success) return res.status(404).json({ error: 'Article not found' });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Breaking News ---
  app.get('/api/breaking-news', (req, res) => {
    try {
      const all = req.query.all === 'true';
      const items = all ? db.getAllBreakingNews() : db.getBreakingNews();
      res.json(items);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/breaking-news', (req, res) => {
    try {
      const user = getCurrentUser(req);
      const item = db.createBreakingNews(req.body, user);
      res.status(201).json(item);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/breaking-news/:id', (req, res) => {
    try {
      const user = getCurrentUser(req);
      const item = db.updateBreakingNews(req.params.id, req.body, user);
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.json(item);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/breaking-news/:id', (req, res) => {
    try {
      const user = getCurrentUser(req);
      const ok = db.deleteBreakingNews(req.params.id, user);
      if (!ok) return res.status(404).json({ error: 'Not found' });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Matches & Live Centre ---
  app.get('/api/matches', (req, res) => {
    try {
      const { competitionId, status, clubId } = req.query;
      const matches = db.getMatches({
        competitionId: competitionId as string,
        status: status as string,
        clubId: clubId as string
      });
      res.json(matches);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/matches/:id', (req, res) => {
    try {
      const match = db.getMatchById(req.params.id);
      if (!match) return res.status(404).json({ error: 'Match not found' });
      res.json(match);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/matches/:id/score', (req, res) => {
    try {
      const user = getCurrentUser(req);
      const match = db.updateMatchScore(req.params.id, req.body, user);
      if (!match) return res.status(404).json({ error: 'Match not found' });
      res.json(match);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/matches/:id/events', (req, res) => {
    try {
      const user = getCurrentUser(req);
      const match = db.addMatchEvent(req.params.id, req.body, user);
      if (!match) return res.status(404).json({ error: 'Match not found' });
      res.json(match);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Clubs & Players ---
  app.get('/api/clubs', (req, res) => {
    try {
      const { competitionId } = req.query;
      res.json(db.getClubs(competitionId as string));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/clubs/:idOrSlug', (req, res) => {
    try {
      const data = db.getClubHubData(req.params.idOrSlug);
      if (!data) return res.status(404).json({ error: 'Club not found' });
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/players', (req, res) => {
    try {
      const { clubId } = req.query;
      res.json(db.getPlayers(clubId as string));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/players/:idOrSlug', (req, res) => {
    try {
      const data = db.getPlayerHubData(req.params.idOrSlug);
      if (!data) return res.status(404).json({ error: 'Player not found' });
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Competitions & Standings ---
  app.get('/api/competitions', (req, res) => {
    try {
      res.json(db.getCompetitions());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/competitions/:idOrSlug', (req, res) => {
    try {
      const data = db.getCompetitionHubData(req.params.idOrSlug);
      if (!data) return res.status(404).json({ error: 'Competition not found' });
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/standings/:competitionId', (req, res) => {
    try {
      res.json(db.getStandings(req.params.competitionId));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/standings/:competitionId', (req, res) => {
    try {
      const user = getCurrentUser(req);
      const rows = db.updateStandings(req.params.competitionId, req.body.rows, user);
      res.json(rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Transfers & Injuries ---
  app.get('/api/transfers', (req, res) => {
    try {
      const { status } = req.query;
      res.json(db.getTransfers(status as string));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/transfers', (req, res) => {
    try {
      const user = getCurrentUser(req);
      const created = db.createTransfer(req.body, user);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/injuries', (req, res) => {
    try {
      const { clubId } = req.query;
      res.json(db.getInjuries(clubId as string));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/injuries', (req, res) => {
    try {
      const user = getCurrentUser(req);
      const created = db.createInjury(req.body, user);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Media, Galleries, Videos ---
  app.get('/api/media', (req, res) => {
    try {
      res.json(db.getMedia());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/media', (req, res) => {
    try {
      const user = getCurrentUser(req);
      const item = db.addMedia(req.body, user);
      res.status(201).json(item);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/galleries', (req, res) => {
    try {
      res.json(db.getGalleries());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/videos', (req, res) => {
    try {
      res.json(db.getVideos());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/authors', (req, res) => {
    try {
      res.json(db.getAuthors());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Global Search ---
  app.get('/api/search', (req, res) => {
    try {
      const q = (req.query.q as string) || '';
      const lang = (req.query.lang as any) || 'bn';
      const results = db.searchGlobal(q, lang);
      res.json(results);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Homepage Config ---
  app.get('/api/homepage-config', (req, res) => {
    try {
      res.json(db.getHomepageConfig());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/homepage-config', (req, res) => {
    try {
      const user = getCurrentUser(req);
      const updated = db.updateHomepageConfig(req.body.sections, user);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Audit Logs ---
  app.get('/api/audit-logs', (req, res) => {
    try {
      res.json(db.getAuditLogs());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Users ---
  app.get('/api/users', (req, res) => {
    try {
      res.json(db.getUsers());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- AI Editorial Assistant API ---
  app.post('/api/ai/editorial-assist', async (req, res) => {
    try {
      const { action, text, targetLang, context } = req.body;
      const ai = getAIClient();

      if (!ai) {
        // Fallback simulation when API key is not configured
        if (action === 'translate') {
          return res.json({
            result: targetLang === 'en' 
              ? `[EN Translation]: ${text}`
              : `[বাংলা অনুবাদ]: ${text}`,
            mode: 'fallback'
          });
        } else if (action === 'headline') {
          return res.json({
            headlines: [
              `সরাসরি প্রতিবেদন: ${text?.slice(0, 40)}...`,
              `ম্যাচ ডে বিশ্লেষণ ও এক্সক্লুসিভ রিপোর্ট`,
              `দলবদলের নতুন মোড় ও কৌশলগত পর্যালোচনা`
            ],
            mode: 'fallback'
          });
        } else if (action === 'summary') {
          return res.json({
            summary: `সংক্ষিপ্ত সারসংক্ষেপ: ${text?.slice(0, 150)}...`,
            mode: 'fallback'
          });
        }
      }

      // If AI is configured, generate high quality editorial copy
      let prompt = '';
      if (action === 'translate') {
        prompt = `You are a professional multilingual sports journalist. Translate the following football editorial content into ${targetLang === 'en' ? 'fluent journalistic English' : 'fluent journalistic Bengali / Bangla (বাংলা)'}. Maintain professional sports terminology, excitement, and natural news phrasing:\n\n${text}`;
      } else if (action === 'headline') {
        prompt = `Generate 4 punchy, high-engagement sports news headlines in ${targetLang === 'en' ? 'English' : 'Bangla'} for this football story:\n\nContext: ${context || ''}\nContent: ${text}`;
      } else if (action === 'summary') {
        prompt = `Write a concise 2-sentence journalistic summary in ${targetLang === 'en' ? 'English' : 'Bangla'} highlighting key stats and outcome for this football article:\n\n${text}`;
      } else if (action === 'tactical_analysis') {
        prompt = `Draft a tactical breakdown paragraph discussing formations, pressing structures, and key tactical moments based on this match summary:\n\n${text}`;
      }

      const response = await ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      res.json({
        result: response.text,
        mode: 'gemini'
      });
    } catch (err: any) {
      console.error('AI assistant error:', err);
      res.status(500).json({ error: err.message || 'AI generation failed' });
    }
  });

  // --- Vite / Static Middleware Setup ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[GoalBangla Server] Running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
