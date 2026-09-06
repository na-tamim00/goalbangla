import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import { db } from './server/database';
import { runMigrations } from './server/db/migrations';
import { query } from './server/db/connection';
import {
  authenticateMiddleware, requireAuth, requirePermission, hasPermission,
  signToken, comparePassword, AuthUser
} from './server/services/auth';
import { storage } from './server/services/storage';
import { footballProvider } from './server/services/football';
import { loginRateLimiter } from './server/services/rateLimiter';

dotenv.config();

const PORT = 3000;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB
});

// Initialize Google GenAI lazily if key exists
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

async function startServer() {
  // Execute database migrations & seed verification before starting listening
  try {
    await runMigrations();
  } catch (err: any) {
    console.error('[Server Startup Warning]: Database migration check failed:', err.message);
  }

  const app = express();
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Central JSON parse error handler (prevents leaking stack traces or filesystem paths)
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400) {
      return res.status(400).json({ error: 'Malformed JSON payload provided' });
    }
    next(err);
  });

  // Security headers & Origin protection
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Global authentication extractor (Bearer token or dev role header)
  app.use(authenticateMiddleware);

  // Request logger
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      console.log(`[API] ${req.method} ${req.path} ${req.user ? `(User: ${req.user.role})` : '(Public)'}`);
    }
    next();
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      time: new Date().toISOString(),
      platform: 'GoalBangla Production Platform',
      version: '2.0.0'
    });
  });

  // ==========================================
  // AUTHENTICATION & RBAC ENDPOINTS
  // ==========================================

  // Login with email and password (throttled by IP and Account Identifier)
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || req.socket.remoteAddress || 'unknown';
      const cleanEmail = email.toLowerCase().trim();

      // Check Rate Limit on IP and Account Identifier
      const rateLimitStatus = await loginRateLimiter.evaluateLogin(clientIp, cleanEmail);
      if (!rateLimitStatus.allowed) {
        res.setHeader('Retry-After', rateLimitStatus.retryAfter.toString());
        return res.status(429).json({
          error: 'Too many failed login attempts. Please try again later.',
          retryAfter: rateLimitStatus.retryAfter,
          code: 'TOO_MANY_REQUESTS'
        });
      }

      const userRes = await query(
        `SELECT id, email, password_hash, name, role, avatar, status FROM users WHERE email = $1`,
        [cleanEmail]
      );

      if (userRes.rows.length === 0) {
        await loginRateLimiter.recordLoginFailure(clientIp, cleanEmail);
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const u = userRes.rows[0];
      const match = await comparePassword(password, u.password_hash);
      if (!match) {
        await loginRateLimiter.recordLoginFailure(clientIp, cleanEmail);
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Reset account rate limit counter on successful login
      await loginRateLimiter.resetLoginSuccess(clientIp, cleanEmail);

      const authUser: AuthUser = {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role
      };

      const token = signToken(authUser);
      await db.logAudit(authUser, 'USER_LOGIN', 'Auth', u.id, `User ${u.email} logged in successfully`, clientIp);

      res.json({
        token,
        user: {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          avatar: u.avatar
        }
      });
    } catch (err: any) {
      console.error('[Auth Login Error]:', err);
      res.status(500).json({ error: 'Authentication service error' });
    }
  });

  // Get current session user
  app.get('/api/auth/me', (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json({ user: req.user });
  });

  // Switch Role / Dev Demo Token Generator (strictly disabled in production)
  app.post('/api/auth/switch-role', async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        error: 'Role switching endpoint is strictly disabled in production environment',
        code: 'PRODUCTION_FORBIDDEN'
      });
    }

    try {
      const { role } = req.body;
      if (!role) {
        return res.status(400).json({ error: 'Role is required' });
      }

      // Find staff user with this role or create token for requested role
      const userRes = await query(
        `SELECT id, name, email, role, avatar FROM users WHERE role = $1 LIMIT 1`,
        [role]
      );

      let authUser: AuthUser;
      let avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

      if (userRes.rows.length > 0) {
        const u = userRes.rows[0];
        authUser = {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role
        };
        avatar = u.avatar;
      } else {
        authUser = {
          id: `usr-${role.toLowerCase().replace(/\s+/g, '-')}`,
          name: `${role} Officer`,
          email: `${role.toLowerCase().replace(/\s+/g, '')}@goalbangla.com`,
          role
        };
      }

      const token = signToken(authUser);
      res.json({
        token,
        user: {
          ...authUser,
          avatar
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // ARTICLES & EDITORIAL WORKFLOW
  // ==========================================

  app.get('/api/articles', async (req, res) => {
    try {
      const { lang, category, clubId, playerId, competitionId, status, search, tag, limit, offset } = req.query;
      const result = await db.getArticles({
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
      console.error('[GET /api/articles Error]:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/articles/:slug', async (req, res) => {
    try {
      const lang = (req.query.lang as any) || 'bn';
      const article = await db.getArticleBySlug(req.params.slug, lang);
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }
      res.json(article);
    } catch (err: any) {
      console.error('[GET /api/articles/:slug Error]:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/articles', requirePermission('article:create'), async (req, res) => {
    try {
      const user = req.user!;
      if (req.body.status === 'published' && !hasPermission(user.role, 'article:publish')) {
        return res.status(403).json({
          error: 'Forbidden: Only Editors and Admins are authorized to publish articles directly. Writers can save drafts or submit for review.',
          code: 'FORBIDDEN_PUBLISH_PERMISSION'
        });
      }
      const created = await db.createArticle(req.body, user);
      res.status(201).json(created);
    } catch (err: any) {
      console.error('[POST /api/articles Error]:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/articles/:id', requirePermission('article:edit'), async (req, res) => {
    try {
      const user = req.user!;
      if (req.body.status === 'published' && !hasPermission(user.role, 'article:publish')) {
        return res.status(403).json({
          error: 'Forbidden: Only Editors and Admins are authorized to publish articles. Writers can submit for review.',
          code: 'FORBIDDEN_PUBLISH_PERMISSION'
        });
      }
      const updated = await db.updateArticle(req.params.id, req.body, user);
      if (!updated) return res.status(404).json({ error: 'Article not found' });
      res.json(updated);
    } catch (err: any) {
      console.error('[PUT /api/articles/:id Error]:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/articles/:id', requirePermission('article:delete'), async (req, res) => {
    try {
      const user = req.user!;
      const success = await db.deleteArticle(req.params.id, user);
      if (!success) return res.status(404).json({ error: 'Article not found' });
      res.json({ success: true });
    } catch (err: any) {
      console.error('[DELETE /api/articles/:id Error]:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // BREAKING NEWS ALERTS
  // ==========================================

  app.get('/api/breaking-news', async (req, res) => {
    try {
      const all = req.query.all === 'true';
      const items = all ? await db.getAllBreakingNews() : await db.getBreakingNews();
      res.json(items);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/breaking-news', requirePermission('breaking:manage'), async (req, res) => {
    try {
      const user = req.user!;
      const item = await db.createBreakingNews(req.body, user);
      res.status(201).json(item);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/breaking-news/:id', requirePermission('breaking:manage'), async (req, res) => {
    try {
      const user = req.user!;
      const item = await db.updateBreakingNews(req.params.id, req.body, user);
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.json(item);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/breaking-news/:id', requirePermission('breaking:manage'), async (req, res) => {
    try {
      const user = req.user!;
      const ok = await db.deleteBreakingNews(req.params.id, user);
      if (!ok) return res.status(404).json({ error: 'Not found' });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // FOOTBALL DATA PROVIDER & MATCH CENTRE
  // ==========================================

  // Live matches from API-Football (or editorial matches if quota exceeded)
  app.get('/api/football/live', async (req, res) => {
    try {
      const data = await footballProvider.getLiveMatches();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Upcoming fixtures
  app.get('/api/football/fixtures', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const data = await footballProvider.getUpcomingMatches(limit);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Recent match results
  app.get('/api/football/results', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const data = await footballProvider.getRecentResults(limit);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Editorial Match Centre Matches
  app.get('/api/matches', async (req, res) => {
    try {
      const { competitionId, status, clubId } = req.query;
      const matches = await db.getMatches({
        competitionId: competitionId as string,
        status: status as string,
        clubId: clubId as string
      });
      res.json(matches);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Live matches route alias
  app.get('/api/matches/live', async (req, res) => {
    try {
      const data = await footballProvider.getLiveMatches();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/matches/:id', async (req, res) => {
    try {
      const match = await db.getMatchById(req.params.id);
      if (!match) return res.status(404).json({ error: 'Match not found' });
      res.json(match);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/matches/:id/score', requirePermission('match:update'), async (req, res) => {
    try {
      const user = req.user!;
      const match = await db.updateMatchScore(req.params.id, req.body, user);
      if (!match) return res.status(404).json({ error: 'Match not found' });
      res.json(match);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/matches/:id/events', requirePermission('match:update'), async (req, res) => {
    try {
      const user = req.user!;
      const match = await db.addMatchEvent(req.params.id, req.body, user);
      if (!match) return res.status(404).json({ error: 'Match not found' });
      res.json(match);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // CLUBS, PLAYERS, COMPETITIONS & STANDINGS
  // ==========================================

  app.get('/api/clubs', async (req, res) => {
    try {
      const { competitionId } = req.query;
      const clubs = await db.getClubs(competitionId as string);
      res.json(clubs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/clubs/:idOrSlug', async (req, res) => {
    try {
      const data = await db.getClubHubData(req.params.idOrSlug);
      if (!data) return res.status(404).json({ error: 'Club not found' });
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/players', async (req, res) => {
    try {
      const { clubId } = req.query;
      const players = await db.getPlayers(clubId as string);
      res.json(players);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/players/:idOrSlug', async (req, res) => {
    try {
      const data = await db.getPlayerHubData(req.params.idOrSlug);
      if (!data) return res.status(404).json({ error: 'Player not found' });
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/competitions', async (req, res) => {
    try {
      const competitions = await db.getCompetitions();
      res.json(competitions);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/competitions/:idOrSlug', async (req, res) => {
    try {
      const data = await db.getCompetitionHubData(req.params.idOrSlug);
      if (!data) return res.status(404).json({ error: 'Competition not found' });
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/standings/:competitionId', async (req, res) => {
    try {
      const standings = await db.getStandings(req.params.competitionId);
      res.json(standings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/standings/:competitionId', requirePermission('standings:update'), async (req, res) => {
    try {
      const user = req.user!;
      const rows = await db.updateStandings(req.params.competitionId, req.body.rows, user);
      res.json(rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // TRANSFERS & INJURIES
  // ==========================================

  app.get('/api/transfers', async (req, res) => {
    try {
      const { status } = req.query;
      const transfers = await db.getTransfers(status as string);
      res.json(transfers);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/transfers', requirePermission('transfer:manage'), async (req, res) => {
    try {
      const user = req.user!;
      const created = await db.createTransfer(req.body, user);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/injuries', async (req, res) => {
    try {
      const { clubId } = req.query;
      const injuries = await db.getInjuries(clubId as string);
      res.json(injuries);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/injuries', requirePermission('injury:manage'), async (req, res) => {
    try {
      const user = req.user!;
      const created = await db.createInjury(req.body, user);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // MEDIA, S3 STORAGE, GALLERIES, VIDEOS
  // ==========================================

  // Direct media upload to Supabase S3 storage
  app.post('/api/media/upload', requirePermission('media:create'), upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const uploadRes = await storage.upload(req.file.buffer, req.file.originalname, req.file.mimetype);
      const user = req.user!;

      // Save record in PostgreSQL media table
      const item = await db.addMedia({
        url: uploadRes.url,
        title: req.body.title || req.file.originalname,
        caption: req.body.caption,
        altText: req.body.altText || req.body.title,
        credit: req.body.credit || `${user.name} / GoalBangla`,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size
      }, user);

      res.status(201).json(item);
    } catch (err: any) {
      console.error('[Media Upload Error]:', err);
      const isValidationError = err.message && (
        err.message.includes('Unsupported file') ||
        err.message.includes('File size') ||
        err.message.includes('No file provided')
      );
      res.status(isValidationError ? 400 : 500).json({ error: err.message || 'File upload failed' });
    }
  });

  app.get('/api/media', async (req, res) => {
    try {
      const media = await db.getMedia();
      res.json(media);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/media', requirePermission('media:create'), async (req, res) => {
    try {
      const user = req.user!;
      const item = await db.addMedia(req.body, user);
      res.status(201).json(item);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/media/:id', requirePermission('media:delete'), async (req, res) => {
    try {
      const user = req.user!;
      const success = await db.deleteMedia(req.params.id, user);
      if (!success) return res.status(404).json({ error: 'Media item not found' });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/galleries', async (req, res) => {
    try {
      const galleries = await db.getGalleries();
      res.json(galleries);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/videos', async (req, res) => {
    try {
      const videos = await db.getVideos();
      res.json(videos);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/authors', async (req, res) => {
    try {
      const authors = await db.getAuthors();
      res.json(authors);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // GLOBAL SEARCH & HOMEPAGE CONFIG
  // ==========================================

  app.get('/api/search', async (req, res) => {
    try {
      const q = (req.query.q as string) || '';
      const lang = (req.query.lang as any) || 'bn';
      const results = await db.searchGlobal(q, lang);
      res.json(results);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/homepage-config', async (req, res) => {
    try {
      const config = await db.getHomepageConfig();
      res.json(config);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/homepage-config', requirePermission('settings:manage'), async (req, res) => {
    try {
      const user = req.user!;
      const updated = await db.updateHomepageConfig(req.body.sections, user);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // AUDIT LOGS & USERS (Protected by settings:manage permission)
  // ==========================================

  app.get('/api/audit-logs', requirePermission('settings:manage'), async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
      const logs = await db.getAuditLogs(limit);
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/users', requirePermission('settings:manage'), async (req, res) => {
    try {
      const users = await db.getUsers();
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // GEMINI AI EDITORIAL ASSISTANT
  // ==========================================

  app.post('/api/ai/editorial-assist', async (req, res) => {
    try {
      const { action, text, targetLang, context } = req.body;
      const ai = getAIClient();

      if (!ai) {
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

      let prompt = '';
      if (action === 'translate') {
        prompt = `You are a professional multilingual sports journalist for GoalBangla. Translate the following football editorial text into ${targetLang === 'en' ? 'fluent journalistic English' : 'fluent journalistic Bengali / Bangla (বাংলা)'}. Preserve sports excitement, player names, and technical terminology:\n\n${text}`;
      } else if (action === 'headline') {
        prompt = `Generate 4 punchy, journalistic football news headlines in ${targetLang === 'en' ? 'English' : 'Bangla'} for this story:\n\nContext: ${context || ''}\nContent: ${text}`;
      } else if (action === 'summary') {
        prompt = `Write a crisp 2-sentence journalistic summary in ${targetLang === 'en' ? 'English' : 'Bangla'} highlighting key stats and match takeaways:\n\n${text}`;
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

  // ==========================================
  // SEO: ROBOTS.TXT & SITEMAP.XML
  // ==========================================

  app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin\nSitemap: ${req.protocol}://${req.get('host')}/sitemap.xml\n`);
  });

  app.get('/sitemap.xml', async (req, res) => {
    try {
      const host = req.get('host') || 'goalbangla.com';
      const protocol = req.protocol || 'https';
      const baseUrl = `${protocol}://${host}`;

      const articlesRes = await db.getArticles({ limit: 100 });
      const clubs = await db.getClubs();
      const players = await db.getPlayers();

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

      const staticRoutes = ['', 'matches', 'transfers', 'standings', 'tactics', 'bangladesh-football', 'media', 'injuries', 'archive'];
      for (const route of staticRoutes) {
        xml += `  <url>\n    <loc>${baseUrl}/${route}</loc>\n    <changefreq>hourly</changefreq>\n    <priority>${route === '' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
      }

      for (const art of articlesRes.items) {
        xml += `  <url>\n    <loc>${baseUrl}/article/${art.slug}</loc>\n    <lastmod>${art.updatedAt || art.publishedAt || new Date().toISOString()}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
      }

      for (const c of clubs) {
        xml += `  <url>\n    <loc>${baseUrl}/club/${c.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
      }

      for (const p of players) {
        xml += `  <url>\n    <loc>${baseUrl}/player/${p.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
      }

      xml += `</urlset>`;
      res.type('application/xml');
      res.send(xml);
    } catch (err: any) {
      res.status(500).send('Error generating sitemap');
    }
  });

  // ==========================================
  // VITE / PRODUCTION STATIC MIDDLEWARE
  // ==========================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
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
