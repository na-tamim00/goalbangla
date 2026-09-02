export type Language = 'bn' | 'en' | 'es' | 'ar' | 'fr';

export type ArticleStatus = 'draft' | 'review' | 'approved' | 'scheduled' | 'published' | 'archived';

export type ContentBlockType = 
  | 'paragraph'
  | 'heading'
  | 'image'
  | 'gallery'
  | 'video'
  | 'quote'
  | 'callout'
  | 'table'
  | 'match_card'
  | 'player_card'
  | 'club_card'
  | 'related_articles'
  | 'divider';

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  content: string; // text, heading or description
  data?: {
    level?: 2 | 3 | 4;
    url?: string;
    caption?: string;
    credit?: string;
    alt?: string;
    author?: string;
    quoteTitle?: string;
    images?: Array<{ url: string; caption?: string; credit?: string }>;
    matchId?: string;
    playerId?: string;
    clubId?: string;
    articleIds?: string[];
    calloutType?: 'info' | 'breaking' | 'stat' | 'tactical';
    tableHeaders?: string[];
    tableRows?: string[][];
  };
}

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  structuredDataType?: 'NewsArticle' | 'SportsEvent' | 'SportsTeam' | 'Person';
}

export interface ArticleTranslation {
  language: Language;
  title: string;
  subtitle?: string;
  excerpt: string;
  slug: string;
  blocks: ContentBlock[];
  status: ArticleStatus;
  seo: SEOMetadata;
  updatedAt: string;
}

export type ArticleCategory = 
  | 'news' 
  | 'transfers' 
  | 'matches' 
  | 'opinion' 
  | 'tactical-analysis' 
  | 'features' 
  | 'bangladesh-football' 
  | 'premier-league' 
  | 'la-liga' 
  | 'champions-league' 
  | 'international';

export interface Article {
  id: string;
  slug: string; // Canonical slug (default Bangla)
  title: string;
  subtitle?: string;
  excerpt: string;
  category: ArticleCategory;
  subcategory?: string;
  featuredImage: string;
  imageCaption?: string;
  imageCredit?: string;
  authorId: string;
  status: ArticleStatus;
  publishedAt: string;
  updatedAt: string;
  readTimeMinutes: number;
  isBreaking?: boolean;
  isFeatured?: boolean;
  isEditorPick?: boolean;
  tags: string[];
  blocks: ContentBlock[];
  relatedPlayerIds?: string[];
  relatedClubIds?: string[];
  relatedMatchIds?: string[];
  relatedCompetitionIds?: string[];
  translations: Record<string, ArticleTranslation>; // key: 'en', 'es', etc.
  seo: SEOMetadata;
  viewsCount: number;
  likesCount: number;
}

export interface Author {
  id: string;
  name: string;
  banglaName: string;
  role: string;
  banglaRole: string;
  avatar: string;
  bio: string;
  banglaBio: string;
  twitter?: string;
  email?: string;
  articleCount: number;
  isVerified: boolean;
}

export interface Competition {
  id: string;
  name: string;
  banglaName: string;
  slug: string;
  code: string;
  logo: string;
  country: string;
  banglaCountry: string;
  type: 'league' | 'cup' | 'international';
  currentSeason: string;
  tier: number;
}

export interface Club {
  id: string;
  name: string;
  banglaName: string;
  shortName: string;
  slug: string;
  logo: string;
  country: string;
  banglaCountry: string;
  city: string;
  stadium: string;
  stadiumCapacity: number;
  manager: string;
  founded: number;
  competitionId: string;
  primaryColor: string;
  secondaryColor: string;
  squadPlayerIds: string[];
  honorsCount: number;
}

export interface Player {
  id: string;
  name: string;
  banglaName: string;
  slug: string;
  photo: string;
  nationality: string;
  banglaNationality: string;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  banglaPosition: string;
  number: number;
  clubId: string;
  birthDate: string;
  age: number;
  heightCm: number;
  marketValue: string;
  banglaMarketValue: string;
  stats: {
    appearances: number;
    goals: number;
    assists: number;
    cleanSheets?: number;
    yellowCards: number;
    redCards: number;
    rating: number;
  };
  bio: string;
  banglaBio: string;
  injuryStatus?: 'healthy' | 'doubtful' | 'injured';
}

export type MatchStatus = 'upcoming' | 'live' | 'ht' | 'ft' | 'postponed' | 'cancelled';

export interface MatchEvent {
  id: string;
  minute: number;
  extraMinute?: number;
  type: 'goal' | 'penalty_goal' | 'own_goal' | 'yellow_card' | 'red_card' | 'substitution' | 'var';
  clubId: string;
  playerId: string;
  assistPlayerId?: string;
  description: string;
  banglaDescription: string;
}

export interface MatchLineupPlayer {
  playerId: string;
  number: number;
  position: string;
  isCaptain?: boolean;
  isStarter: boolean;
}

export interface MatchStatistics {
  possession: [number, number]; // [home, away] %
  shots: [number, number];
  shotsOnTarget: [number, number];
  expectedGoals: [number, number]; // xG
  corners: [number, number];
  fouls: [number, number];
  yellowCards: [number, number];
  redCards: [number, number];
  passes: [number, number];
  passAccuracy: [number, number]; // %
  offsides: [number, number];
}

export interface Match {
  id: string;
  competitionId: string;
  season: string;
  homeClubId: string;
  awayClubId: string;
  homeScore: number;
  awayScore: number;
  homePenaltyScore?: number;
  awayPenaltyScore?: number;
  status: MatchStatus;
  minute: number;
  matchDate: string; // ISO string
  venue: string;
  referee: string;
  events: MatchEvent[];
  stats: MatchStatistics;
  homeFormation: string;
  awayFormation: string;
  homeLineup: MatchLineupPlayer[];
  awayLineup: MatchLineupPlayer[];
  relatedArticleId?: string;
  roundOrGameweek: string;
  banglaRound: string;
}

export interface StandingRow {
  position: number;
  clubId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: Array<'W' | 'D' | 'L'>;
}

export type TransferStatus = 
  | 'rumour' 
  | 'interest' 
  | 'negotiation' 
  | 'medical' 
  | 'agreed' 
  | 'completed' 
  | 'rejected' 
  | 'cancelled';

export interface Transfer {
  id: string;
  playerId: string;
  fromClubId: string;
  toClubId: string;
  transferType: 'permanent' | 'loan' | 'free';
  fee: string;
  banglaFee: string;
  currency: string;
  status: TransferStatus;
  confidence: number; // 1-100%
  source: string;
  tier: 1 | 2 | 3;
  date: string;
  relatedArticleId?: string;
  details: string;
  banglaDetails: string;
}

export interface Injury {
  id: string;
  playerId: string;
  clubId: string;
  injuryType: string;
  banglaInjuryType: string;
  bodyArea: string;
  severity: 'minor' | 'moderate' | 'severe';
  status: 'doubtful' | 'injured' | 'out' | 'recovering' | 'returned';
  expectedReturn: string;
  banglaExpectedReturn: string;
  source: string;
  updatedAt: string;
  notes?: string;
  banglaNotes?: string;
}

export interface BreakingNews {
  id: string;
  headline: string;
  banglaHeadline: string;
  category: string;
  priority: 'urgent' | 'high' | 'normal';
  timestamp: string;
  status: 'active' | 'archived';
  relatedArticleSlug?: string;
}

export interface MediaItem {
  id: string;
  title: string;
  banglaTitle?: string;
  url: string;
  type: 'image' | 'video';
  mimeType: string;
  width: number;
  height: number;
  sizeBytes: number;
  altText: string;
  caption: string;
  photographer?: string;
  credit: string;
  license: string;
  uploaderName: string;
  uploadDate: string;
  tags: string[];
}

export interface Gallery {
  id: string;
  title: string;
  banglaTitle: string;
  slug: string;
  description: string;
  banglaDescription: string;
  coverImage: string;
  images: Array<{
    url: string;
    caption: string;
    banglaCaption: string;
    credit: string;
  }>;
  photographer: string;
  date: string;
  tags: string[];
}

export interface VideoItem {
  id: string;
  title: string;
  banglaTitle: string;
  slug: string;
  videoUrl: string;
  thumbnail: string;
  durationSeconds: number;
  category: string;
  description: string;
  banglaDescription: string;
  date: string;
  viewsCount: number;
  source: 'youtube' | 'vimeo' | 'direct';
}

export interface HomepageSectionConfig {
  id: string;
  type: 
    | 'hero_breaking'
    | 'live_scores_strip'
    | 'top_stories'
    | 'transfer_radar'
    | 'competition_feed'
    | 'bangladesh_focus'
    | 'tactical_features'
    | 'photo_gallery'
    | 'video_highlights'
    | 'newsletter_signup';
  title: string;
  banglaTitle: string;
  enabled: boolean;
  order: number;
  limit?: number;
  competitionId?: string;
  manualArticleIds?: string[];
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  timestamp: string;
}

export type UserRole = 
  | 'Super Admin' 
  | 'Admin' 
  | 'Editor' 
  | 'Writer' 
  | 'Translator' 
  | 'Media Manager' 
  | 'Data Operator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  status: 'active' | 'inactive';
  lastActive: string;
}
