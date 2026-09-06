import { cache } from './cache';
import { query } from '../db/connection';
import dotenv from 'dotenv';

dotenv.config();

export interface FootballFixture {
  id: string;
  externalId?: string;
  competitionId: string;
  competitionName: string;
  homeClub: { id: string; name: string; logo: string };
  awayClub: { id: string; name: string; logo: string };
  homeScore: number;
  awayScore: number;
  status: 'upcoming' | 'live' | 'ht' | 'ft' | 'postponed' | 'cancelled';
  minute: number;
  date: string;
  venue?: string;
  source: 'api-football' | 'editorial' | 'mock';
  events?: any[];
}

export interface IFootballDataProvider {
  getLiveMatches(): Promise<{ matches: FootballFixture[]; source: string; cached: boolean }>;
  getUpcomingMatches(limit?: number): Promise<{ matches: FootballFixture[]; source: string; cached: boolean }>;
  getRecentResults(limit?: number): Promise<{ matches: FootballFixture[]; source: string; cached: boolean }>;
}

export class ApiFootballProvider implements IFootballDataProvider {
  private apiKey: string | undefined;
  private baseUrl = 'https://v3.football.api-sports.io';

  constructor() {
    this.apiKey = process.env.FOOTBALL_API_KEY;
  }

  public hasValidKey(): boolean {
    return !!this.apiKey && this.apiKey !== 'optional_api_football_or_opta_key';
  }

  // Fetch live matches from API-Football with Redis caching (5 min TTL)
  public async getLiveMatches(): Promise<{ matches: FootballFixture[]; source: string; cached: boolean }> {
    const cacheKey = 'football:live_matches';
    const cached = await cache.get<FootballFixture[]>(cacheKey);
    if (cached) {
      return { matches: cached, source: 'api-football (cached)', cached: true };
    }

    if (!this.hasValidKey()) {
      return this.getEditorialMatches('live');
    }

    try {
      const res = await fetch(`${this.baseUrl}/fixtures?live=all`, {
        headers: {
          'x-apisports-key': this.apiKey!,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      });

      if (!res.ok) {
        throw new Error(`API-Football error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      if (data.errors && Object.keys(data.errors).length > 0) {
        console.warn('[API-Football Quota/Error]:', data.errors);
        return this.getEditorialMatches('live');
      }

      const fixtures: FootballFixture[] = (data.response || []).slice(0, 10).map((item: any) => ({
        id: `api-${item.fixture.id}`,
        externalId: String(item.fixture.id),
        competitionId: String(item.league.id),
        competitionName: item.league.name,
        homeClub: {
          id: `club-${item.teams.home.id}`,
          name: item.teams.home.name,
          logo: item.teams.home.logo
        },
        awayClub: {
          id: `club-${item.teams.away.id}`,
          name: item.teams.away.name,
          logo: item.teams.away.logo
        },
        homeScore: item.goals.home ?? 0,
        awayScore: item.goals.away ?? 0,
        status: this.mapApiStatus(item.fixture.status.short),
        minute: item.fixture.status.elapsed || 0,
        date: item.fixture.date,
        venue: item.fixture.venue?.name || '',
        source: 'api-football'
      }));

      // Cache for 3 minutes
      await cache.set(cacheKey, fixtures, 180);
      return { matches: fixtures, source: 'api-football', cached: false };
    } catch (err: any) {
      console.warn('[API-Football Provider Exception]:', err.message);
      return this.getEditorialMatches('live');
    }
  }

  public async getUpcomingMatches(limit = 10): Promise<{ matches: FootballFixture[]; source: string; cached: boolean }> {
    return this.getEditorialMatches('upcoming', limit);
  }

  public async getRecentResults(limit = 10): Promise<{ matches: FootballFixture[]; source: string; cached: boolean }> {
    return this.getEditorialMatches('ft', limit);
  }

  private async getEditorialMatches(statusFilter?: string, limit = 10): Promise<{ matches: FootballFixture[]; source: string; cached: boolean }> {
    try {
      let sql = `
        SELECT m.*, 
               hc.name as home_name, hc.logo as home_logo,
               ac.name as away_name, ac.logo as away_logo,
               c.name as comp_name, c.bangla_name as comp_bangla_name
        FROM matches m
        JOIN clubs hc ON m.home_club_id = hc.id
        JOIN clubs ac ON m.away_club_id = ac.id
        JOIN competitions c ON m.competition_id = c.id
      `;
      const params: any[] = [];
      if (statusFilter) {
        sql += ` WHERE m.status = $1`;
        params.push(statusFilter);
      }
      sql += ` ORDER BY m.date DESC LIMIT $${params.length + 1}`;
      params.push(limit);

      const res = await query(sql, params);
      const fixtures: FootballFixture[] = res.rows.map((row: any) => ({
        id: row.id,
        externalId: row.external_id,
        competitionId: row.competition_id,
        competitionName: row.comp_bangla_name || row.comp_name,
        homeClub: {
          id: row.home_club_id,
          name: row.home_name,
          logo: row.home_logo
        },
        awayClub: {
          id: row.away_club_id,
          name: row.away_name,
          logo: row.away_logo
        },
        homeScore: row.home_score,
        awayScore: row.away_score,
        status: row.status,
        minute: row.minute,
        date: row.date,
        venue: row.stadium,
        source: 'editorial',
        events: row.events || []
      }));

      return { matches: fixtures, source: 'editorial', cached: false };
    } catch (err: any) {
      console.warn('[Editorial Matches Fetch Error]:', err.message);
      return { matches: [], source: 'unavailable', cached: false };
    }
  }

  private mapApiStatus(short: string): 'upcoming' | 'live' | 'ht' | 'ft' | 'postponed' | 'cancelled' {
    switch (short) {
      case '1H':
      case '2H':
      case 'ET':
      case 'P':
        return 'live';
      case 'HT':
      case 'BT':
        return 'ht';
      case 'FT':
      case 'AET':
      case 'PEN':
        return 'ft';
      case 'PST':
      case 'SUSP':
        return 'postponed';
      case 'CANC':
      case 'ABD':
        return 'cancelled';
      case 'NS':
      case 'TBD':
      default:
        return 'upcoming';
    }
  }
}

export const footballProvider = new ApiFootballProvider();
