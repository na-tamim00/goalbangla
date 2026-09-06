import { 
  Article, Club, Player, Competition, Match, Transfer, Injury, 
  BreakingNews, Author, MediaItem, Gallery, VideoItem, HomepageSectionConfig,
  AuditLog, User, StandingRow, ArticleStatus, Language
} from '../src/types/index';
import { query } from './db/connection';
import { cache } from './services/cache';
import { logAudit, getAuditLogs } from './services/audit';

export class FootballDatabase {
  // --- Audit Logging ---
  public async logAudit(user: { id: string; name: string; role: string }, action: string, entity: string, entityId: string, details: string, ip?: string) {
    return logAudit(user, action, entity, entityId, details, ip);
  }

  public async getAuditLogs(limit = 100): Promise<AuditLog[]> {
    return getAuditLogs(limit) as any;
  }

  // --- Articles ---
  public async getArticles(params?: {
    lang?: Language;
    category?: string;
    clubId?: string;
    playerId?: string;
    competitionId?: string;
    status?: ArticleStatus;
    search?: string;
    tag?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: Article[]; total: number }> {
    const lang = params?.lang || 'bn';
    const limit = params?.limit || 20;
    const offset = params?.offset || 0;

    const cacheKey = `articles:list:${lang}:${params?.category || ''}:${params?.status || ''}:${limit}:${offset}`;
    if (!params?.search) {
      const cached = await cache.get<{ items: Article[]; total: number }>(cacheKey);
      if (cached) return cached;
    }

    let sql = `
      SELECT a.*, 
             t.title as trans_title, t.excerpt as trans_excerpt, t.content_blocks,
             t.meta_title, t.meta_description,
             auth.name as author_name, auth.bangla_name as author_bangla_name,
             auth.role as author_role, auth.avatar as author_avatar,
             c.name as category_name, c.bangla_name as category_bangla_name, c.slug as category_slug
      FROM articles a
      LEFT JOIN article_translations t ON a.id = t.article_id AND t.language = $1
      LEFT JOIN authors auth ON a.author_id = auth.id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE 1=1
    `;
    const values: any[] = [lang];

    if (params?.status) {
      values.push(params.status);
      sql += ` AND a.status = $${values.length}`;
    }

    if (params?.category && params.category !== 'all') {
      values.push(params.category);
      sql += ` AND (c.slug = $${values.length} OR a.category_id = $${values.length})`;
    }

    if (params?.search) {
      values.push(`%${params.search}%`);
      sql += ` AND (t.title ILIKE $${values.length} OR t.excerpt ILIKE $${values.length} OR a.slug ILIKE $${values.length})`;
    }

    // Count query
    const countSql = `SELECT COUNT(*) FROM (${sql}) AS count_query`;
    const countRes = await query(countSql, values);
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    // Pagination & Sort
    sql += ` ORDER BY a.published_at DESC NULLS LAST, a.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const res = await query(sql, values);

    // Fetch related tags and translations for each article
    const items: Article[] = await Promise.all(res.rows.map(async (row: any) => {
      // Get all translations for this article
      const transRes = await query(
        `SELECT * FROM article_translations WHERE article_id = $1`,
        [row.id]
      );
      const translations: Record<string, any> = {};
      transRes.rows.forEach((tr: any) => {
        translations[tr.language] = {
          language: tr.language,
          title: tr.title,
          subtitle: '',
          excerpt: tr.excerpt,
          slug: row.slug,
          status: row.status,
          updatedAt: tr.updated_at,
          seo: {
            title: tr.meta_title || tr.title,
            description: tr.meta_description || tr.excerpt
          },
          blocks: tr.content_blocks || []
        };
      });

      return {
        id: row.id,
        slug: row.slug,
        title: row.trans_title || (translations['bn']?.title) || 'শিরোনামহীন প্রতিবেদন',
        subtitle: '',
        excerpt: row.trans_excerpt || (translations['bn']?.excerpt) || '',
        category: row.category_slug || 'news',
        subcategory: row.category_bangla_name || '',
        featuredImage: row.featured_image,
        imageCaption: row.image_caption || '',
        imageCredit: row.image_credit || 'GoalBangla Sports',
        authorId: row.author_id,
        author: {
          id: row.author_id,
          name: row.author_name || 'Tanvir Ahmed',
          banglaName: row.author_bangla_name || 'তানভীর আহমেদ',
          role: row.author_role || 'Sports Journalist',
          banglaRole: row.author_role || 'ক্রীড়া সাংবাদিক',
          avatar: row.author_avatar || '',
          bio: '',
          banglaBio: '',
          articleCount: 50,
          isVerified: true
        },
        status: row.status as ArticleStatus,
        publishedAt: row.published_at,
        updatedAt: row.updated_at,
        readTimeMinutes: 4,
        isBreaking: !!row.is_breaking,
        isFeatured: !!row.is_featured,
        isEditorPick: !!row.is_tactical,
        tags: ['Football', row.category_name || 'News'],
        blocks: row.content_blocks || [],
        relatedPlayerIds: [],
        relatedClubIds: [],
        relatedMatchIds: [],
        relatedCompetitionIds: [],
        translations,
        seo: {
          title: row.meta_title || `${row.trans_title} | গোলবাংলা`,
          description: row.meta_description || row.trans_excerpt || '',
          structuredDataType: 'NewsArticle'
        },
        viewsCount: row.view_count || 0,
        likesCount: 0
      };
    }));

    const result = { items, total };
    if (!params?.search) {
      await cache.set(cacheKey, result, 60);
    }
    return result;
  }

  public async getArticleBySlug(slug: string, lang: Language = 'bn'): Promise<Article | null> {
    const res = await query(
      `SELECT a.*, 
              t.title as trans_title, t.excerpt as trans_excerpt, t.content_blocks,
              t.meta_title, t.meta_description,
              auth.name as author_name, auth.bangla_name as author_bangla_name,
              auth.role as author_role, auth.avatar as author_avatar, auth.bio as author_bio,
              c.name as category_name, c.bangla_name as category_bangla_name, c.slug as category_slug
       FROM articles a
       LEFT JOIN article_translations t ON a.id = t.article_id AND t.language = $1
       LEFT JOIN authors auth ON a.author_id = auth.id
       LEFT JOIN categories c ON a.category_id = c.id
       WHERE a.slug = $2`,
      [lang, slug]
    );

    if (res.rows.length === 0) return null;
    const row = res.rows[0];

    // Increment view count
    query(`UPDATE articles SET view_count = view_count + 1 WHERE id = $1`, [row.id]).catch(() => {});

    // Get all translations
    const transRes = await query(
      `SELECT * FROM article_translations WHERE article_id = $1`,
      [row.id]
    );
    const translations: Record<string, any> = {};
    transRes.rows.forEach((tr: any) => {
      translations[tr.language] = {
        language: tr.language,
        title: tr.title,
        subtitle: '',
        excerpt: tr.excerpt,
        slug: row.slug,
        status: row.status,
        updatedAt: tr.updated_at,
        seo: {
          title: tr.meta_title || tr.title,
          description: tr.meta_description || tr.excerpt
        },
        blocks: tr.content_blocks || []
      };
    });

    return {
      id: row.id,
      slug: row.slug,
      title: row.trans_title || translations['bn']?.title || 'শিরোনামহীন প্রতিবেদন',
      subtitle: '',
      excerpt: row.trans_excerpt || translations['bn']?.excerpt || '',
      category: row.category_slug || 'news',
      subcategory: row.category_bangla_name || '',
      featuredImage: row.featured_image,
      imageCaption: row.image_caption || '',
      imageCredit: row.image_credit || 'GoalBangla Sports',
      authorId: row.author_id,
      author: {
        id: row.author_id,
        name: row.author_name || 'Editorial Staff',
        banglaName: row.author_bangla_name || 'গোলবাংলা ডেস্ক',
        role: row.author_role || 'Sports Writer',
        banglaRole: row.author_role || 'ক্রীড়া সাংবাদিক',
        avatar: row.author_avatar || '',
        bio: row.author_bio || '',
        banglaBio: row.author_bio || '',
        articleCount: 100,
        isVerified: true
      },
      status: row.status,
      publishedAt: row.published_at,
      updatedAt: row.updated_at,
      readTimeMinutes: 5,
      isBreaking: !!row.is_breaking,
      isFeatured: !!row.is_featured,
      isEditorPick: !!row.is_tactical,
      tags: ['Football', row.category_name || 'News'],
      blocks: row.content_blocks || [],
      relatedPlayerIds: [],
      relatedClubIds: [],
      relatedMatchIds: [],
      relatedCompetitionIds: [],
      translations,
      seo: {
        title: row.meta_title || `${row.trans_title} | গোলবাংলা`,
        description: row.meta_description || row.trans_excerpt || '',
        structuredDataType: 'NewsArticle'
      },
      viewsCount: (row.view_count || 0) + 1,
      likesCount: 0
    };
  }

  public async getArticleById(id: string): Promise<Article | null> {
    const res = await query(`SELECT slug FROM articles WHERE id = $1`, [id]);
    if (res.rows.length === 0) return null;
    return this.getArticleBySlug(res.rows[0].slug);
  }

  public async createArticle(articleData: Partial<Article>, user: { id: string; name: string; role: string }): Promise<Article> {
    const id = `art-${Date.now()}`;
    const slug = articleData.slug || `article-${Date.now()}`;
    let categoryId = 'cat-news';
    if (articleData.category) {
      const catCheck = await query(`SELECT id FROM categories WHERE id = $1 OR slug = $1 LIMIT 1`, [articleData.category]);
      if (catCheck.rows.length > 0) {
        categoryId = catCheck.rows[0].id;
      } else if (articleData.category === 'tactical-analysis') {
        categoryId = 'cat-tactics';
      } else if (articleData.category === 'transfers') {
        categoryId = 'cat-transfers';
      } else if (articleData.category === 'bangladesh-football') {
        categoryId = 'cat-bangladesh';
      }
    }

    let authorId = 'auth-1';
    const targetAuthor = articleData.authorId || user.id;
    if (targetAuthor) {
      const authCheck = await query(`SELECT id FROM authors WHERE id = $1 LIMIT 1`, [targetAuthor]);
      if (authCheck.rows.length > 0) {
        authorId = authCheck.rows[0].id;
      }
    }
    const status = articleData.status || 'draft';
    const publishedAt = status === 'published' ? new Date().toISOString() : null;

    await query(
      `INSERT INTO articles (
         id, slug, category_id, author_id, featured_image, image_caption, image_credit,
         status, is_breaking, is_featured, is_tactical, view_count, read_time, published_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        id, slug, categoryId, authorId,
        articleData.featuredImage || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
        articleData.imageCaption || null,
        articleData.imageCredit || 'GoalBangla Sports',
        status, !!articleData.isBreaking, !!articleData.isFeatured, !!articleData.isEditorPick,
        0, '৪ মিনিট', publishedAt
      ]
    );

    // Insert Bangla translation
    await query(
      `INSERT INTO article_translations (
         id, article_id, language, title, excerpt, content_blocks, meta_title, meta_description
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        `trans-${id}-bn`, id, 'bn',
        articleData.title || 'শিরোনামহীন প্রতিবেদন',
        articleData.excerpt || '',
        JSON.stringify(articleData.blocks || []),
        articleData.title || 'শিরোনামহীন প্রতিবেদন',
        articleData.excerpt || ''
      ]
    );

    // Insert English translation if provided
    if (articleData.translations?.en) {
      const en = articleData.translations.en;
      await query(
        `INSERT INTO article_translations (
           id, article_id, language, title, excerpt, content_blocks, meta_title, meta_description
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          `trans-${id}-en`, id, 'en',
          en.title || '',
          en.excerpt || '',
          JSON.stringify(en.blocks || articleData.blocks || []),
          en.title || '',
          en.excerpt || ''
        ]
      );
    }

    await this.logAudit(user, 'ARTICLE_CREATED', 'Article', id, `Created article "${articleData.title}" (Status: ${status})`);
    await cache.deletePattern('articles:*');
    const created = await this.getArticleBySlug(slug);
    return created!;
  }

  public async updateArticle(id: string, updates: Partial<Article>, user: { id: string; name: string; role: string }): Promise<Article | null> {
    const existing = await query(`SELECT * FROM articles WHERE id = $1`, [id]);
    if (existing.rows.length === 0) return null;
    const prev = existing.rows[0];

    const newStatus = updates.status || prev.status;
    let publishedAt = prev.published_at;
    if (newStatus === 'published' && prev.status !== 'published') {
      publishedAt = new Date().toISOString();
    }

    await query(
      `UPDATE articles SET
         slug = COALESCE($2, slug),
         featured_image = COALESCE($3, featured_image),
         image_caption = COALESCE($4, image_caption),
         image_credit = COALESCE($5, image_credit),
         status = $6,
         is_breaking = COALESCE($7, is_breaking),
         is_featured = COALESCE($8, is_featured),
         is_tactical = COALESCE($9, is_tactical),
         published_at = $10,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [
        id, updates.slug || null, updates.featuredImage || null,
        updates.imageCaption || null, updates.imageCredit || null,
        newStatus, updates.isBreaking !== undefined ? updates.isBreaking : null,
        updates.isFeatured !== undefined ? updates.isFeatured : null,
        updates.isEditorPick !== undefined ? updates.isEditorPick : null,
        publishedAt
      ]
    );

    // Update translations
    if (updates.title || updates.excerpt || updates.blocks) {
      await query(
        `INSERT INTO article_translations (id, article_id, language, title, excerpt, content_blocks, meta_title, meta_description)
         VALUES ($1, $2, 'bn', $3, $4, $5, $3, $4)
         ON CONFLICT (article_id, language) DO UPDATE SET
           title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, content_blocks = EXCLUDED.content_blocks, updated_at = CURRENT_TIMESTAMP`,
        [
          `trans-${id}-bn`, id,
          updates.title || prev.slug,
          updates.excerpt || '',
          JSON.stringify(updates.blocks || [])
        ]
      );
    }

    if (updates.translations?.en) {
      const en = updates.translations.en;
      await query(
        `INSERT INTO article_translations (id, article_id, language, title, excerpt, content_blocks, meta_title, meta_description)
         VALUES ($1, $2, 'en', $3, $4, $5, $3, $4)
         ON CONFLICT (article_id, language) DO UPDATE SET
           title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, content_blocks = EXCLUDED.content_blocks, updated_at = CURRENT_TIMESTAMP`,
        [
          `trans-${id}-en`, id,
          en.title,
          en.excerpt || '',
          JSON.stringify(en.blocks || [])
        ]
      );
    }

    await this.logAudit(user, 'ARTICLE_UPDATED', 'Article', id, `Updated article "${updates.title || prev.slug}"`);
    await cache.deletePattern('articles:*');
    return this.getArticleById(id);
  }

  public async deleteArticle(id: string, user: { id: string; name: string; role: string }): Promise<boolean> {
    const res = await query(`DELETE FROM articles WHERE id = $1 RETURNING slug`, [id]);
    if (res.rows.length === 0) return false;
    await this.logAudit(user, 'ARTICLE_DELETED', 'Article', id, `Deleted article ${id} (${res.rows[0].slug})`);
    await cache.deletePattern('articles:*');
    return true;
  }

  // --- Breaking News ---
  public async getBreakingNews(): Promise<BreakingNews[]> {
    const res = await query(
      `SELECT * FROM breaking_news WHERE status = 'active' ORDER BY timestamp DESC LIMIT 10`
    );
    return res.rows.map((r: any) => ({
      id: r.id,
      headline: r.headline,
      banglaHeadline: r.bangla_headline,
      category: r.category,
      priority: r.priority,
      timestamp: r.timestamp,
      status: r.status,
      relatedArticleSlug: r.url || undefined
    }));
  }

  public async getAllBreakingNews(): Promise<BreakingNews[]> {
    const res = await query(
      `SELECT * FROM breaking_news ORDER BY timestamp DESC LIMIT 50`
    );
    return res.rows.map((r: any) => ({
      id: r.id,
      headline: r.headline,
      banglaHeadline: r.bangla_headline,
      category: r.category,
      priority: r.priority,
      timestamp: r.timestamp,
      status: r.status,
      relatedArticleSlug: r.url || undefined
    }));
  }

  public async createBreakingNews(data: Partial<BreakingNews>, user: { id: string; name: string; role: string }): Promise<BreakingNews> {
    const id = `bn-${Date.now()}`;
    const timestamp = new Date().toISOString();
    await query(
      `INSERT INTO breaking_news (id, headline, bangla_headline, priority, status, category, url, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id, data.headline || 'Breaking Football News',
        data.banglaHeadline || data.headline || 'ব্রেকিং ফুটবল সংবাদ',
        data.priority || 'high', data.status || 'active',
        data.category || 'Breaking', data.relatedArticleSlug || null,
        timestamp
      ]
    );

    const item: BreakingNews = {
      id,
      headline: data.headline || 'Breaking Football News',
      banglaHeadline: data.banglaHeadline || data.headline || 'ব্রেকিং ফুটবল সংবাদ',
      category: data.category || 'Breaking',
      priority: (data.priority as any) || 'high',
      timestamp,
      status: (data.status as any) || 'active',
      relatedArticleSlug: data.relatedArticleSlug
    };

    await this.logAudit(user, 'BREAKING_NEWS_CREATED', 'BreakingNews', id, item.banglaHeadline);
    return item;
  }

  public async updateBreakingNews(id: string, updates: Partial<BreakingNews>, user: { id: string; name: string; role: string }): Promise<BreakingNews | null> {
    const res = await query(
      `UPDATE breaking_news SET
         headline = COALESCE($2, headline),
         bangla_headline = COALESCE($3, bangla_headline),
         priority = COALESCE($4, priority),
         status = COALESCE($5, status),
         category = COALESCE($6, category)
       WHERE id = $1 RETURNING *`,
      [id, updates.headline || null, updates.banglaHeadline || null, updates.priority || null, updates.status || null, updates.category || null]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    await this.logAudit(user, 'BREAKING_NEWS_UPDATED', 'BreakingNews', id, `Updated breaking news ${id}`);
    return {
      id: r.id,
      headline: r.headline,
      banglaHeadline: r.bangla_headline,
      category: r.category,
      priority: r.priority,
      timestamp: r.timestamp,
      status: r.status,
      relatedArticleSlug: r.url || undefined
    };
  }

  public async deleteBreakingNews(id: string, user: { id: string; name: string; role: string }): Promise<boolean> {
    const res = await query(`DELETE FROM breaking_news WHERE id = $1`, [id]);
    if ((res.rowCount ?? 0) > 0) {
      await this.logAudit(user, 'BREAKING_NEWS_DELETED', 'BreakingNews', id, `Deleted breaking news ${id}`);
      return true;
    }
    return false;
  }

  // --- Matches & Live Centre ---
  public async getMatches(params?: { competitionId?: string; status?: string; clubId?: string }): Promise<Match[]> {
    let sql = `
      SELECT m.*, 
             hc.name as home_name, hc.bangla_name as home_bangla_name, hc.logo as home_logo, hc.short_name as home_short,
             ac.name as away_name, ac.bangla_name as away_bangla_name, ac.logo as away_logo, ac.short_name as away_short,
             c.name as comp_name, c.bangla_name as comp_bangla_name, c.logo as comp_logo
      FROM matches m
      JOIN clubs hc ON m.home_club_id = hc.id
      JOIN clubs ac ON m.away_club_id = ac.id
      JOIN competitions c ON m.competition_id = c.id
      WHERE 1=1
    `;
    const values: any[] = [];

    if (params?.competitionId) {
      values.push(params.competitionId);
      sql += ` AND m.competition_id = $${values.length}`;
    }
    if (params?.status) {
      values.push(params.status);
      sql += ` AND m.status = $${values.length}`;
    }
    if (params?.clubId) {
      values.push(params.clubId);
      sql += ` AND (m.home_club_id = $${values.length} OR m.away_club_id = $${values.length})`;
    }

    sql += ` ORDER BY m.date DESC`;
    const res = await query(sql, values);

    return res.rows.map((row: any) => ({
      id: row.id,
      competitionId: row.competition_id,
      season: '2024-25',
      homeClubId: row.home_club_id,
      awayClubId: row.away_club_id,
      homeScore: row.home_score,
      awayScore: row.away_score,
      status: row.status,
      minute: row.minute,
      matchDate: row.date || new Date().toISOString(),
      venue: row.stadium || 'Stadium',
      referee: row.referee || 'Referee',
      attendance: 55000,
      events: row.events || [],
      homeFormation: row.lineups?.homeFormation || '4-3-3',
      awayFormation: row.lineups?.awayFormation || '4-2-3-1',
      homeLineup: Array.isArray(row.lineups?.home) ? row.lineups.home : (Array.isArray(row.lineups?.startingXI) ? row.lineups.startingXI : (Array.isArray(row.lineups) ? row.lineups : [])),
      awayLineup: Array.isArray(row.lineups?.away) ? row.lineups.away : [],
      roundOrGameweek: 'Matchday 28',
      banglaRound: 'ম্যাচডে ২৮',
      stats: row.stats || {
        possession: [50, 50],
        shots: [10, 10],
        shotsOnTarget: [5, 5],
        expectedGoals: [1.2, 1.1],
        corners: [4, 4],
        fouls: [8, 8],
        yellowCards: [1, 2],
        redCards: [0, 0],
        passes: [450, 440],
        passAccuracy: [85, 84],
        offsides: [2, 1]
      }
    }));
  }

  public async getMatchById(id: string): Promise<Match | null> {
    const matches = await this.getMatches();
    return matches.find(m => m.id === id) || null;
  }

  public async updateMatchScore(id: string, data: { homeScore: number; awayScore: number; minute?: number; status?: Match['status'] }, user: { id: string; name: string; role: string }): Promise<Match | null> {
    await query(
      `UPDATE matches SET
         home_score = $2,
         away_score = $3,
         minute = COALESCE($4, minute),
         status = COALESCE($5, status)
       WHERE id = $1`,
      [id, data.homeScore, data.awayScore, data.minute !== undefined ? data.minute : null, data.status || null]
    );
    await this.logAudit(user, 'MATCH_SCORE_UPDATED', 'Match', id, `Updated score to ${data.homeScore}-${data.awayScore}`);
    return this.getMatchById(id);
  }

  public async addMatchEvent(matchId: string, eventData: Partial<Match['events'][0]>, user: { id: string; name: string; role: string }): Promise<Match | null> {
    const match = await this.getMatchById(matchId);
    if (!match) return null;

    const newEvent: Match['events'][0] = {
      id: `ev-${Date.now()}`,
      minute: eventData.minute || match.minute,
      type: eventData.type || 'goal',
      clubId: eventData.clubId || match.homeClubId,
      playerId: eventData.playerId || '',
      description: eventData.description || 'Match event',
      banglaDescription: eventData.banglaDescription || 'ম্যাচ ঘটনা'
    };

    const events = [...(match.events || []), newEvent];
    let homeScore = match.homeScore;
    let awayScore = match.awayScore;
    if (newEvent.type === 'goal' || newEvent.type === 'penalty_goal') {
      if (newEvent.clubId === match.homeClubId) homeScore += 1;
      else awayScore += 1;
    }

    await query(
      `UPDATE matches SET
         events = $2,
         home_score = $3,
         away_score = $4
       WHERE id = $1`,
      [matchId, JSON.stringify(events), homeScore, awayScore]
    );

    await this.logAudit(user, 'MATCH_EVENT_ADDED', 'Match', matchId, `Added event: ${newEvent.description}`);
    return this.getMatchById(matchId);
  }

  // --- Clubs & Players ---
  public async getClubs(competitionId?: string): Promise<Club[]> {
    let sql = `SELECT * FROM clubs`;
    const params: any[] = [];
    if (competitionId) {
      sql += ` WHERE competition_id = $1`;
      params.push(competitionId);
    }
    sql += ` ORDER BY name ASC`;
    const res = await query(sql, params);

    return res.rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      banglaName: r.bangla_name,
      shortName: r.short_name,
      slug: r.slug,
      logo: r.logo,
      country: 'International',
      banglaCountry: 'আন্তর্জাতিক',
      city: r.city || '',
      stadium: r.stadium || '',
      stadiumCapacity: 60000,
      manager: 'Manager',
      founded: r.founded || 1900,
      competitionId: r.competition_id,
      primaryColor: '#00529F',
      secondaryColor: '#FFFFFF',
      squadPlayerIds: [],
      honorsCount: 25
    }));
  }

  public async getClubBySlugOrId(identifier: string): Promise<Club | null> {
    const res = await query(
      `SELECT * FROM clubs WHERE slug = $1 OR id = $1 LIMIT 1`,
      [identifier]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      name: r.name,
      banglaName: r.bangla_name,
      shortName: r.short_name,
      slug: r.slug,
      logo: r.logo,
      country: 'International',
      banglaCountry: 'আন্তর্জাতিক',
      city: r.city || '',
      stadium: r.stadium || '',
      stadiumCapacity: 60000,
      manager: 'Head Coach',
      founded: r.founded || 1900,
      competitionId: r.competition_id,
      primaryColor: '#00529F',
      secondaryColor: '#FFFFFF',
      squadPlayerIds: [],
      honorsCount: 25
    };
  }

  public async getPlayers(clubId?: string): Promise<Player[]> {
    let sql = `SELECT * FROM players`;
    const params: any[] = [];
    if (clubId) {
      sql += ` WHERE club_id = $1`;
      params.push(clubId);
    }
    sql += ` ORDER BY name ASC`;
    const res = await query(sql, params);

    return res.rows.map((p: any) => ({
      id: p.id,
      name: p.name,
      banglaName: p.bangla_name,
      slug: p.slug,
      photo: p.avatar,
      nationality: p.nationality,
      banglaNationality: p.nationality,
      position: p.position,
      banglaPosition: p.position,
      number: p.shirt_number || 10,
      clubId: p.club_id,
      birthDate: '1998-01-01',
      age: 26,
      heightCm: 180,
      marketValue: p.market_value || '€50M',
      banglaMarketValue: '৫০ মিলিয়ন ইউরো',
      stats: {
        appearances: 25,
        goals: p.goals || 0,
        assists: p.assists || 0,
        yellowCards: 1,
        redCards: 0,
        rating: 7.8
      },
      bio: 'Professional footballer',
      banglaBio: 'পেশাদার ফুটবলার'
    }));
  }

  public async getPlayerBySlugOrId(identifier: string): Promise<Player | null> {
    const res = await query(
      `SELECT * FROM players WHERE slug = $1 OR id = $1 LIMIT 1`,
      [identifier]
    );
    if (res.rows.length === 0) return null;
    const p = res.rows[0];
    return {
      id: p.id,
      name: p.name,
      banglaName: p.bangla_name,
      slug: p.slug,
      photo: p.avatar,
      nationality: p.nationality,
      banglaNationality: p.nationality,
      position: p.position,
      banglaPosition: p.position,
      number: p.shirt_number || 10,
      clubId: p.club_id,
      birthDate: '1998-01-01',
      age: 26,
      heightCm: 180,
      marketValue: p.market_value || '€50M',
      banglaMarketValue: '৫০ মিলিয়ন ইউরো',
      stats: {
        appearances: 25,
        goals: p.goals || 0,
        assists: p.assists || 0,
        yellowCards: 1,
        redCards: 0,
        rating: 7.8
      },
      bio: 'Professional footballer',
      banglaBio: 'পেশাদার ফুটবলার'
    };
  }

  // --- Competitions & Standings ---
  public async getCompetitions(): Promise<Competition[]> {
    const res = await query(`SELECT * FROM competitions ORDER BY priority ASC, name ASC`);
    return res.rows.map((c: any) => ({
      id: c.id,
      name: c.name,
      banglaName: c.bangla_name,
      slug: c.slug,
      code: c.code || c.slug.toUpperCase(),
      logo: c.logo,
      country: c.country,
      banglaCountry: c.country,
      type: c.type || 'league',
      currentSeason: c.current_season || '2024-25',
      tier: c.tier || 1
    }));
  }

  public async getCompetitionBySlugOrId(identifier: string): Promise<Competition | null> {
    const res = await query(
      `SELECT * FROM competitions WHERE slug = $1 OR id = $1 LIMIT 1`,
      [identifier]
    );
    if (res.rows.length === 0) return null;
    const c = res.rows[0];
    return {
      id: c.id,
      name: c.name,
      banglaName: c.bangla_name,
      slug: c.slug,
      code: c.code || c.slug.toUpperCase(),
      logo: c.logo,
      country: c.country,
      banglaCountry: c.country,
      type: c.type || 'league',
      currentSeason: c.current_season || '2024-25',
      tier: c.tier || 1
    };
  }

  public async getStandings(competitionId: string): Promise<StandingRow[]> {
    const res = await query(
      `SELECT s.*, c.name as club_name, c.bangla_name as club_bangla_name, c.short_name as club_short, c.logo as club_logo
       FROM standings s
       JOIN clubs c ON s.club_id = c.id
       WHERE s.competition_id = $1
       ORDER BY s.position ASC, s.points DESC, s.goal_difference DESC`,
      [competitionId]
    );

    return res.rows.map((r: any) => ({
      position: r.position,
      clubId: r.club_id,
      clubName: r.club_name,
      banglaClubName: r.club_bangla_name,
      clubLogo: r.club_logo,
      played: r.played,
      won: r.won,
      drawn: r.drawn,
      lost: r.lost,
      goalsFor: r.goals_for,
      goalsAgainst: r.goals_against,
      goalDifference: r.goal_difference,
      points: r.points,
      form: r.form || ['W', 'D', 'W', 'W', 'D']
    }));
  }

  public async updateStandings(competitionId: string, rows: StandingRow[], user: { id: string; name: string; role: string }): Promise<StandingRow[]> {
    for (const r of rows) {
      await query(
        `INSERT INTO standings (id, competition_id, club_id, position, played, won, drawn, lost, goals_for, goals_against, goal_difference, points, form)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (competition_id, club_id) DO UPDATE SET
           position = $4, played = $5, won = $6, drawn = $7, lost = $8,
           goals_for = $9, goals_against = $10, goal_difference = $11, points = $12, form = $13`,
        [
          `std-${competitionId}-${r.clubId}`, competitionId, r.clubId,
          r.position, r.played, r.won, r.drawn, r.lost,
          r.goalsFor, r.goalsAgainst, r.goalDifference, r.points,
          JSON.stringify(r.form || [])
        ]
      );
    }
    await this.logAudit(user, 'STANDINGS_UPDATED', 'Standings', competitionId, `Updated standings for ${competitionId}`);
    return this.getStandings(competitionId);
  }

  // --- Transfers & Injuries ---
  public async getTransfers(status?: string): Promise<Transfer[]> {
    let sql = `
      SELECT t.*, p.name as player_name, p.bangla_name as player_bangla_name, p.avatar as player_photo,
             fc.name as from_club_name, fc.bangla_name as from_club_bangla, fc.logo as from_club_logo,
             tc.name as to_club_name, tc.bangla_name as to_club_bangla, tc.logo as to_club_logo
      FROM transfers t
      JOIN players p ON t.player_id = p.id
      LEFT JOIN clubs fc ON t.from_club_id = fc.id
      LEFT JOIN clubs tc ON t.to_club_id = tc.id
    `;
    const params: any[] = [];
    if (status && status !== 'all') {
      sql += ` WHERE t.status = $1`;
      params.push(status);
    }
    sql += ` ORDER BY t.transfer_date DESC, t.last_updated DESC`;
    const res = await query(sql, params);

    return res.rows.map((r: any) => ({
      id: r.id,
      playerId: r.player_id,
      fromClubId: r.from_club_id || '',
      toClubId: r.to_club_id || '',
      transferType: r.type || 'permanent',
      fee: r.fee || 'Undisclosed',
      banglaFee: r.fee || 'অপ্রকাশিত ফি',
      currency: r.currency || 'EUR',
      status: r.status,
      confidence: r.confidence || 80,
      source: r.source || 'GoalBangla Desk',
      tier: 1,
      date: r.transfer_date || new Date().toISOString().slice(0, 10),
      details: `Transfer update for ${r.player_name}`,
      banglaDetails: `${r.player_bangla_name}-এর দলবদল সংক্রান্ত তথ্য`
    }));
  }

  public async createTransfer(data: Partial<Transfer>, user: { id: string; name: string; role: string }): Promise<Transfer> {
    const id = `tr-${Date.now()}`;
    await query(
      `INSERT INTO transfers (id, player_id, from_club_id, to_club_id, fee, fee_amount, currency, type, status, source, confidence, transfer_date, last_updated)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)`,
      [
        id, data.playerId || 'p-haaland', data.fromClubId || null, data.toClubId || null,
        data.fee || 'Undisclosed', (data as any).feeAmount || 0, data.currency || 'EUR',
        data.transferType || 'permanent', data.status || 'rumour',
        data.source || 'GoalBangla Desk', data.confidence || 75,
        data.date || new Date().toISOString().slice(0, 10)
      ]
    );
    await this.logAudit(user, 'TRANSFER_CREATED', 'Transfer', id, `Created transfer record for player ${data.playerId}`);
    const list = await this.getTransfers();
    return list.find(t => t.id === id)!;
  }

  public async getInjuries(clubId?: string): Promise<Injury[]> {
    let sql = `
      SELECT i.*, p.name as player_name, p.bangla_name as player_bangla_name,
             c.name as club_name, c.bangla_name as club_bangla
      FROM injuries i
      JOIN players p ON i.player_id = p.id
      LEFT JOIN clubs c ON i.club_id = c.id
    `;
    const params: any[] = [];
    if (clubId) {
      sql += ` WHERE i.club_id = $1`;
      params.push(clubId);
    }
    sql += ` ORDER BY i.last_updated DESC`;
    const res = await query(sql, params);

    return res.rows.map((r: any) => ({
      id: r.id,
      playerId: r.player_id,
      clubId: r.club_id,
      injuryType: r.type,
      banglaInjuryType: r.type,
      bodyArea: 'Lower Body',
      severity: 'minor',
      status: r.status,
      expectedReturn: r.expected_return || 'TBD',
      banglaExpectedReturn: r.expected_return || 'অনির্দিষ্টকাল',
      source: r.source || 'Club Medical Staff',
      updatedAt: r.last_updated,
      notes: r.description || '',
      banglaNotes: r.description || ''
    }));
  }

  public async createInjury(data: Partial<Injury>, user: { id: string; name: string; role: string }): Promise<Injury> {
    const id = `inj-${Date.now()}`;
    await query(
      `INSERT INTO injuries (id, player_id, club_id, type, description, status, expected_return, source, last_updated)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)`,
      [
        id, data.playerId || 'p-saka', data.clubId || null,
        data.injuryType || 'Muscle Strain', data.notes || (data as any).description || '',
        data.status || 'out', data.expectedReturn || 'TBD',
        data.source || 'Club Physio'
      ]
    );
    await this.logAudit(user, 'INJURY_LOGGED', 'Injury', id, `Logged injury for ${data.playerId}`);
    const list = await this.getInjuries();
    return list.find(i => i.id === id)!;
  }

  // --- Media, Galleries, Videos ---
  public async getMedia(): Promise<MediaItem[]> {
    const res = await query(`SELECT * FROM media ORDER BY uploaded_at DESC`);
    return res.rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      banglaTitle: r.title,
      url: r.url,
      type: 'image',
      mimeType: r.mime_type || 'image/jpeg',
      width: 1920,
      height: 1080,
      sizeBytes: Number(r.file_size) || 1024000,
      altText: r.alt_text || r.title,
      caption: r.caption || '',
      photographer: r.credit || 'GoalBangla Media',
      credit: r.credit || 'GoalBangla Media',
      license: 'Editorial License',
      uploaderName: 'Editorial Staff',
      uploadDate: r.uploaded_at,
      tags: ['Football']
    }));
  }

  public async addMedia(data: Partial<MediaItem>, user: { id: string; name: string; role: string }): Promise<MediaItem> {
    const id = data.id || `med-${Date.now()}`;
    await query(
      `INSERT INTO media (id, url, title, caption, alt_text, credit, category, mime_type, file_size, dimensions, uploaded_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)`,
      [
        id, data.url || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
        data.title || 'Uploaded Media', data.caption || null, data.altText || null,
        data.credit || 'GoalBangla Sports', 'general', data.mimeType || 'image/jpeg',
        data.sizeBytes || 1024000, `${data.width || 1920}x${data.height || 1080}`
      ]
    );
    await this.logAudit(user, 'MEDIA_UPLOADED', 'Media', id, `Uploaded ${data.title}`);
    const mediaList = await this.getMedia();
    return mediaList.find(m => m.id === id)!;
  }

  public async deleteMedia(id: string, user: { id: string; name: string; role: string }): Promise<boolean> {
    const res = await query(`SELECT url FROM media WHERE id = $1`, [id]);
    if (res.rows.length === 0) return false;
    await query(`DELETE FROM media WHERE id = $1`, [id]);
    await this.logAudit(user, 'MEDIA_DELETED', 'Media', id, `Deleted media item ${id}`);
    return true;
  }

  public async getGalleries(): Promise<Gallery[]> {
    const res = await query(`SELECT * FROM galleries ORDER BY created_at DESC`);
    const galleries: Gallery[] = await Promise.all(res.rows.map(async (g: any) => {
      const itemsRes = await query(`SELECT * FROM gallery_items WHERE gallery_id = $1 ORDER BY sort_order ASC`, [g.id]);
      return {
        id: g.id,
        title: g.title,
        banglaTitle: g.bangla_title,
        slug: g.slug,
        description: g.description || '',
        banglaDescription: g.description || '',
        coverImage: g.cover_image,
        photographer: 'GoalBangla Visual Team',
        date: g.created_at,
        tags: ['Gallery', 'Football'],
        images: itemsRes.rows.map((item: any) => ({
          url: item.image_url,
          caption: item.caption || '',
          banglaCaption: item.caption || '',
          credit: item.credit || 'GoalBangla'
        }))
      };
    }));
    return galleries;
  }

  public async getVideos(): Promise<VideoItem[]> {
    const res = await query(`SELECT * FROM videos ORDER BY published_at DESC`);
    return res.rows.map((v: any) => ({
      id: v.id,
      title: v.title,
      banglaTitle: v.bangla_title,
      slug: v.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      videoUrl: v.url,
      thumbnail: v.thumbnail,
      durationSeconds: 300,
      category: v.category || 'Highlights',
      description: v.bangla_title,
      banglaDescription: v.bangla_title,
      date: v.published_at,
      viewsCount: 25000,
      source: 'youtube'
    }));
  }

  public async getAuthors(): Promise<Author[]> {
    const res = await query(`SELECT * FROM authors ORDER BY name ASC`);
    return res.rows.map((a: any) => ({
      id: a.id,
      name: a.name,
      banglaName: a.bangla_name,
      role: a.role,
      banglaRole: a.role,
      avatar: a.avatar,
      bio: a.bio || '',
      banglaBio: a.bio || '',
      twitter: a.twitter_handle || '',
      email: `${a.id}@goalbangla.com`,
      articleCount: 150,
      isVerified: true
    }));
  }

  public async getAuthorById(id: string): Promise<Author | null> {
    const authors = await this.getAuthors();
    return authors.find(a => a.id === id) || null;
  }

  // --- Homepage Config ---
  public async getHomepageConfig(): Promise<HomepageSectionConfig[]> {
    const res = await query(`SELECT * FROM homepage_config ORDER BY order_index ASC`);
    return res.rows.map((r: any) => ({
      id: r.section_id,
      type: r.section_id as any,
      title: r.title,
      banglaTitle: r.bangla_title,
      enabled: r.enabled,
      order: r.order_index,
      limit: r.limit_count,
      settings: r.settings
    }));
  }

  public async updateHomepageConfig(sections: HomepageSectionConfig[], user: { id: string; name: string; role: string }): Promise<HomepageSectionConfig[]> {
    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      await query(
        `INSERT INTO homepage_config (id, section_id, title, bangla_title, enabled, order_index, limit_count, settings)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (section_id) DO UPDATE SET
           title = $3, bangla_title = $4, enabled = $5, order_index = $6, limit_count = $7, settings = $8`,
        [
          sec.id, sec.id, sec.title, sec.banglaTitle || sec.title,
          sec.enabled ?? true, sec.order ?? i, sec.limit ?? 6, JSON.stringify((sec as any).settings || {})
        ]
      );
    }
    await this.logAudit(user, 'HOMEPAGE_CONFIG_UPDATED', 'Homepage', 'home-config', 'Updated homepage layout and section ordering');
    return this.getHomepageConfig();
  }

  // --- Users & Roles ---
  public async getUsers(): Promise<User[]> {
    const res = await query(`SELECT id, email, name, role, avatar, status, created_at FROM users ORDER BY created_at ASC`);
    return res.rows.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar,
      status: u.status,
      lastActive: u.created_at || new Date().toISOString()
    }));
  }

  public async getUserById(id: string): Promise<User | null> {
    const res = await query(`SELECT id, email, name, role, avatar, status, created_at FROM users WHERE id = $1`, [id]);
    if (res.rows.length === 0) return null;
    const u = res.rows[0];
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar,
      status: u.status,
      lastActive: u.created_at || new Date().toISOString()
    };
  }

  // --- Global Search ---
  public async searchGlobal(searchQuery: string, lang: Language = 'bn'): Promise<{
    articles: Article[];
    players: Player[];
    clubs: Club[];
    competitions: Competition[];
    matches: Match[];
  }> {
    const q = searchQuery.trim();
    if (!q) {
      return { articles: [], players: [], clubs: [], competitions: [], matches: [] };
    }

    const [articlesRes, playersRes, clubsRes, competitionsRes, matchesRes] = await Promise.all([
      this.getArticles({ search: q, limit: 8, lang }),
      this.getPlayers(),
      this.getClubs(),
      this.getCompetitions(),
      this.getMatches()
    ]);

    const normalize = (str: string) => (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const lowerQ = normalize(q);
    const rawLowerQ = q.toLowerCase();

    const matchedPlayers = playersRes.filter(p => 
      normalize(p.name).includes(lowerQ) || (p.banglaName && p.banglaName.toLowerCase().includes(rawLowerQ))
    ).slice(0, 6);

    const matchedClubs = clubsRes.filter(c => 
      normalize(c.name).includes(lowerQ) || (c.banglaName && c.banglaName.toLowerCase().includes(rawLowerQ)) || (c.shortName && normalize(c.shortName).includes(lowerQ))
    ).slice(0, 6);

    const matchedCompetitions = competitionsRes.filter(c => 
      normalize(c.name).includes(lowerQ) || (c.banglaName && c.banglaName.toLowerCase().includes(rawLowerQ))
    ).slice(0, 4);

    const matchedMatches = matchesRes.filter(m => {
      const home = clubsRes.find(c => c.id === m.homeClubId);
      const away = clubsRes.find(c => c.id === m.awayClubId);
      return (
        (home && (normalize(home.name).includes(lowerQ) || home.banglaName.toLowerCase().includes(rawLowerQ))) ||
        (away && (normalize(away.name).includes(lowerQ) || away.banglaName.toLowerCase().includes(rawLowerQ)))
      );
    }).slice(0, 4);

    return {
      articles: articlesRes.items,
      players: matchedPlayers,
      clubs: matchedClubs,
      competitions: matchedCompetitions,
      matches: matchedMatches
    };
  }

  // --- Hub Data Aggregators ---
  public async getClubHubData(clubIdOrSlug: string) {
    const club = await this.getClubBySlugOrId(clubIdOrSlug);
    if (!club) return null;

    const [squad, matches, articlesRes, transfers, injuries, competition, standings] = await Promise.all([
      this.getPlayers(club.id),
      this.getMatches({ clubId: club.id }),
      this.getArticles({ clubId: club.id, limit: 10 }),
      this.getTransfers(),
      this.getInjuries(club.id),
      this.getCompetitionBySlugOrId(club.competitionId),
      this.getStandings(club.competitionId)
    ]);

    return {
      club,
      squad,
      matches,
      articles: articlesRes.items,
      transfers: transfers.filter(t => t.fromClubId === club.id || t.toClubId === club.id),
      injuries,
      competition,
      standings
    };
  }

  public async getPlayerHubData(playerIdOrSlug: string) {
    const player = await this.getPlayerBySlugOrId(playerIdOrSlug);
    if (!player) return null;

    const [club, articlesRes, transfers, injuries] = await Promise.all([
      this.getClubBySlugOrId(player.clubId),
      this.getArticles({ playerId: player.id, limit: 10 }),
      this.getTransfers(),
      this.getInjuries()
    ]);

    return {
      player,
      club,
      articles: articlesRes.items,
      transfers: transfers.filter(t => t.playerId === player.id),
      injuries: injuries.filter(i => i.playerId === player.id)
    };
  }

  public async getCompetitionHubData(compIdOrSlug: string) {
    const competition = await this.getCompetitionBySlugOrId(compIdOrSlug);
    if (!competition) return null;

    const [clubs, matches, standings, articlesRes] = await Promise.all([
      this.getClubs(competition.id),
      this.getMatches({ competitionId: competition.id }),
      this.getStandings(competition.id),
      this.getArticles({ competitionId: competition.id, limit: 10 })
    ]);

    return {
      competition,
      clubs,
      matches,
      standings,
      articles: articlesRes.items
    };
  }
}

export const db = new FootballDatabase();
