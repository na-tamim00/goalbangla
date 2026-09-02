import { 
  Article, Club, Player, Competition, Match, Transfer, Injury, 
  BreakingNews, Author, MediaItem, Gallery, VideoItem, HomepageSectionConfig,
  AuditLog, User, StandingRow, Language
} from '../types';

export const api = {
  // Articles
  async getArticles(params?: {
    lang?: Language;
    category?: string;
    clubId?: string;
    playerId?: string;
    competitionId?: string;
    status?: string;
    search?: string;
    tag?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: Article[]; total: number }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
      });
    }
    const res = await fetch(`/api/articles?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch articles');
    return res.json();
  },

  async getArticleBySlug(slug: string): Promise<Article> {
    const res = await fetch(`/api/articles/${slug}`);
    if (!res.ok) throw new Error('Article not found');
    return res.json();
  },

  async createArticle(data: Partial<Article>, userHeader?: { id: string; name: string; role: string }): Promise<Article> {
    const res = await fetch('/api/articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userHeader?.id || '',
        'x-user-name': userHeader?.name || '',
        'x-user-role': userHeader?.role || ''
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create article');
    return res.json();
  },

  async updateArticle(id: string, data: Partial<Article>, userHeader?: { id: string; name: string; role: string }): Promise<Article> {
    const res = await fetch(`/api/articles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userHeader?.id || '',
        'x-user-name': userHeader?.name || '',
        'x-user-role': userHeader?.role || ''
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update article');
    return res.json();
  },

  async deleteArticle(id: string, userHeader?: { id: string; name: string; role: string }): Promise<void> {
    const res = await fetch(`/api/articles/${id}`, {
      method: 'DELETE',
      headers: {
        'x-user-id': userHeader?.id || '',
        'x-user-name': userHeader?.name || '',
        'x-user-role': userHeader?.role || ''
      }
    });
    if (!res.ok) throw new Error('Failed to delete article');
  },

  // Breaking news
  async getBreakingNews(all = false): Promise<BreakingNews[]> {
    const res = await fetch(`/api/breaking-news${all ? '?all=true' : ''}`);
    if (!res.ok) throw new Error('Failed to fetch breaking news');
    return res.json();
  },

  async createBreakingNews(data: Partial<BreakingNews>, userHeader?: { id: string; name: string; role: string }): Promise<BreakingNews> {
    const res = await fetch('/api/breaking-news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userHeader?.id || '',
        'x-user-name': userHeader?.name || '',
        'x-user-role': userHeader?.role || ''
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create breaking news');
    return res.json();
  },

  async updateBreakingNews(id: string, data: Partial<BreakingNews>, userHeader?: { id: string; name: string; role: string }): Promise<BreakingNews> {
    const res = await fetch(`/api/breaking-news/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userHeader?.id || '',
        'x-user-name': userHeader?.name || '',
        'x-user-role': userHeader?.role || ''
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update breaking news');
    return res.json();
  },

  async deleteBreakingNews(id: string, userHeader?: { id: string; name: string; role: string }): Promise<void> {
    const res = await fetch(`/api/breaking-news/${id}`, {
      method: 'DELETE',
      headers: {
        'x-user-id': userHeader?.id || '',
        'x-user-name': userHeader?.name || '',
        'x-user-role': userHeader?.role || ''
      }
    });
    if (!res.ok) throw new Error('Failed to delete breaking news');
  },

  // Matches
  async getMatches(params?: { competitionId?: string; status?: string; clubId?: string }): Promise<Match[]> {
    const query = new URLSearchParams();
    if (params?.competitionId) query.append('competitionId', params.competitionId);
    if (params?.status) query.append('status', params.status);
    if (params?.clubId) query.append('clubId', params.clubId);
    const res = await fetch(`/api/matches?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch matches');
    return res.json();
  },

  async getMatchById(id: string): Promise<Match> {
    const res = await fetch(`/api/matches/${id}`);
    if (!res.ok) throw new Error('Failed to fetch match');
    return res.json();
  },

  async updateMatchScore(id: string, data: { homeScore: number; awayScore: number; minute?: number; status?: Match['status'] }, userHeader?: { id: string; name: string; role: string }): Promise<Match> {
    const res = await fetch(`/api/matches/${id}/score`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userHeader?.id || '',
        'x-user-name': userHeader?.name || '',
        'x-user-role': userHeader?.role || ''
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update match score');
    return res.json();
  },

  async addMatchEvent(matchId: string, eventData: Partial<Match['events'][0]>, userHeader?: { id: string; name: string; role: string }): Promise<Match> {
    const res = await fetch(`/api/matches/${matchId}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userHeader?.id || '',
        'x-user-name': userHeader?.name || '',
        'x-user-role': userHeader?.role || ''
      },
      body: JSON.stringify(eventData)
    });
    if (!res.ok) throw new Error('Failed to add match event');
    return res.json();
  },

  // Clubs & Players
  async getClubs(competitionId?: string): Promise<Club[]> {
    const res = await fetch(`/api/clubs${competitionId ? `?competitionId=${competitionId}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch clubs');
    return res.json();
  },

  async getClubDetails(idOrSlug: string): Promise<any> {
    const res = await fetch(`/api/clubs/${idOrSlug}`);
    if (!res.ok) throw new Error('Failed to fetch club details');
    return res.json();
  },

  async getPlayers(clubId?: string): Promise<Player[]> {
    const res = await fetch(`/api/players${clubId ? `?clubId=${clubId}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch players');
    return res.json();
  },

  async getPlayerDetails(idOrSlug: string): Promise<any> {
    const res = await fetch(`/api/players/${idOrSlug}`);
    if (!res.ok) throw new Error('Failed to fetch player details');
    return res.json();
  },

  // Competitions & Standings
  async getCompetitions(): Promise<Competition[]> {
    const res = await fetch('/api/competitions');
    if (!res.ok) throw new Error('Failed to fetch competitions');
    return res.json();
  },

  async getCompetitionDetails(idOrSlug: string): Promise<any> {
    const res = await fetch(`/api/competitions/${idOrSlug}`);
    if (!res.ok) throw new Error('Failed to fetch competition details');
    return res.json();
  },

  async getStandings(competitionId: string): Promise<StandingRow[]> {
    const res = await fetch(`/api/standings/${competitionId}`);
    if (!res.ok) throw new Error('Failed to fetch standings');
    return res.json();
  },

  // Transfers & Injuries
  async getTransfers(status?: string): Promise<Transfer[]> {
    const res = await fetch(`/api/transfers${status ? `?status=${status}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch transfers');
    return res.json();
  },

  async createTransfer(data: Partial<Transfer>, userHeader?: { id: string; name: string; role: string }): Promise<Transfer> {
    const res = await fetch('/api/transfers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userHeader?.id || '',
        'x-user-name': userHeader?.name || '',
        'x-user-role': userHeader?.role || ''
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create transfer');
    return res.json();
  },

  async getInjuries(clubId?: string): Promise<Injury[]> {
    const res = await fetch(`/api/injuries${clubId ? `?clubId=${clubId}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch injuries');
    return res.json();
  },

  async createInjury(data: Partial<Injury>, userHeader?: { id: string; name: string; role: string }): Promise<Injury> {
    const res = await fetch('/api/injuries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userHeader?.id || '',
        'x-user-name': userHeader?.name || '',
        'x-user-role': userHeader?.role || ''
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to log injury');
    return res.json();
  },

  // Media, Galleries, Videos, Authors
  async getMedia(): Promise<MediaItem[]> {
    const res = await fetch('/api/media');
    if (!res.ok) throw new Error('Failed to fetch media');
    return res.json();
  },

  async uploadMedia(data: Partial<MediaItem>, userHeader?: { id: string; name: string; role: string }): Promise<MediaItem> {
    const res = await fetch('/api/media', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userHeader?.id || '',
        'x-user-name': userHeader?.name || '',
        'x-user-role': userHeader?.role || ''
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to add media');
    return res.json();
  },

  async getGalleries(): Promise<Gallery[]> {
    const res = await fetch('/api/galleries');
    if (!res.ok) throw new Error('Failed to fetch galleries');
    return res.json();
  },

  async getVideos(): Promise<VideoItem[]> {
    const res = await fetch('/api/videos');
    if (!res.ok) throw new Error('Failed to fetch videos');
    return res.json();
  },

  async getAuthors(): Promise<Author[]> {
    const res = await fetch('/api/authors');
    if (!res.ok) throw new Error('Failed to fetch authors');
    return res.json();
  },

  // Search
  async searchGlobal(q: string, lang: Language = 'bn'): Promise<any> {
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&lang=${lang}`);
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  },

  // Homepage Config
  async getHomepageConfig(): Promise<HomepageSectionConfig[]> {
    const res = await fetch('/api/homepage-config');
    if (!res.ok) throw new Error('Failed to fetch homepage config');
    return res.json();
  },

  async updateHomepageConfig(sections: HomepageSectionConfig[], userHeader?: { id: string; name: string; role: string }): Promise<HomepageSectionConfig[]> {
    const res = await fetch('/api/homepage-config', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userHeader?.id || '',
        'x-user-name': userHeader?.name || '',
        'x-user-role': userHeader?.role || ''
      },
      body: JSON.stringify({ sections })
    });
    if (!res.ok) throw new Error('Failed to update homepage config');
    return res.json();
  },

  // Audit Logs & Users
  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch('/api/audit-logs');
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  async getUsers(): Promise<User[]> {
    const res = await fetch('/api/users');
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  // AI Assistant
  async requestAIAssist(action: 'translate' | 'headline' | 'summary' | 'tactical_analysis', text: string, targetLang: string = 'bn', context?: string): Promise<any> {
    const res = await fetch('/api/ai/editorial-assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, text, targetLang, context })
    });
    if (!res.ok) throw new Error('AI assist request failed');
    return res.json();
  }
};
