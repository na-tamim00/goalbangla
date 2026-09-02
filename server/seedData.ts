import { 
  Article, Club, Player, Competition, Match, Transfer, Injury, 
  BreakingNews, Author, MediaItem, Gallery, VideoItem, HomepageSectionConfig,
  AuditLog, User, StandingRow
} from '../src/types/index';

export const initialAuthors: Author[] = [
  {
    id: 'auth-1',
    name: 'Tanvir Ahmed',
    banglaName: 'তানভীর আহমেদ',
    role: 'Chief Football Correspondent',
    banglaRole: 'প্রধান ফুটবল সংবাদদাতা',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'Covering European and Bangladesh football for over a decade. UEFA certified tactical analyst.',
    banglaBio: 'এক দশকেরও বেশি সময় ধরে ইউরোপীয় এবং বাংলাদেশ ফুটবল কভার করছেন। উয়েফা স্বীকৃত কৌশলগত বিশ্লেষক।',
    twitter: '@tanvir_football',
    email: 'tanvir@goalbangla.com',
    articleCount: 342,
    isVerified: true
  },
  {
    id: 'auth-2',
    name: 'Sadequr Rahman',
    banglaName: 'সাদেকুর রহমান',
    role: 'Senior Transfer & European League Editor',
    banglaRole: 'সিনিয়র ট্রান্সফার ও ইউরোপীয় লিগ সম্পাদক',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Specialist in Premier League, La Liga, and international transfer market investigations.',
    banglaBio: 'প্রিমিয়ার লিগ, লা লিগা এবং আন্তর্জাতিক দলবদল বাজারের তথ্য ও অনুসন্ধানী সাংবাদিক।',
    twitter: '@sadeq_transfers',
    email: 'sadequr@goalbangla.com',
    articleCount: 285,
    isVerified: true
  },
  {
    id: 'auth-3',
    name: 'Anika Tabassum',
    banglaName: 'আনিকা তাবাসসুম',
    role: 'Bangladesh Football & Women’s Game Specialist',
    banglaRole: 'বাংলাদেশ ফুটবল ও নারী ফুটবলের বিশেষজ্ঞ প্রতিবেদক',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    bio: 'Tracking grassroots, BPL, SAFF championships, and the national football renaissance in Bangladesh.',
    banglaBio: 'ঘরোয়া বিপিএল, সাফ চ্যাম্পিয়নশিপ ও বাংলাদেশের ফুটবলের অগ্রযাত্রার নিয়মিত বিশ্লেষক।',
    twitter: '@anika_sports',
    email: 'anika@goalbangla.com',
    articleCount: 194,
    isVerified: true
  }
];

export const initialCompetitions: Competition[] = [
  {
    id: 'comp-epl',
    name: 'Premier League',
    banglaName: 'ইংলিশ প্রিমিয়ার লিগ',
    slug: 'premier-league',
    code: 'EPL',
    logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=200&q=80',
    country: 'England',
    banglaCountry: 'ইংল্যান্ড',
    type: 'league',
    currentSeason: '2025/26',
    tier: 1
  },
  {
    id: 'comp-laliga',
    name: 'La Liga',
    banglaName: 'লা লিগা',
    slug: 'la-liga',
    code: 'ESP1',
    logo: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=200&q=80',
    country: 'Spain',
    banglaCountry: 'স্পেন',
    type: 'league',
    currentSeason: '2025/26',
    tier: 1
  },
  {
    id: 'comp-ucl',
    name: 'UEFA Champions League',
    banglaName: 'উয়েফা চ্যাম্পিয়ন্স লিগ',
    slug: 'champions-league',
    code: 'UCL',
    logo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=200&q=80',
    country: 'Europe',
    banglaCountry: 'ইউরোপ',
    type: 'cup',
    currentSeason: '2025/26',
    tier: 1
  },
  {
    id: 'comp-bpl',
    name: 'Bangladesh Premier League',
    banglaName: 'বাংলাদেশ প্রিমিয়ার লিগ',
    slug: 'bpl',
    code: 'BPL',
    logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=200&q=80',
    country: 'Bangladesh',
    banglaCountry: 'বাংলাদেশ',
    type: 'league',
    currentSeason: '2025/26',
    tier: 1
  },
  {
    id: 'comp-seriea',
    name: 'Serie A',
    banglaName: 'সিরি আ',
    slug: 'serie-a',
    code: 'ITA1',
    logo: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=200&q=80',
    country: 'Italy',
    banglaCountry: 'ইতালি',
    type: 'league',
    currentSeason: '2025/26',
    tier: 1
  },
  {
    id: 'comp-bundesliga',
    name: 'Bundesliga',
    banglaName: 'বুন্দেসলিগা',
    slug: 'bundesliga',
    code: 'GER1',
    logo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=200&q=80',
    country: 'Germany',
    banglaCountry: 'জার্মানি',
    type: 'league',
    currentSeason: '2025/26',
    tier: 1
  }
];

export const initialClubs: Club[] = [
  {
    id: 'club-arsenal',
    name: 'Arsenal',
    banglaName: 'আর্সেনাল',
    shortName: 'ARS',
    slug: 'arsenal',
    logo: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=160&q=80',
    country: 'England',
    banglaCountry: 'ইংল্যান্ড',
    city: 'London',
    stadium: 'Emirates Stadium',
    stadiumCapacity: 60704,
    manager: 'Mikel Arteta',
    founded: 1886,
    competitionId: 'comp-epl',
    primaryColor: '#EF0107',
    secondaryColor: '#FFFFFF',
    squadPlayerIds: ['p-saka', 'p-odegaard', 'p-saliba', 'p-rice'],
    honorsCount: 48
  },
  {
    id: 'club-mancity',
    name: 'Manchester City',
    banglaName: 'ম্যানচেস্টার সিটি',
    shortName: 'MCI',
    slug: 'manchester-city',
    logo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=160&q=80',
    country: 'England',
    banglaCountry: 'ইংল্যান্ড',
    city: 'Manchester',
    stadium: 'Etihad Stadium',
    stadiumCapacity: 53400,
    manager: 'Pep Guardiola',
    founded: 1894,
    competitionId: 'comp-epl',
    primaryColor: '#6CABDD',
    secondaryColor: '#1C2C5B',
    squadPlayerIds: ['p-haaland', 'p-debruyne', 'p-foden', 'p-rodri'],
    honorsCount: 35
  },
  {
    id: 'club-realmadrid',
    name: 'Real Madrid',
    banglaName: 'রিয়াল মাদ্রিদ',
    shortName: 'RMA',
    slug: 'real-madrid',
    logo: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=160&q=80',
    country: 'Spain',
    banglaCountry: 'স্পেন',
    city: 'Madrid',
    stadium: 'Santiago Bernabéu',
    stadiumCapacity: 85000,
    manager: 'Carlo Ancelotti',
    founded: 1902,
    competitionId: 'comp-laliga',
    primaryColor: '#FEBE10',
    secondaryColor: '#00529F',
    squadPlayerIds: ['p-mbappe', 'p-vinicius', 'p-bellingham', 'p-valverde'],
    honorsCount: 102
  },
  {
    id: 'club-barcelona',
    name: 'Barcelona',
    banglaName: 'বার্সেলোনা',
    shortName: 'BAR',
    slug: 'barcelona',
    logo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=160&q=80',
    country: 'Spain',
    banglaCountry: 'স্পেন',
    city: 'Barcelona',
    stadium: 'Spotify Camp Nou',
    stadiumCapacity: 105000,
    manager: 'Hansi Flick',
    founded: 1899,
    competitionId: 'comp-laliga',
    primaryColor: '#A50044',
    secondaryColor: '#004D98',
    squadPlayerIds: ['p-yamal', 'p-pedri', 'p-lewandowski', 'p-raphinha'],
    honorsCount: 97
  },
  {
    id: 'club-liverpool',
    name: 'Liverpool',
    banglaName: 'লিভারপুল',
    shortName: 'LIV',
    slug: 'liverpool',
    logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=160&q=80',
    country: 'England',
    banglaCountry: 'ইংল্যান্ড',
    city: 'Liverpool',
    stadium: 'Anfield',
    stadiumCapacity: 61276,
    manager: 'Arne Slot',
    founded: 1892,
    competitionId: 'comp-epl',
    primaryColor: '#C8102E',
    secondaryColor: '#00B2A9',
    squadPlayerIds: ['p-salah', 'p-vandyk', 'p-macallister'],
    honorsCount: 68
  },
  {
    id: 'club-bashundhara',
    name: 'Bashundhara Kings',
    banglaName: 'বসুন্ধরা কিংস',
    shortName: 'BSK',
    slug: 'bashundhara-kings',
    logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=160&q=80',
    country: 'Bangladesh',
    banglaCountry: 'বাংলাদেশ',
    city: 'Dhaka',
    stadium: 'Bashundhara Kings Arena',
    stadiumCapacity: 14000,
    manager: 'Valeriu Tita',
    founded: 2013,
    competitionId: 'comp-bpl',
    primaryColor: '#E30613',
    secondaryColor: '#000000',
    squadPlayerIds: ['p-robson', 'p-tariq', 'p-anisur'],
    honorsCount: 14
  },
  {
    id: 'club-abahani',
    name: 'Dhaka Abahani Limited',
    banglaName: 'ঢাকা আবাহনী লিমিটেড',
    shortName: 'ABH',
    slug: 'dhaka-abahani',
    logo: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=160&q=80',
    country: 'Bangladesh',
    banglaCountry: 'বাংলাদেশ',
    city: 'Dhaka',
    stadium: 'Bangabandhu National Stadium',
    stadiumCapacity: 36000,
    manager: 'Maruful Haque',
    founded: 1972,
    competitionId: 'comp-bpl',
    primaryColor: '#0080FF',
    secondaryColor: '#FFFF00',
    squadPlayerIds: ['p-jamal', 'p-rakib'],
    honorsCount: 38
  }
];

export const initialPlayers: Player[] = [
  {
    id: 'p-haaland',
    name: 'Erling Haaland',
    banglaName: 'আর্লিং হালান্ড',
    slug: 'erling-haaland',
    photo: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=400&q=80',
    nationality: 'Norway',
    banglaNationality: 'নরওয়ে',
    position: 'FW',
    banglaPosition: 'ফরওয়ার্ড / স্ট্রাইকার',
    number: 9,
    clubId: 'club-mancity',
    birthDate: '2000-07-21',
    age: 25,
    heightCm: 194,
    marketValue: '€200M',
    banglaMarketValue: '২০০ মিলিয়ন ইউরো',
    stats: {
      appearances: 28,
      goals: 29,
      assists: 6,
      yellowCards: 2,
      redCards: 0,
      rating: 8.42
    },
    bio: 'Prolific goalscorer with unparalleled physical presence, pace, and penalty box instinct.',
    banglaBio: 'অবিশ্বাস্য শারীরিক শক্তি, গতি এবং ফিনিশিং দক্ষতার অধিকারী বিশ্বের অন্যতম সেরা স্ট্রাইকার।'
  },
  {
    id: 'p-mbappe',
    name: 'Kylian Mbappé',
    banglaName: 'কিলিয়ান এমবাপ্পে',
    slug: 'kylian-mbappe',
    photo: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=400&q=80',
    nationality: 'France',
    banglaNationality: 'ফ্রান্স',
    position: 'FW',
    banglaPosition: 'লেফট উইঙ্গার / ফরওয়ার্ড',
    number: 9,
    clubId: 'club-realmadrid',
    birthDate: '1998-12-20',
    age: 26,
    heightCm: 178,
    marketValue: '€180M',
    banglaMarketValue: '১৮০ মিলিয়ন ইউরো',
    stats: {
      appearances: 29,
      goals: 26,
      assists: 8,
      yellowCards: 1,
      redCards: 0,
      rating: 8.35
    },
    bio: 'World Cup winner and Real Madrid talisman known for lightning acceleration and clutch goals.',
    banglaBio: 'বিশ্বকাপ জয়ী ও রিয়াল মাদ্রিদের প্রাণভোমরা, যিনি অসাধারণ গতি ও গুরুত্বপূর্ণ মুহূর্তের গোলের জন্য বিখ্যাত।'
  },
  {
    id: 'p-yamal',
    name: 'Lamine Yamal',
    banglaName: 'লামিন ইয়ামাল',
    slug: 'lamine-yamal',
    photo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=400&q=80',
    nationality: 'Spain',
    banglaNationality: 'স্পেন',
    position: 'FW',
    banglaPosition: 'রাইট উইঙ্গার',
    number: 19,
    clubId: 'club-barcelona',
    birthDate: '2007-07-13',
    age: 18,
    heightCm: 180,
    marketValue: '€160M',
    banglaMarketValue: '১৬০ মিলিয়ন ইউরো',
    stats: {
      appearances: 30,
      goals: 12,
      assists: 17,
      yellowCards: 3,
      redCards: 0,
      rating: 8.51
    },
    bio: 'Generational prodigy from La Masia with mesmerizing dribbling, vision, and Euro 2024 triumph.',
    banglaBio: 'লা মাসিয়ার বিস্ময় বালক, যার ড্রিবলিং জাদু ও গোল করানোর ক্ষমতা ফুটবল বিশ্বকে মোহিত করেছে।'
  },
  {
    id: 'p-saka',
    name: 'Bukayo Saka',
    banglaName: 'বুকায়ো সাকা',
    slug: 'bukayo-saka',
    photo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=400&q=80',
    nationality: 'England',
    banglaNationality: 'ইংল্যান্ড',
    position: 'FW',
    banglaPosition: 'রাইট উইঙ্গার',
    number: 7,
    clubId: 'club-arsenal',
    birthDate: '2001-09-05',
    age: 24,
    heightCm: 178,
    marketValue: '€140M',
    banglaMarketValue: '১৪০ মিলিয়ন ইউরো',
    stats: {
      appearances: 26,
      goals: 14,
      assists: 15,
      yellowCards: 2,
      redCards: 0,
      rating: 8.28
    },
    bio: 'Arsenal starboy and world-class winger capable of unlocking any low block defense.',
    banglaBio: 'আর্সেনালের তারকা উইঙ্গার, প্রতিপক্ষের রক্ষণ ভেঙে গোল তৈরি করায় সিদ্ধহস্ত।'
  },
  {
    id: 'p-jamal',
    name: 'Jamal Bhuyan',
    banglaName: 'জামাল ভূঁইয়া',
    slug: 'jamal-bhuyan',
    photo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=400&q=80',
    nationality: 'Bangladesh',
    banglaNationality: 'বাংলাদেশ',
    position: 'MF',
    banglaPosition: 'ডিফেন্সিভ মিডফিল্ডার / অধিনায়ক',
    number: 6,
    clubId: 'club-abahani',
    birthDate: '1990-04-10',
    age: 35,
    heightCm: 175,
    marketValue: '€150K',
    banglaMarketValue: '১.৮ কোটি টাকা',
    stats: {
      appearances: 20,
      goals: 3,
      assists: 8,
      yellowCards: 4,
      redCards: 0,
      rating: 7.6
    },
    bio: 'Iconic captain of the Bangladesh National Football Team, master of set pieces and leadership.',
    banglaBio: 'বাংলাদেশ জাতীয় দলের দীর্ঘদিনের অধিনায়ক, সেট-পিস স্পেশালিস্ট ও মাঝমাঠের স্তম্ভ।'
  },
  {
    id: 'p-tariq',
    name: 'Tariq Kazi',
    banglaName: 'তারিক কাজী',
    slug: 'tariq-kazi',
    photo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=400&q=80',
    nationality: 'Bangladesh',
    banglaNationality: 'বাংলাদেশ',
    position: 'DF',
    banglaPosition: 'সেন্টার ব্যাক / রাইট ব্যাক',
    number: 4,
    clubId: 'club-bashundhara',
    birthDate: '2000-10-06',
    age: 25,
    heightCm: 181,
    marketValue: '€200K',
    banglaMarketValue: '২.৪ কোটি টাকা',
    stats: {
      appearances: 22,
      goals: 2,
      assists: 3,
      yellowCards: 3,
      redCards: 0,
      rating: 7.75
    },
    bio: 'Finnish-born Bangladeshi defender known for calm ball distribution and physical tackles.',
    banglaBio: 'ফিনল্যান্ডে বেড়ে ওঠা বাংলাদেশি নির্ভরযোগ্য ডিফেন্ডার, বল বিল্ডআপ ও ট্যাকলে দুর্দান্ত।'
  }
];

export const initialMatches: Match[] = [
  {
    id: 'match-1',
    competitionId: 'comp-epl',
    season: '2025/26',
    homeClubId: 'club-arsenal',
    awayClubId: 'club-mancity',
    homeScore: 2,
    awayScore: 1,
    status: 'live',
    minute: 76,
    matchDate: new Date(Date.now() - 76 * 60 * 1000).toISOString(),
    venue: 'Emirates Stadium, London',
    referee: 'Michael Oliver',
    roundOrGameweek: 'Gameweek 28',
    banglaRound: 'ম্যাচ সপ্তাহ ২৮',
    homeFormation: '4-3-3',
    awayFormation: '4-2-3-1',
    homeLineup: [
      { playerId: 'p-saka', number: 7, position: 'RW', isStarter: true },
      { playerId: 'p-odegaard', number: 8, position: 'CAM', isCaptain: true, isStarter: true },
      { playerId: 'p-saliba', number: 2, position: 'CB', isStarter: true },
      { playerId: 'p-rice', number: 41, position: 'CDM', isStarter: true }
    ],
    awayLineup: [
      { playerId: 'p-haaland', number: 9, position: 'ST', isStarter: true },
      { playerId: 'p-debruyne', number: 17, position: 'CAM', isCaptain: true, isStarter: true },
      { playerId: 'p-foden', number: 47, position: 'LW', isStarter: true },
      { playerId: 'p-rodri', number: 16, position: 'CDM', isStarter: true }
    ],
    events: [
      {
        id: 'ev-1',
        minute: 23,
        type: 'goal',
        clubId: 'club-arsenal',
        playerId: 'p-saka',
        description: 'Bukayo Saka curler into top left corner after a swift counter.',
        banglaDescription: 'বুকায়ো সাকার চোখ ধাঁধানো বাঁ পায়ের বাঁকানো শটে আর্সেনালের প্রথম গোল।'
      },
      {
        id: 'ev-2',
        minute: 41,
        type: 'goal',
        clubId: 'club-mancity',
        playerId: 'p-haaland',
        description: 'Erling Haaland powerful header from Kevin De Bruyne cross.',
        banglaDescription: 'ডি ব্রুইনার ক্রসে আর্লিং হালান্ডের বুলেট হেডারে ম্যানচেস্টার সিটির সমতা।'
      },
      {
        id: 'ev-3',
        minute: 68,
        type: 'goal',
        clubId: 'club-arsenal',
        playerId: 'p-saka',
        description: 'Saka penalty converted coolly into bottom right corner.',
        banglaDescription: 'বক্সের ভেতরে ফাউলের পর নিখুঁত পেনাল্টিতে আর্সেনালকে ফের এগিয়ে নিলেন সাকা।'
      },
      {
        id: 'ev-4',
        minute: 71,
        type: 'yellow_card',
        clubId: 'club-mancity',
        playerId: 'p-rodri',
        description: 'Tactical foul on transition.',
        banglaDescription: 'মাঝমাঠে আক্রমণ ঠেকাতে কৌশলগত ফাউলের কারণে হলুদ কার্ড।'
      }
    ],
    stats: {
      possession: [52, 48],
      shots: [14, 11],
      shotsOnTarget: [6, 4],
      expectedGoals: [1.85, 1.22],
      corners: [7, 5],
      fouls: [10, 12],
      yellowCards: [1, 2],
      redCards: [0, 0],
      passes: [442, 418],
      passAccuracy: [88, 86],
      offsides: [2, 1]
    }
  },
  {
    id: 'match-2',
    competitionId: 'comp-laliga',
    season: '2025/26',
    homeClubId: 'club-realmadrid',
    awayClubId: 'club-barcelona',
    homeScore: 3,
    awayScore: 2,
    status: 'ft',
    minute: 90,
    matchDate: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    venue: 'Santiago Bernabéu, Madrid',
    referee: 'Gil Manzano',
    roundOrGameweek: 'El Clásico - Matchday 26',
    banglaRound: 'এল ক্লাসিকো - ম্যাচডে ২৬',
    homeFormation: '4-3-1-2',
    awayFormation: '4-3-3',
    homeLineup: [
      { playerId: 'p-mbappe', number: 9, position: 'ST', isStarter: true },
      { playerId: 'p-vinicius', number: 7, position: 'LW', isStarter: true }
    ],
    awayLineup: [
      { playerId: 'p-yamal', number: 19, position: 'RW', isStarter: true },
      { playerId: 'p-pedri', number: 8, position: 'CM', isStarter: true }
    ],
    events: [
      {
        id: 'ev-201',
        minute: 14,
        type: 'goal',
        clubId: 'club-barcelona',
        playerId: 'p-yamal',
        description: 'Lamine Yamal sensational solo run cutting inside and scoring.',
        banglaDescription: 'লামিন ইয়ামালের একক প্রচেষ্টায় ৩ ডিফেন্ডারকে কাটিয়ে দুর্দান্ত গোল।'
      },
      {
        id: 'ev-202',
        minute: 34,
        type: 'goal',
        clubId: 'club-realmadrid',
        playerId: 'p-mbappe',
        description: 'Kylian Mbappé blistering speed finish on the break.',
        banglaDescription: 'এমবাপ্পের তীব্র গতির ড্রিবলিং ও নিখুঁত ফিনিশে সমতায় রিয়াল।'
      },
      {
        id: 'ev-203',
        minute: 89,
        type: 'goal',
        clubId: 'club-realmadrid',
        playerId: 'p-mbappe',
        description: 'Late winner from Mbappé inside the six-yard box.',
        banglaDescription: '৮৯ মিনিটে এমবাপ্পের নাটকীয় জয়সূচক গোলে সান্তিয়াগো বার্নাব্যুতে উৎসব।'
      }
    ],
    stats: {
      possession: [46, 54],
      shots: [16, 15],
      shotsOnTarget: [7, 6],
      expectedGoals: [2.14, 1.95],
      corners: [6, 8],
      fouls: [14, 11],
      yellowCards: [3, 2],
      redCards: [0, 0],
      passes: [410, 520],
      passAccuracy: [85, 90],
      offsides: [3, 2]
    }
  },
  {
    id: 'match-3',
    competitionId: 'comp-bpl',
    season: '2025/26',
    homeClubId: 'club-bashundhara',
    awayClubId: 'club-abahani',
    homeScore: 1,
    awayScore: 0,
    status: 'live',
    minute: 62,
    matchDate: new Date(Date.now() - 62 * 60 * 1000).toISOString(),
    venue: 'Bashundhara Kings Arena, Dhaka',
    referee: 'Jashim Uddin',
    roundOrGameweek: 'Dhaka Derby - Round 14',
    banglaRound: 'ঢাকা ডার্বি - ১৪তম রাউন্ড',
    homeFormation: '4-3-3',
    awayFormation: '4-4-2',
    homeLineup: [
      { playerId: 'p-tariq', number: 4, position: 'CB', isStarter: true }
    ],
    awayLineup: [
      { playerId: 'p-jamal', number: 6, position: 'CDM', isCaptain: true, isStarter: true }
    ],
    events: [
      {
        id: 'ev-301',
        minute: 54,
        type: 'goal',
        clubId: 'club-bashundhara',
        playerId: 'p-tariq',
        description: 'Tariq Kazi corner header to break the deadlock in Kings Arena.',
        banglaDescription: 'কর্নার কিক থেকে তারিক কাজীর নিখুঁত হেডারে এগিয়ে গেল বসুন্ধরা কিংস।'
      }
    ],
    stats: {
      possession: [58, 42],
      shots: [9, 5],
      shotsOnTarget: [4, 2],
      expectedGoals: [1.12, 0.45],
      corners: [6, 3],
      fouls: [11, 15],
      yellowCards: [1, 3],
      redCards: [0, 0],
      passes: [380, 270],
      passAccuracy: [81, 74],
      offsides: [1, 2]
    }
  }
];

export const initialStandings: Record<string, StandingRow[]> = {
  'comp-epl': [
    { position: 1, clubId: 'club-arsenal', played: 28, won: 20, drawn: 5, lost: 3, goalsFor: 64, goalsAgainst: 22, goalDifference: 42, points: 65, form: ['W', 'W', 'D', 'W', 'W'] },
    { position: 2, clubId: 'club-mancity', played: 28, won: 19, drawn: 6, lost: 3, goalsFor: 67, goalsAgainst: 26, goalDifference: 41, points: 63, form: ['W', 'D', 'W', 'W', 'L'] },
    { position: 3, clubId: 'club-liverpool', played: 28, won: 18, drawn: 7, lost: 3, goalsFor: 61, goalsAgainst: 25, goalDifference: 36, points: 61, form: ['W', 'W', 'W', 'D', 'W'] }
  ],
  'comp-laliga': [
    { position: 1, clubId: 'club-realmadrid', played: 26, won: 20, drawn: 4, lost: 2, goalsFor: 59, goalsAgainst: 18, goalDifference: 41, points: 64, form: ['W', 'W', 'W', 'D', 'W'] },
    { position: 2, clubId: 'club-barcelona', played: 26, won: 19, drawn: 4, lost: 3, goalsFor: 68, goalsAgainst: 24, goalDifference: 44, points: 61, form: ['W', 'W', 'W', 'W', 'L'] }
  ],
  'comp-bpl': [
    { position: 1, clubId: 'club-bashundhara', played: 14, won: 11, drawn: 2, lost: 1, goalsFor: 32, goalsAgainst: 9, goalDifference: 23, points: 35, form: ['W', 'W', 'W', 'D', 'W'] },
    { position: 2, clubId: 'club-abahani', played: 14, won: 9, drawn: 3, lost: 2, goalsFor: 27, goalsAgainst: 12, goalDifference: 15, points: 30, form: ['W', 'D', 'W', 'W', 'L'] }
  ]
};

export const initialArticles: Article[] = [
  {
    id: 'art-1',
    slug: 'arsenal-vs-man-city-title-showdown-emirates-tactics',
    title: 'এমিরেটসে সাকার জাদুতে ম্যানচেস্টার সিটিকে স্তব্ধ করে শিরোপার পথে আর্সেনাল',
    subtitle: 'আর্তেতার হাই-প্রেসিং ট্যাকটিক্স ও সাকার জোড়া গোলে পরাস্ত গার্দিওলার সিটি',
    excerpt: 'প্রিমিয়ার লিগের সবচেয়ে গুরুত্বপূর্ণ ম্যাচে বুকায়ো সাকার অনবদ্য নৈপুণ্যে ম্যানচেস্টার সিটিকে ২-১ গোলে হারিয়ে শিরোপা লড়াইয়ে শীর্ষস্থান আরও সুসংহত করল মিকেল আর্তেতার আর্সেনাল।',
    category: 'premier-league',
    subcategory: 'Match Report',
    featuredImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'এমিরেটস স্টেডিয়ামে দ্বিতীয় গোলের পর উদযাপনে মাতোয়ারা বুকায়ো সাকা',
    imageCredit: 'Getty Images / GoalBangla Sports Desk',
    authorId: 'auth-1',
    status: 'published',
    publishedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    readTimeMinutes: 5,
    isBreaking: true,
    isFeatured: true,
    isEditorPick: true,
    tags: ['Arsenal', 'Manchester City', 'Bukayo Saka', 'Premier League', 'Pep Guardiola', 'Tactics'],
    relatedPlayerIds: ['p-saka', 'p-haaland'],
    relatedClubIds: ['club-arsenal', 'club-mancity'],
    relatedMatchIds: ['match-1'],
    relatedCompetitionIds: ['comp-epl'],
    viewsCount: 14230,
    likesCount: 890,
    blocks: [
      {
        id: 'b-1',
        type: 'callout',
        content: 'গুরুত্বপূর্ণ ম্যাচ তথ্য: এই জয়ের মাধ্যমে পেপ গার্দিওলার সিটির ওপর দুই পয়েন্টের সুস্পষ্ট লিড বজায় রাখল আর্সেনাল।',
        data: { calloutType: 'breaking' }
      },
      {
        id: 'b-2',
        type: 'paragraph',
        content: 'উত্তর লন্ডনের এমিরেটস স্টেডিয়াম আজ যেন এক ফুটন্ত কড়াইয়ে পরিণত হয়েছিল। চলতি মৌসুমের ভাগ্য নির্ধারণী মহারণে মুখোমুখি হয়েছিল শিরোপার দুই প্রধান দাবিদার—আর্সেনাল এবং ম্যানচেস্টার সিটি। খেলার শুরু থেকেই মিকেল আর্তেতার দল প্রতিপক্ষের অর্ধে চরম আগ্রাসী প্রেসিং শুরু করে।'
      },
      {
        id: 'b-3',
        type: 'heading',
        content: 'প্রথমার্ধে সাকা বনাম হালান্ডের দ্বৈরথ',
        data: { level: 2 }
      },
      {
        id: 'b-4',
        type: 'paragraph',
        content: 'ম্যাচের ২৩তম মিনিটে ডেক্লান রাইসের পাস থেকে বল পেয়ে সিটির লেফট ব্যাককে পরাস্ত করে বাঁ পায়ের বাঁকানো শটে জালের ওপরের কোণায় বল জড়ান বুকায়ো সাকা। তবে পেপ গার্দিওলার সিটি সহজে দমেনি। ৪১ মিনিটে কেভিন ডি ব্রুইনার নিখুঁত ক্রস থেকে বুলেট হেডারে সমতা ফেরান আর্লিং হালান্ড।'
      },
      {
        id: 'b-5',
        type: 'quote',
        content: 'আমরা জানতাম আমাদের মানসিকতার সর্বোচ্চ পরীক্ষা দিতে হবে। ছেলেরা প্রতি ইঞ্চি জায়গার জন্য লড়েছে। তবে লিগ এখনো শেষ হয়নি, সামনে অনেক পথ বাকি।',
        data: {
          author: 'মিকেল আর্তেতা',
          quoteTitle: 'ম্যাচ-পরবর্তী সংবাদ সম্মেলন'
        }
      },
      {
        id: 'b-6',
        type: 'match_card',
        content: 'লাইভ ম্যাচ স্কোরকার্ড ও পরিসংখ্যান',
        data: { matchId: 'match-1' }
      },
      {
        id: 'b-7',
        type: 'heading',
        content: 'কৌশলগত বিশ্লেষণ: মাঝমাঠে আর্সেনালের নিয়ন্ত্রণ',
        data: { level: 3 }
      },
      {
        id: 'b-8',
        type: 'paragraph',
        content: 'গার্দিওলা মাঝমাঠে ডাবল পিভট ব্যবহার করলেও মার্টিন ওডেগার্ড এবং রাইস ক্রমাগত রদ্রির ওপর স্পেস সংকুচিত করে রেখেছিলেন। দ্বিতীয়ার্ধের ৬৮ মিনিটে বক্সে গ্যাব্রিয়েল জেসুসকে ফাউল করা হলে পাওয়া পেনাল্টি থেকে জয়সূচক গোলটি করেন সাকা।'
      },
      {
        id: 'b-9',
        type: 'player_card',
        content: 'ম্যান অব দ্য ম্যাচ',
        data: { playerId: 'p-saka' }
      }
    ],
    translations: {
      en: {
        language: 'en',
        title: 'Saka Masterclass Sinks Manchester City as Arsenal Strengthen Title Grip at Emirates',
        subtitle: 'Arteta’s high-octane press and Saka double overcome Guardiola’s reigning champions in thriller',
        excerpt: 'Arsenal produced a resilient tactical display as Bukayo Saka struck twice to secure a crucial 2-1 victory over Manchester City in the Premier League title race.',
        slug: 'saka-masterclass-sinks-man-city-arsenal-title-grip',
        status: 'published',
        updatedAt: new Date().toISOString(),
        seo: {
          title: 'Arsenal 2-1 Man City: Saka Double Secures Crucial Premier League Victory',
          description: 'Full tactical match report as Arsenal defeat Manchester City 2-1 at Emirates Stadium courtesy of Bukayo Saka brilliance.',
          keywords: ['Arsenal', 'Manchester City', 'Bukayo Saka', 'Premier League title']
        },
        blocks: [
          {
            id: 'en-b-1',
            type: 'paragraph',
            content: 'The Emirates Stadium bore witness to a seismic afternoon in the Premier League title race as Arsenal defeated Manchester City 2-1 in a clash brimming with tactical intensity and drama.'
          },
          {
            id: 'en-b-2',
            type: 'quote',
            content: 'We knew the mental resilience required today. The boys fought for every blade of grass, but the title race is far from over.',
            data: {
              author: 'Mikel Arteta',
              quoteTitle: 'Post-match Press Conference'
            }
          }
        ]
      }
    },
    seo: {
      title: 'এমিরেটসে সাকার নৈপুণ্যে সিটিকে হারাল আর্সেনাল | গোলবাংলা',
      description: 'প্রিমিয়ার লিগে ম্যানচেস্টার সিটিকে ২-১ গোলে হারিয়ে শিরোপার শীর্ষস্থান মজবুত করল আর্সেনাল। বিস্তারিত ম্যাচ রিপোর্ট ও ট্যাকটিক্যাল অ্যানালিসিস।',
      keywords: ['আর্সেনাল', 'ম্যান সিটি', 'প্রিমিয়ার লিগ', 'বুকায়ো সাকা', 'হালান্ড'],
      structuredDataType: 'NewsArticle'
    }
  },
  {
    id: 'art-2',
    slug: 'el-clasico-real-madrid-mbappe-last-minute-winner-barcelona',
    title: 'এল ক্লাসিকোতে ৮৯ মিনিটের এমবাপ্পে জাদুতে বার্সেলোনাকে হারাল রিয়াল মাদ্রিদ',
    subtitle: 'লামিন ইয়ামালের জাদুকরী গোলের পরেও বার্নাব্যুতে শেষ হাসি আনচেলত্তির দলের',
    excerpt: 'সান্তিয়াগো বার্নাব্যুতে রোমাঞ্চকর এল ক্লাসিকোতে ৩-২ গোলে জয় তুলে নিয়েছে রিয়াল মাদ্রিদ। জোড়া গোল করে জয়ের নায়ক কিলিয়ান এমবাপ্পে।',
    category: 'la-liga',
    subcategory: 'El Clásico',
    featuredImage: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80',
    imageCaption: '৮৯ মিনিটে জয়সূচক গোলের পর কিলিয়ান এমবাপ্পের বুনো উদযাপন',
    imageCredit: 'Marca / GoalBangla',
    authorId: 'auth-2',
    status: 'published',
    publishedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    readTimeMinutes: 4,
    isBreaking: false,
    isFeatured: true,
    isEditorPick: true,
    tags: ['Real Madrid', 'Barcelona', 'El Clasico', 'Mbappe', 'Yamal', 'La Liga'],
    relatedPlayerIds: ['p-mbappe', 'p-yamal'],
    relatedClubIds: ['club-realmadrid', 'club-barcelona'],
    relatedMatchIds: ['match-2'],
    relatedCompetitionIds: ['comp-laliga'],
    viewsCount: 18900,
    likesCount: 1240,
    blocks: [
      {
        id: 'b-21',
        type: 'paragraph',
        content: 'স্প্যানিশ ফুটবলের চিরন্তন মহারণ এল ক্লাসিকো আরও একবার উপহার দিল অবিশ্বাস্য নাটকীয়তা। রিয়াল মাদ্রিদের ঘরের মাঠ সান্তিয়াগো বার্নাব্যুতে শেষ মুহূর্তের গোলে বার্সেলোনাকে ৩-২ ব্যবধানে পরাজিত করেছে লস ব্লাঙ্কোসরা।'
      },
      {
        id: 'b-22',
        type: 'heading',
        content: 'ইয়ামালের জাদুকরী সূচনা',
        data: { level: 2 }
      },
      {
        id: 'b-23',
        type: 'paragraph',
        content: 'খেলার ১৪ মিনিটে বার্সার তরুণ সেনসেশন লামিন ইয়ামাল রিয়ালের তিন ডিফেন্ডারকে ড্রিবল করে একক নৈপুণ্যে লক্ষ্যভেদ করেন। তবে দ্বিতীয়ার্ধে কার্লো আনচেলত্তির ফর্মেশন পরিবর্তন ম্যাচের চিত্র বদলে দেয়।'
      },
      {
        id: 'b-24',
        type: 'match_card',
        content: 'এল ক্লাসিকো পরিসংখ্যান',
        data: { matchId: 'match-2' }
      }
    ],
    translations: {
      en: {
        language: 'en',
        title: 'Mbappe 89th Minute Strike Delivers Dramatic El Clasico Win for Real Madrid',
        subtitle: 'Lamine Yamal magic undone by French superstar late heroics at Santiago Bernabeu',
        excerpt: 'Real Madrid edge Barcelona 3-2 in an unforgettable El Clasico as Kylian Mbappe nets an 89th-minute decider.',
        slug: 'mbappe-89th-minute-strike-delivers-dramatic-el-clasico-win',
        status: 'published',
        updatedAt: new Date().toISOString(),
        seo: {
          title: 'Real Madrid 3-2 Barcelona: Mbappe Nets Late El Clasico Winner',
          description: 'Comprehensive report from Santiago Bernabeu as Real Madrid defeat Barcelona 3-2.'
        },
        blocks: []
      }
    },
    seo: {
      title: 'এল ক্লাসিকোতে এমবাপ্পের জোড়া গোলে রিয়ালের রোমাঞ্চকর জয় | গোলবাংলা',
      description: 'বার্সেলোনাকে ৩-২ গোলে হারিয়ে লা লিগার শীর্ষে রিয়াল মাদ্রিদ। এমবাপ্পে ও ইয়ামালের পারফরম্যান্স বিশ্লেষণ।',
      keywords: ['রিয়াল মাদ্রিদ', 'বার্সেলোনা', 'এল ক্লাসিকো', 'এমবাপ্পে', 'লামিন ইয়ামাল']
    }
  },
  {
    id: 'art-3',
    slug: 'bangladesh-football-renaissance-saff-bpl-future',
    title: 'জাতীয় ফুটবলে নবজাগরণ: আধুনিক অবকাঠামো ও প্রবাসী প্রতিভায় বদলে যাচ্ছে বাংলাদেশের ফুটবল',
    subtitle: 'বসুন্ধরা কিংস অ্যারেনা থেকে ফিফা র্যাঙ্কিং উন্নতি—নতুন দিগন্তে লাল-সবুজের দল',
    excerpt: 'ঘরোয়া লিগের পেশাদারিত্ব এবং প্রবাসী প্রতিভাদের একীভূত করার মাধ্যমে আন্তর্জাতিক মঞ্চে বাংলাদেশ ফুটবল দল এক অভাবনীয় ইতিবাচক পরিবর্তনের মধ্য দিয়ে যাচ্ছে।',
    category: 'bangladesh-football',
    subcategory: 'Special Feature',
    featuredImage: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'আন্তর্জাতিক ম্যাচে জামাল ভূঁইয়া ও জাতীয় দলের তরুণদের ঐক্যবদ্ধ রূপ',
    imageCredit: 'BFF Media / GoalBangla',
    authorId: 'auth-3',
    status: 'published',
    publishedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    readTimeMinutes: 6,
    isBreaking: false,
    isFeatured: true,
    isEditorPick: true,
    tags: ['Bangladesh Football', 'BPL', 'Jamal Bhuyan', 'Tariq Kazi', 'BFF', 'SAFF'],
    relatedPlayerIds: ['p-jamal', 'p-tariq'],
    relatedClubIds: ['club-bashundhara', 'club-abahani'],
    relatedCompetitionIds: ['comp-bpl'],
    viewsCount: 9840,
    likesCount: 650,
    blocks: [
      {
        id: 'b-31',
        type: 'paragraph',
        content: 'বাংলাদেশের ফুটবল প্রেমীদের মনে বহু বছর ধরে জমে থাকা হতাশার মেঘ ধীরে ধীরে কাটতে শুরু করেছে। আন্তর্জাতিক ফুটবলে এখন আর শুধু ডিফেন্সিভ খোলসে আটকে থাকা নয়, প্রতিপক্ষের চোখে চোখ রেখে আক্রমণাত্মক ফুটবল উপহার দিচ্ছে হ্যাভিয়ের ক্যাবরেরার শিষ্যরা।'
      },
      {
        id: 'b-32',
        type: 'heading',
        content: 'পেশাদার ক্লাব কালচার ও নিজস্ব স্টেডিয়াম বিপ্লব',
        data: { level: 2 }
      },
      {
        id: 'b-33',
        type: 'paragraph',
        content: 'বসুন্ধরা কিংসের নিজস্ব আন্তর্জাতিক মানের অ্যারেনা নির্মাণ দেশের ফুটবলে এক নতুন দিগন্ত উন্মোচন করেছে। আবাহনী এবং মোহামেডানের মতো ঐতিহ্যবাহী দলগুলোও এখন তাদের একাডেমি কাঠামোর আধুনিকায়ন করছে।'
      }
    ],
    translations: {
      en: {
        language: 'en',
        title: 'The Renaissance of Bangladesh Football: Infrastructure, Diaspora Talent & The Road Ahead',
        subtitle: 'From Kings Arena to FIFA ranking strides, Bangladesh national team is carving a new identity',
        excerpt: 'In-depth analysis of how domestic professionalism and tactical modernization are reshaping Bangladesh football.',
        slug: 'renaissance-bangladesh-football-infrastructure-talent',
        status: 'published',
        updatedAt: new Date().toISOString(),
        seo: {
          title: 'Bangladesh Football Evolution: Analysis & Future Outlook',
          description: 'Exploring the new era of Bangladesh football under Javier Cabrera and BPL club professionalism.'
        },
        blocks: []
      }
    },
    seo: {
      title: 'বাংলাদেশের ফুটবলের নতুন যুগ ও সম্ভাবনা | বিশেষ প্রতিবেদন',
      description: 'বাংলাদেশ জাতীয় ফুটবল দলের সাম্প্রতিক অগ্রগতি ও ভবিষ্যৎ রূপরেখা নিয়ে গোলবাংলার বিশ্লেষণমূলক নিবন্ধ।'
    }
  },
  {
    id: 'art-4',
    slug: 'transfer-rumour-mill-summer-mega-deals-midfielders',
    title: 'গ্রীষ্মকালীন দলবদল বাজার: ১০০ মিলিয়ন ইউরোর মহাযুদ্ধে লিভারপুল, আর্সেনাল ও রিয়াল মাদ্রিদ',
    subtitle: 'ইউরোপের সেরা উদীয়মান মিডফিল্ডারদের নিয়ে ক্লাবগুলোর তীব্র দরকষাকষি',
    excerpt: 'ইউরোপীয় ফুটবল মৌসুমের শেষ প্রান্তে দলবদলের বাজারে নতুন ঢেউ। নির্ভরযোগ্য সূত্রমতে একাধিক শীর্ষ তারকাকে ঘিরে চলছে মেগা ডিলের প্রস্তুতি।',
    category: 'transfers',
    subcategory: 'Transfer Radar',
    featuredImage: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'ইউরোপীয় দলবদল মার্কেটে নতুন রেকর্ড গড়ার পথে শীর্ষ ক্লাবগুলো',
    imageCredit: 'Fabrizio Romano Updates / GoalBangla',
    authorId: 'auth-2',
    status: 'published',
    publishedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    readTimeMinutes: 4,
    isBreaking: false,
    isFeatured: false,
    isEditorPick: true,
    tags: ['Transfers', 'Rumours', 'Premier League', 'La Liga', 'Midfielders'],
    relatedClubIds: ['club-liverpool', 'club-arsenal', 'club-realmadrid'],
    viewsCount: 7600,
    likesCount: 380,
    blocks: [
      {
        id: 'b-41',
        type: 'paragraph',
        content: 'দলবদলের মৌসুম আনুষ্ঠানিকভাবে শুরু হওয়ার আগেই ইউরোপের বড় ক্লাবগুলো তাদের দল গোছানোর কাজ শুরু করে দিয়েছে।'
      }
    ],
    translations: {},
    seo: {
      title: 'ইউরোপের শীর্ষ দলবদল গুঞ্জন ও মেগা ডিল | গোলবাংলা ট্রান্সফার হাব',
      description: 'ইউরোপের ফুটবল দলবদল বাজারের সর্বশেষ নির্ভরযোগ্য তথ্য ও গুঞ্জন।'
    }
  },
  {
    id: 'art-5',
    slug: 'tactical-breakdown-hansi-flick-high-line-barcelona-revolution',
    title: 'ট্যাকটিক্যাল অ্যানালিসিস: হান্সি ফ্লিকের চরম আক্রমণাত্মক হাই-ডিফেন্সিভ লাইন ও বার্সেলোনার পুনর্জন্ম',
    subtitle: 'অফসাইড ট্র্যাপের নিখুঁত মাস্টারক্লাস ও লামিন-রাফিনহা জুটির গতিময় রূপান্তর',
    excerpt: 'হান্সি ফ্লিকের অধীনে বার্সেলোনা কীভাবে ইউরোপের সবচেয়ে বিধ্বংসী প্রেসিং এবং অফসাইড ট্র্যাপ মেশিন হয়ে উঠল—তার বিশদ ডাটা ও ভিডিও বিশ্লেষণ।',
    category: 'tactical-analysis',
    subcategory: 'Tactics & Data',
    featuredImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'ফ্লিকের হাই-লাইন ফর্মেশনের অধীনে বার্সেলোনার সুসংগঠিত প্রেস',
    imageCredit: 'Opta Analyst / GoalBangla',
    authorId: 'auth-1',
    status: 'published',
    publishedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    readTimeMinutes: 7,
    isBreaking: false,
    isFeatured: false,
    isEditorPick: true,
    tags: ['Tactics', 'Barcelona', 'Hansi Flick', 'Lamine Yamal', 'La Liga'],
    relatedClubIds: ['club-barcelona'],
    viewsCount: 11200,
    likesCount: 920,
    blocks: [
      {
        id: 'b-51',
        type: 'paragraph',
        content: 'হান্সি ফ্লিকের বার্সেলোনায় রক্ষণভাগ মাঠের মাঝরেখা পর্যন্ত এগিয়ে আসে। অপটার পরিসংখ্যানে দেখা যায় প্রতি ম্যাচে প্রতিপক্ষ দল গড়ে ৭.২ বার অফসাইডের ফাঁদে পড়ছে।'
      }
    ],
    translations: {},
    seo: {
      title: 'ট্যাকটিক্যাল অ্যানালিসিস: হান্সি ফ্লিকের বার্সেলোনা কৌশল | গোলবাংলা',
      description: 'বার্সেলোনার আধুনিক হাই-লাইন ও কাউন্টার প্রেসিং কৌশল নিয়ে গভীর ট্যাকটিক্যাল বিশ্লেষণ।'
    }
  }
];

export const initialTransfers: Transfer[] = [
  {
    id: 'tr-1',
    playerId: 'p-haaland',
    fromClubId: 'club-mancity',
    toClubId: 'club-realmadrid',
    transferType: 'permanent',
    fee: '€220M',
    banglaFee: '২২০ মিলিয়ন ইউরো',
    currency: 'EUR',
    status: 'rumour',
    confidence: 65,
    source: 'The Athletic UK & Relevo',
    tier: 1,
    date: '2026-08-28',
    details: 'Real Madrid monitoring Haaland release clause for next summer window to form dream attack with Mbappe.',
    banglaDetails: 'রিয়াল মাদ্রিদ আগামী গ্রীষ্মে এমবাপ্পের পাশে হালান্ডকে যুক্ত করতে রিলিজ ক্লজের শর্ত খতিয়ে দেখছে।'
  },
  {
    id: 'tr-2',
    playerId: 'p-yamal',
    fromClubId: 'club-barcelona',
    toClubId: 'club-barcelona',
    transferType: 'permanent',
    fee: 'Contract Extension (€1B Clause)',
    banglaFee: 'চুক্তি নবায়ন (১ বিলিয়ন ক্লজ)',
    currency: 'EUR',
    status: 'completed',
    confidence: 100,
    source: 'Official Club Announcement',
    tier: 1,
    date: '2026-08-15',
    details: 'Lamine Yamal signs landmark long-term contract at FC Barcelona with €1B termination clause.',
    banglaDetails: 'বার্সেলোনার সাথে ২০৩১ সাল পর্যন্ত দীর্ঘমেয়াদী চুক্তি স্বাক্ষর করেছেন লামিন ইয়ামাল।'
  },
  {
    id: 'tr-3',
    playerId: 'p-tariq',
    fromClubId: 'club-bashundhara',
    toClubId: 'club-abahani',
    transferType: 'permanent',
    fee: 'Free Transfer',
    banglaFee: 'ফ্রি ট্রান্সফার',
    currency: 'BDT',
    status: 'negotiation',
    confidence: 80,
    source: 'Dhaka Sports Daily',
    tier: 2,
    date: '2026-08-29',
    details: 'Dhaka Abahani in advanced talks with national defender Tariq Kazi ahead of new BPL campaign.',
    banglaDetails: 'আসন্ন বিপিএল মৌসুমের আগে তারকা ডিফেন্ডার তারিক কাজীর সাথে অগ্রবর্তী আলোচনায় আবাহনী।'
  }
];

export const initialInjuries: Injury[] = [
  {
    id: 'inj-1',
    playerId: 'p-saka',
    clubId: 'club-arsenal',
    injuryType: 'Hamstring Strain',
    banglaInjuryType: 'হ্যামস্ট্রিং ইনজুরি',
    bodyArea: 'Thigh',
    severity: 'minor',
    status: 'doubtful',
    expectedReturn: '1-2 Weeks',
    banglaExpectedReturn: '১-২ সপ্তাহ',
    source: 'Arsenal Medical Team',
    updatedAt: new Date().toISOString(),
    notes: 'Substituted in 80th minute as precaution against fatigue.',
    banglaNotes: 'ক্লান্তিজনিত সতর্কতা হিসেবে ৮০তম মিনিটে তুলে নেওয়া হয়।'
  },
  {
    id: 'inj-2',
    playerId: 'p-jamal',
    clubId: 'club-abahani',
    injuryType: 'Ankle Sprain',
    banglaInjuryType: 'গোড়ালির মচকে যাওয়া',
    bodyArea: 'Ankle',
    severity: 'minor',
    status: 'recovering',
    expectedReturn: 'Next Matchday',
    banglaExpectedReturn: 'পরবর্তী ম্যাচ সপ্তাহ',
    source: 'BFF Physio',
    updatedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    notes: 'Back in individual training on pitch.',
    banglaNotes: 'মাঠে একক অনুশীলনে ফিরেছেন।'
  }
];

export const initialBreakingNews: BreakingNews[] = [
  {
    id: 'bn-1',
    headline: 'BREAKING: Arsenal secure vital 2-1 victory over Manchester City in dramatic title clash at Emirates',
    banglaHeadline: 'ব্রেকিং: এমিরেটসে রোমাঞ্চকর ম্যাচে ম্যানচেস্টার সিটিকে ২-১ গোলে হারিয়ে শিরোপা দৌড়ে এগিয়ে আর্সেনাল',
    category: 'Premier League',
    priority: 'urgent',
    timestamp: new Date().toISOString(),
    status: 'active',
    relatedArticleSlug: 'arsenal-vs-man-city-title-showdown-emirates-tactics'
  },
  {
    id: 'bn-2',
    headline: 'UEFA Champions League quarter-final draw officially announced for upcoming round',
    banglaHeadline: 'উয়েফা চ্যাম্পিয়ন্স লিগ কোয়ার্টার ফাইনালের রোমাঞ্চকর ড্র চূড়ান্ত',
    category: 'Champions League',
    priority: 'high',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    status: 'active'
  },
  {
    id: 'bn-3',
    headline: 'Bangladesh Football Federation confirms upcoming FIFA International Friendlies at Kings Arena',
    banglaHeadline: 'কিংস অ্যারেনায় আগামী মাসে দুটি ফিফা আন্তর্জাতিক প্রীতি ম্যাচ খেলবে বাংলাদেশ',
    category: 'Bangladesh Football',
    priority: 'normal',
    timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    status: 'active',
    relatedArticleSlug: 'bangladesh-football-renaissance-saff-bpl-future'
  }
];

export const initialMedia: MediaItem[] = [
  {
    id: 'med-1',
    title: 'Saka celebrating Emirates victory',
    banglaTitle: 'এমিরেটসে সাকার বিজয় উল্লাস',
    url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
    type: 'image',
    mimeType: 'image/jpeg',
    width: 1920,
    height: 1080,
    sizeBytes: 1420500,
    altText: 'Bukayo Saka celebrating with Arsenal fans',
    caption: 'Bukayo Saka saluting the Clock End after full time.',
    photographer: 'David Price',
    credit: 'Arsenal FC via Getty Images',
    license: 'Editorial License',
    uploaderName: 'Tanvir Ahmed',
    uploadDate: new Date().toISOString(),
    tags: ['Arsenal', 'Saka', 'Celebration', 'Premier League']
  },
  {
    id: 'med-2',
    title: 'Santiago Bernabeu El Clasico atmosphere',
    banglaTitle: 'বার্নাব্যুর এল ক্লাসিকো আবহ',
    url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80',
    type: 'image',
    mimeType: 'image/jpeg',
    width: 1920,
    height: 1080,
    sizeBytes: 1850300,
    altText: 'Santiago Bernabeu stadium during El Clasico',
    caption: 'Full capacity crowd under the closed roof of Bernabeu.',
    photographer: 'Carlos Alvarez',
    credit: 'Real Madrid / Getty',
    license: 'Editorial License',
    uploaderName: 'Sadequr Rahman',
    uploadDate: new Date().toISOString(),
    tags: ['Real Madrid', 'Bernabeu', 'Stadium']
  },
  {
    id: 'med-3',
    title: 'Bashundhara Kings Arena Night Lights',
    banglaTitle: 'কিংস অ্যারেনার ফ্লাডলাইট রাতের দৃশ্য',
    url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80',
    type: 'image',
    mimeType: 'image/jpeg',
    width: 1920,
    height: 1080,
    sizeBytes: 1210400,
    altText: 'Bashundhara Kings Arena floodlights and crowd',
    caption: 'Packed crowd at Bashundhara Kings Arena for AFC Cup match.',
    photographer: 'Shakil Anwar',
    credit: 'BFF / Kings Media',
    license: 'Editorial License',
    uploaderName: 'Anika Tabassum',
    uploadDate: new Date().toISOString(),
    tags: ['Bangladesh', 'Kings Arena', 'Dhaka']
  }
];

export const initialGalleries: Gallery[] = [
  {
    id: 'gal-1',
    title: 'In Pictures: The Electric Tension of Arsenal vs Manchester City',
    banglaTitle: 'ছবিতে এমিরেটস মহারণ: আর্সেনাল ও ম্যানচেস্টার সিটির উত্তাল লড়াই',
    slug: 'pictures-arsenal-vs-man-city-emirates',
    description: 'Relive the high-stakes tactical chess match and iconic celebration moments captured by pitchside photographers.',
    banglaDescription: 'এমিরেটসের টাচলাইন থেকে ক্যামেরাবন্দি করা চরম উত্তেজনাপূর্ণ ম্যাচ মুহূর্ত এবং ভক্তদের আবেগ।',
    coverImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
    photographer: 'GoalBangla Visual Team & Getty Images',
    date: new Date().toISOString(),
    tags: ['Arsenal', 'Manchester City', 'Gallery', 'EPL'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
        caption: 'Saka wheels away after his 23rd-minute curler',
        banglaCaption: '২৩তম মিনিটে সাকার চোখ ধাঁধানো গোলের মুহূর্ত',
        credit: 'Getty Images'
      },
      {
        url: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1200&q=80',
        caption: 'Erling Haaland celebrates header in front of travelling away fans',
        banglaCaption: 'হালান্ডের সমতাসূচক হেডারের পর উদযাপন',
        credit: 'Action Images'
      },
      {
        url: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=1200&q=80',
        caption: 'Mikel Arteta and Pep Guardiola in intense tactical conversation',
        banglaCaption: 'টাচলাইনে আর্তোতা ও গার্দিওলার কৌশলগত পরামর্শ',
        credit: 'Reuters'
      }
    ]
  }
];

export const initialVideos: VideoItem[] = [
  {
    id: 'vid-1',
    title: 'Match Highlights: Arsenal 2-1 Manchester City | Tactical Breakdown',
    banglaTitle: 'ম্যাচ হাইলাইটস ও বিশ্লেষণ: আর্সেনাল ২-১ ম্যানচেস্টার সিটি',
    slug: 'highlights-arsenal-2-1-man-city',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    durationSeconds: 345,
    category: 'Highlights',
    description: 'Watch full match highlights and tactical key incidents from the Emirates summit clash.',
    banglaDescription: 'এমিরেটস স্টেডিয়ামের সবকটি গোল, সুযোগ ও ট্যাকটিক্যাল মুহূর্তের এক্সক্লুসিভ ভিডিও হাইলাইটস।',
    date: new Date().toISOString(),
    viewsCount: 45200,
    source: 'youtube'
  },
  {
    id: 'vid-2',
    title: 'Tactical Masterclass: How Hansi Flick Transformed Barcelona In 6 Months',
    banglaTitle: 'কৌশলগত বিশ্লেষণ: মাত্র ৬ মাসে কীভাবে বার্সাকে বদলে দিলেন হান্সি ফ্লিক?',
    slug: 'tactical-breakdown-hansi-flick-barcelona',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    durationSeconds: 520,
    category: 'Analysis',
    description: 'Deep dive into data metrics, pressing structures, and defensive high line numbers.',
    banglaDescription: 'বার্সেলোনার ট্যাকটিক্যাল ডাটা, হাই-লাইন এবং লামিন ইয়ামালের মুভমেন্ট নিয়ে বিস্তারিত ভিডিও চিত্র।',
    date: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    viewsCount: 68100,
    source: 'youtube'
  }
];

export const initialHomepageConfig: HomepageSectionConfig[] = [
  { id: 'sec-hero', type: 'hero_breaking', title: 'Top Breaking & Hero Stories', banglaTitle: 'ব্রেকিং ও প্রধান সংবাদ', enabled: true, order: 1 },
  { id: 'sec-scores', type: 'live_scores_strip', title: 'Live Match Scores', banglaTitle: 'লাইভ স্কোর সেন্টার', enabled: true, order: 2 },
  { id: 'sec-stories', type: 'top_stories', title: 'Today’s Big Stories', banglaTitle: 'আজকের প্রধান খবর', enabled: true, order: 3, limit: 6 },
  { id: 'sec-transfers', type: 'transfer_radar', title: 'Transfer Radar & Rumour Mill', banglaTitle: 'ট্রান্সফার রাডার ও দলবদল বাজার', enabled: true, order: 4, limit: 4 },
  { id: 'sec-epl', type: 'competition_feed', title: 'Premier League Spotlight', banglaTitle: 'প্রিমিয়ার লিগ স্পটলাইট', enabled: true, order: 5, competitionId: 'comp-epl', limit: 4 },
  { id: 'sec-laliga', type: 'competition_feed', title: 'La Liga Highlights', banglaTitle: 'লা লিগা খবর ও বিশ্লেষণ', enabled: true, order: 6, competitionId: 'comp-laliga', limit: 4 },
  { id: 'sec-bangladesh', type: 'bangladesh_focus', title: 'Bangladesh Football Renaissance', banglaTitle: 'বাংলাদেশ ফুটবল ও বিপিএল', enabled: true, order: 7, limit: 4 },
  { id: 'sec-tactics', type: 'tactical_features', title: 'Tactical Analysis & Opinions', banglaTitle: 'কৌশলগত বিশ্লেষণ ও মতামত', enabled: true, order: 8, limit: 4 },
  { id: 'sec-gallery', type: 'photo_gallery', title: 'Match Photography & Galleries', banglaTitle: 'ফটোগ্যালারি', enabled: true, order: 9 },
  { id: 'sec-video', type: 'video_highlights', title: 'GoalBangla TV & Highlights', banglaTitle: 'ভিডিও ও হাইলাইটস', enabled: true, order: 10 },
  { id: 'sec-newsletter', type: 'newsletter_signup', title: 'Weekly Football Intelligence Newsletter', banglaTitle: 'সাপ্তাহিক ফুটবল নিউজলেটার সাবস্ক্রিপশন', enabled: true, order: 11 }
];

export const initialUsers: User[] = [
  {
    id: 'usr-1',
    name: 'Tanvir Ahmed',
    email: 'admin@goalbangla.com',
    role: 'Super Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    status: 'active',
    lastActive: new Date().toISOString()
  },
  {
    id: 'usr-2',
    name: 'Sadequr Rahman',
    email: 'editor@goalbangla.com',
    role: 'Editor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    status: 'active',
    lastActive: new Date().toISOString()
  },
  {
    id: 'usr-3',
    name: 'Anika Tabassum',
    email: 'writer@goalbangla.com',
    role: 'Writer',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    status: 'active',
    lastActive: new Date().toISOString()
  },
  {
    id: 'usr-4',
    name: 'Kazi Farhan',
    email: 'translator@goalbangla.com',
    role: 'Translator',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    status: 'active',
    lastActive: new Date().toISOString()
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    userId: 'usr-1',
    userName: 'Tanvir Ahmed',
    userRole: 'Super Admin',
    action: 'ARTICLE_PUBLISHED',
    entity: 'Article',
    entityId: 'art-1',
    details: 'Published headline story: Arsenal vs Man City title clash',
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
  },
  {
    id: 'log-2',
    userId: 'usr-2',
    userName: 'Sadequr Rahman',
    userRole: 'Editor',
    action: 'BREAKING_NEWS_CREATED',
    entity: 'BreakingNews',
    entityId: 'bn-1',
    details: 'Triggered urgent breaking news alert for Arsenal win',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 'log-3',
    userId: 'usr-1',
    userName: 'Tanvir Ahmed',
    userRole: 'Super Admin',
    action: 'MATCH_SCORE_UPDATED',
    entity: 'Match',
    entityId: 'match-1',
    details: 'Updated live score: Arsenal 2 - 1 Manchester City (76 min)',
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString()
  }
];
