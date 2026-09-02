import { 
  Article, Club, Player, Competition, Match, MatchStatus, Transfer, Injury, 
  BreakingNews, Author, MediaItem, Gallery, VideoItem, HomepageSectionConfig,
  AuditLog, User, StandingRow, ArticleStatus, UserRole, Language
} from '../src/types/index';
import {
  initialArticles, initialAuthors, initialClubs, initialCompetitions,
  initialGalleries, initialInjuries, initialMatches, initialMedia,
  initialPlayers, initialStandings, initialTransfers, initialUsers,
  initialVideos, initialBreakingNews, initialHomepageConfig, initialAuditLogs
} from './seedData';

class FootballDatabase {
  private articles: Article[] = [...initialArticles];
  private authors: Author[] = [...initialAuthors];
  private clubs: Club[] = [...initialClubs];
  private players: Player[] = [...initialPlayers];
  private competitions: Competition[] = [...initialCompetitions];
  private matches: Match[] = [...initialMatches];
  private standings: Record<string, StandingRow[]> = { ...initialStandings };
  private transfers: Transfer[] = [...initialTransfers];
  private injuries: Injury[] = [...initialInjuries];
  private breakingNews: BreakingNews[] = [...initialBreakingNews];
  private media: MediaItem[] = [...initialMedia];
  private galleries: Gallery[] = [...initialGalleries];
  private videos: VideoItem[] = [...initialVideos];
  private homepageConfig: HomepageSectionConfig[] = [...initialHomepageConfig];
  private users: User[] = [...initialUsers];
  private auditLogs: AuditLog[] = [...initialAuditLogs];

  constructor() {
    // Start live simulation interval
    this.startLiveMatchSimulation();
  }

  // --- Live Match Simulation ---
  private startLiveMatchSimulation() {
    setInterval(() => {
      this.matches = this.matches.map(m => {
        if (m.status === 'live') {
          let newMinute = m.minute + 1;
          let newStatus: MatchStatus = m.status;
          if (newMinute >= 90) {
            newMinute = 90;
            newStatus = 'ft';
          } else if (newMinute === 45) {
            newStatus = 'ht';
          }
          return {
            ...m,
            minute: newMinute,
            status: newStatus
          };
        }
        return m;
      });
    }, 12000); // Ticks every 12 seconds
  }

  // --- Audit Logging ---
  public logAudit(user: { id: string; name: string; role: string }, action: string, entity: string, entityId: string, details: string) {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: user.id || 'sys-user',
      userName: user.name || 'Editorial Staff',
      userRole: user.role || 'Editor',
      action,
      entity,
      entityId,
      details,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) this.auditLogs.pop();
    return log;
  }

  public getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  // --- Articles ---
  public getArticles(params?: {
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
  }): { items: Article[]; total: number } {
    let list = [...this.articles];

    // Filter by status (default published for public)
    if (params?.status) {
      list = list.filter(a => a.status === params.status);
    }

    if (params?.category && params.category !== 'all') {
      list = list.filter(a => a.category === params.category || a.subcategory?.toLowerCase() === params.category.toLowerCase());
    }

    if (params?.clubId) {
      list = list.filter(a => a.relatedClubIds?.includes(params.clubId!));
    }

    if (params?.playerId) {
      list = list.filter(a => a.relatedPlayerIds?.includes(params.playerId!));
    }

    if (params?.competitionId) {
      list = list.filter(a => a.relatedCompetitionIds?.includes(params.competitionId!));
    }

    if (params?.tag) {
      list = list.filter(a => a.tags.some(t => t.toLowerCase() === params.tag!.toLowerCase()));
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(a => 
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q)) ||
        (a.translations?.en?.title && a.translations.en.title.toLowerCase().includes(q))
      );
    }

    // Sort latest published first
    list.sort((a, b) => new Date(b.publishedAt || b.updatedAt).getTime() - new Date(a.publishedAt || a.updatedAt).getTime());

    const total = list.length;
    const offset = params?.offset || 0;
    const limit = params?.limit || 20;
    const items = list.slice(offset, offset + limit);

    return { items, total };
  }

  public getArticleBySlug(slug: string): Article | undefined {
    return this.articles.find(a => a.slug === slug || (a.translations?.en?.slug === slug));
  }

  public getArticleById(id: string): Article | undefined {
    return this.articles.find(a => a.id === id);
  }

  public createArticle(articleData: Partial<Article>, user: { id: string; name: string; role: string }): Article {
    const id = `art-${Date.now()}`;
    const slug = articleData.slug || `article-${Date.now()}`;
    const newArticle: Article = {
      id,
      slug,
      title: articleData.title || 'শিরোনামহীন প্রতিবেদন',
      subtitle: articleData.subtitle || '',
      excerpt: articleData.excerpt || '',
      category: articleData.category || 'news',
      subcategory: articleData.subcategory,
      featuredImage: articleData.featuredImage || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
      imageCaption: articleData.imageCaption,
      imageCredit: articleData.imageCredit || 'GoalBangla Sports',
      authorId: articleData.authorId || user.id || 'auth-1',
      status: articleData.status || 'draft',
      publishedAt: articleData.status === 'published' ? new Date().toISOString() : (articleData.publishedAt || new Date().toISOString()),
      updatedAt: new Date().toISOString(),
      readTimeMinutes: articleData.readTimeMinutes || 4,
      isBreaking: !!articleData.isBreaking,
      isFeatured: !!articleData.isFeatured,
      isEditorPick: !!articleData.isEditorPick,
      tags: articleData.tags || ['Football'],
      blocks: articleData.blocks || [],
      relatedPlayerIds: articleData.relatedPlayerIds || [],
      relatedClubIds: articleData.relatedClubIds || [],
      relatedMatchIds: articleData.relatedMatchIds || [],
      relatedCompetitionIds: articleData.relatedCompetitionIds || [],
      translations: articleData.translations || {},
      seo: articleData.seo || {
        title: `${articleData.title} | গোলবাংলা`,
        description: articleData.excerpt || '',
        structuredDataType: 'NewsArticle'
      },
      viewsCount: 0,
      likesCount: 0
    };

    this.articles.unshift(newArticle);
    this.logAudit(user, 'ARTICLE_CREATED', 'Article', id, `Created article "${newArticle.title}" (Status: ${newArticle.status})`);
    return newArticle;
  }

  public updateArticle(id: string, updates: Partial<Article>, user: { id: string; name: string; role: string }): Article | null {
    const idx = this.articles.findIndex(a => a.id === id);
    if (idx === -1) return null;

    const existing = this.articles[idx];
    const updated: Article = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (updates.status === 'published' && existing.status !== 'published') {
      updated.publishedAt = new Date().toISOString();
    }

    this.articles[idx] = updated;
    this.logAudit(user, 'ARTICLE_UPDATED', 'Article', id, `Updated article "${updated.title}"`);
    return updated;
  }

  public deleteArticle(id: string, user: { id: string; name: string; role: string }): boolean {
    const idx = this.articles.findIndex(a => a.id === id);
    if (idx === -1) return false;
    const title = this.articles[idx].title;
    this.articles.splice(idx, 1);
    this.logAudit(user, 'ARTICLE_DELETED', 'Article', id, `Deleted article "${title}"`);
    return true;
  }

  // --- Breaking News ---
  public getBreakingNews(): BreakingNews[] {
    return this.breakingNews.filter(b => b.status === 'active');
  }

  public getAllBreakingNews(): BreakingNews[] {
    return this.breakingNews;
  }

  public createBreakingNews(data: Partial<BreakingNews>, user: { id: string; name: string; role: string }): BreakingNews {
    const item: BreakingNews = {
      id: `bn-${Date.now()}`,
      headline: data.headline || 'Breaking Football Update',
      banglaHeadline: data.banglaHeadline || data.headline || 'তাজা ফুটবল খবর',
      category: data.category || 'Breaking',
      priority: data.priority || 'high',
      timestamp: new Date().toISOString(),
      status: data.status || 'active',
      relatedArticleSlug: data.relatedArticleSlug
    };
    this.breakingNews.unshift(item);
    this.logAudit(user, 'BREAKING_NEWS_CREATED', 'BreakingNews', item.id, item.banglaHeadline);
    return item;
  }

  public updateBreakingNews(id: string, updates: Partial<BreakingNews>, user: { id: string; name: string; role: string }): BreakingNews | null {
    const idx = this.breakingNews.findIndex(b => b.id === id);
    if (idx === -1) return null;
    this.breakingNews[idx] = { ...this.breakingNews[idx], ...updates };
    this.logAudit(user, 'BREAKING_NEWS_UPDATED', 'BreakingNews', id, `Updated breaking news item ${id}`);
    return this.breakingNews[idx];
  }

  public deleteBreakingNews(id: string, user: { id: string; name: string; role: string }): boolean {
    const idx = this.breakingNews.findIndex(b => b.id === id);
    if (idx === -1) return false;
    this.breakingNews.splice(idx, 1);
    this.logAudit(user, 'BREAKING_NEWS_DELETED', 'BreakingNews', id, `Deleted breaking news item ${id}`);
    return true;
  }

  // --- Matches & Live Centre ---
  public getMatches(params?: { competitionId?: string; status?: string; clubId?: string }): Match[] {
    let list = [...this.matches];
    if (params?.competitionId) {
      list = list.filter(m => m.competitionId === params.competitionId);
    }
    if (params?.status) {
      list = list.filter(m => m.status === params.status);
    }
    if (params?.clubId) {
      list = list.filter(m => m.homeClubId === params.clubId || m.awayClubId === params.clubId);
    }
    return list;
  }

  public getMatchById(id: string): Match | undefined {
    return this.matches.find(m => m.id === id);
  }

  public updateMatchScore(id: string, data: { homeScore: number; awayScore: number; minute?: number; status?: Match['status'] }, user: { id: string; name: string; role: string }): Match | null {
    const match = this.matches.find(m => m.id === id);
    if (!match) return null;
    match.homeScore = data.homeScore;
    match.awayScore = data.awayScore;
    if (data.minute !== undefined) match.minute = data.minute;
    if (data.status) match.status = data.status;
    this.logAudit(user, 'MATCH_SCORE_UPDATED', 'Match', id, `Updated match score to ${match.homeScore}-${match.awayScore} (${match.minute}')`);
    return match;
  }

  public addMatchEvent(matchId: string, eventData: Partial<Match['events'][0]>, user: { id: string; name: string; role: string }): Match | null {
    const match = this.matches.find(m => m.id === matchId);
    if (!match) return null;
    const newEvent: Match['events'][0] = {
      id: `ev-${Date.now()}`,
      minute: eventData.minute || match.minute,
      type: eventData.type || 'goal',
      clubId: eventData.clubId || match.homeClubId,
      playerId: eventData.playerId || '',
      description: eventData.description || 'Match incident',
      banglaDescription: eventData.banglaDescription || 'ম্যাচ ঘটনা'
    };
    match.events.push(newEvent);
    if (newEvent.type === 'goal' || newEvent.type === 'penalty_goal') {
      if (newEvent.clubId === match.homeClubId) match.homeScore += 1;
      else match.awayScore += 1;
    }
    this.logAudit(user, 'MATCH_EVENT_ADDED', 'Match', matchId, `Added event: ${newEvent.description}`);
    return match;
  }

  // --- Clubs & Players ---
  public getClubs(competitionId?: string): Club[] {
    if (competitionId) {
      return this.clubs.filter(c => c.competitionId === competitionId);
    }
    return this.clubs;
  }

  public getClubBySlugOrId(identifier: string): Club | undefined {
    return this.clubs.find(c => c.slug === identifier || c.id === identifier);
  }

  public getPlayers(clubId?: string): Player[] {
    if (clubId) {
      return this.players.filter(p => p.clubId === clubId);
    }
    return this.players;
  }

  public getPlayerBySlugOrId(identifier: string): Player | undefined {
    return this.players.find(p => p.slug === identifier || p.id === identifier);
  }

  // --- Competitions & Standings ---
  public getCompetitions(): Competition[] {
    return this.competitions;
  }

  public getCompetitionBySlugOrId(identifier: string): Competition | undefined {
    return this.competitions.find(c => c.slug === identifier || c.id === identifier);
  }

  public getStandings(competitionId: string): StandingRow[] {
    return this.standings[competitionId] || [];
  }

  public updateStandings(competitionId: string, rows: StandingRow[], user: { id: string; name: string; role: string }): StandingRow[] {
    this.standings[competitionId] = rows;
    this.logAudit(user, 'STANDINGS_UPDATED', 'Competition', competitionId, `Updated standings for ${competitionId}`);
    return rows;
  }

  // --- Transfers & Injuries ---
  public getTransfers(status?: string): Transfer[] {
    if (status && status !== 'all') {
      return this.transfers.filter(t => t.status === status);
    }
    return this.transfers;
  }

  public createTransfer(data: Partial<Transfer>, user: { id: string; name: string; role: string }): Transfer {
    const item: Transfer = {
      id: `tr-${Date.now()}`,
      playerId: data.playerId || 'p-haaland',
      fromClubId: data.fromClubId || 'club-mancity',
      toClubId: data.toClubId || 'club-realmadrid',
      transferType: data.transferType || 'permanent',
      fee: data.fee || 'Undisclosed',
      banglaFee: data.banglaFee || 'অপ্রকাশিত ফি',
      currency: data.currency || 'EUR',
      status: data.status || 'rumour',
      confidence: data.confidence || 75,
      source: data.source || 'GoalBangla Newsroom',
      tier: data.tier || 1,
      date: new Date().toISOString().split('T')[0],
      details: data.details || '',
      banglaDetails: data.banglaDetails || ''
    };
    this.transfers.unshift(item);
    this.logAudit(user, 'TRANSFER_CREATED', 'Transfer', item.id, `Created transfer record for player ${item.playerId}`);
    return item;
  }

  public getInjuries(clubId?: string): Injury[] {
    if (clubId) {
      return this.injuries.filter(i => i.clubId === clubId);
    }
    return this.injuries;
  }

  public createInjury(data: Partial<Injury>, user: { id: string; name: string; role: string }): Injury {
    const item: Injury = {
      id: `inj-${Date.now()}`,
      playerId: data.playerId || 'p-saka',
      clubId: data.clubId || 'club-arsenal',
      injuryType: data.injuryType || 'Knock',
      banglaInjuryType: data.banglaInjuryType || 'আঘাত',
      bodyArea: data.bodyArea || 'Knee',
      severity: data.severity || 'minor',
      status: data.status || 'injured',
      expectedReturn: data.expectedReturn || 'TBD',
      banglaExpectedReturn: data.banglaExpectedReturn || 'অনির্দিষ্টকাল',
      source: data.source || 'Club Doctor',
      updatedAt: new Date().toISOString(),
      notes: data.notes || '',
      banglaNotes: data.banglaNotes || ''
    };
    this.injuries.unshift(item);
    this.logAudit(user, 'INJURY_LOGGED', 'Injury', item.id, `Logged injury for ${item.playerId}`);
    return item;
  }

  // --- Media, Galleries, Videos ---
  public getMedia(): MediaItem[] {
    return this.media;
  }

  public addMedia(data: Partial<MediaItem>, user: { id: string; name: string; role: string }): MediaItem {
    const item: MediaItem = {
      id: `med-${Date.now()}`,
      title: data.title || 'Uploaded Media',
      banglaTitle: data.banglaTitle,
      url: data.url || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
      type: data.type || 'image',
      mimeType: data.mimeType || 'image/jpeg',
      width: data.width || 1920,
      height: data.height || 1080,
      sizeBytes: data.sizeBytes || 1024000,
      altText: data.altText || data.title || 'Football match image',
      caption: data.caption || '',
      photographer: data.photographer || 'Editorial Staff',
      credit: data.credit || 'GoalBangla Media',
      license: data.license || 'Editorial License',
      uploaderName: user.name || 'Editorial Staff',
      uploadDate: new Date().toISOString(),
      tags: data.tags || ['Football']
    };
    this.media.unshift(item);
    this.logAudit(user, 'MEDIA_UPLOADED', 'Media', item.id, `Uploaded ${item.title}`);
    return item;
  }

  public getGalleries(): Gallery[] {
    return this.galleries;
  }

  public getVideos(): VideoItem[] {
    return this.videos;
  }

  public getAuthors(): Author[] {
    return this.authors;
  }

  public getAuthorById(id: string): Author | undefined {
    return this.authors.find(a => a.id === id);
  }

  // --- Homepage Config ---
  public getHomepageConfig(): HomepageSectionConfig[] {
    return this.homepageConfig.sort((a, b) => a.order - b.order);
  }

  public updateHomepageConfig(sections: HomepageSectionConfig[], user: { id: string; name: string; role: string }): HomepageSectionConfig[] {
    this.homepageConfig = sections;
    this.logAudit(user, 'HOMEPAGE_CONFIG_UPDATED', 'Homepage', 'home-config', 'Updated homepage layout and section ordering');
    return this.homepageConfig;
  }

  // --- Users & Roles ---
  public getUsers(): User[] {
    return this.users;
  }

  public getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  // --- Global Search ---
  public searchGlobal(query: string, lang: Language = 'bn'): {
    articles: Article[];
    players: Player[];
    clubs: Club[];
    competitions: Competition[];
    matches: Match[];
  } {
    const q = query.toLowerCase().trim();
    if (!q) {
      return { articles: [], players: [], clubs: [], competitions: [], matches: [] };
    }

    const matchedArticles = this.articles.filter(a => 
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.tags.some(t => t.toLowerCase().includes(q)) ||
      (a.translations?.en?.title && a.translations.en.title.toLowerCase().includes(q))
    ).slice(0, 8);

    const matchedPlayers = this.players.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.banglaName.toLowerCase().includes(q) ||
      p.nationality.toLowerCase().includes(q) ||
      p.banglaNationality.toLowerCase().includes(q)
    ).slice(0, 6);

    const matchedClubs = this.clubs.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.banglaName.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.stadium.toLowerCase().includes(q)
    ).slice(0, 6);

    const matchedCompetitions = this.competitions.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.banglaName.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedMatches = this.matches.filter(m => {
      const home = this.getClubBySlugOrId(m.homeClubId);
      const away = this.getClubBySlugOrId(m.awayClubId);
      return (
        home?.name.toLowerCase().includes(q) ||
        home?.banglaName.toLowerCase().includes(q) ||
        away?.name.toLowerCase().includes(q) ||
        away?.banglaName.toLowerCase().includes(q) ||
        m.venue.toLowerCase().includes(q)
      );
    }).slice(0, 4);

    return {
      articles: matchedArticles,
      players: matchedPlayers,
      clubs: matchedClubs,
      competitions: matchedCompetitions,
      matches: matchedMatches
    };
  }

  // --- Aggregate Entity Page Data ---
  public getClubHubData(clubIdOrSlug: string) {
    const club = this.getClubBySlugOrId(clubIdOrSlug);
    if (!club) return null;
    const squad = this.players.filter(p => p.clubId === club.id);
    const matches = this.matches.filter(m => m.homeClubId === club.id || m.awayClubId === club.id);
    const articles = this.articles.filter(a => a.relatedClubIds?.includes(club.id));
    const transfers = this.transfers.filter(t => t.fromClubId === club.id || t.toClubId === club.id);
    const injuries = this.injuries.filter(i => i.clubId === club.id);
    const competition = this.competitions.find(c => c.id === club.competitionId);
    const standings = this.standings[club.competitionId] || [];

    return {
      club,
      squad,
      matches,
      articles,
      transfers,
      injuries,
      competition,
      standings
    };
  }

  public getPlayerHubData(playerIdOrSlug: string) {
    const player = this.getPlayerBySlugOrId(playerIdOrSlug);
    if (!player) return null;
    const club = this.clubs.find(c => c.id === player.clubId);
    const articles = this.articles.filter(a => a.relatedPlayerIds?.includes(player.id));
    const transfers = this.transfers.filter(t => t.playerId === player.id);
    const injuries = this.injuries.filter(i => i.playerId === player.id);

    return {
      player,
      club,
      articles,
      transfers,
      injuries
    };
  }

  public getCompetitionHubData(compIdOrSlug: string) {
    const comp = this.getCompetitionBySlugOrId(compIdOrSlug);
    if (!comp) return null;
    const clubs = this.clubs.filter(c => c.competitionId === comp.id);
    const matches = this.matches.filter(m => m.competitionId === comp.id);
    const standings = this.standings[comp.id] || [];
    const articles = this.articles.filter(a => a.relatedCompetitionIds?.includes(comp.id) || a.category === comp.slug);

    return {
      competition: comp,
      clubs,
      matches,
      standings,
      articles
    };
  }
}

export const db = new FootballDatabase();
