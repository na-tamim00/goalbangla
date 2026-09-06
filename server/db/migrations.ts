import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { query } from './connection';
import {
  initialAuthors, initialCompetitions, initialClubs, initialPlayers,
  initialArticles, initialMatches, initialStandings, initialTransfers,
  initialInjuries, initialBreakingNews, initialMedia, initialGalleries,
  initialVideos, initialHomepageConfig, initialUsers
} from '../seedData';

export async function runMigrations() {
  console.log('[Migration] Verifying database schema and initial state...');

  // 1. Apply schema.sql
  try {
    const schemaPath = path.join(process.cwd(), 'server', 'db', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      await query(sql);
      console.log('[Migration] Schema verified.');
    }
  } catch (err: any) {
    console.error('[Migration Error]: Failed to apply schema.sql:', err.message);
  }

  // Ensure Supabase S3 storage bucket is public
  try {
    await query(`UPDATE storage.buckets SET public = true WHERE id = 'goalbangla-media'`);
  } catch {
    // Non-fatal if storage schema is not present in local testing
  }

  // 2. Ensure Roles & Permissions
  try {
    const roles = [
      { name: 'Super Admin', desc: 'Full administrative newsroom authority', perms: ['*'] },
      { name: 'Admin', desc: 'Editorial leadership and platform supervisor', perms: ['article:*', 'media:*', 'match:*', 'standings:*', 'transfer:*', 'injury:*', 'translation:*'] },
      { name: 'Editor', desc: 'Reviews, approves, schedules and publishes articles', perms: ['article:create', 'article:edit', 'article:publish', 'article:delete', 'breaking:manage', 'media:create', 'translation:create', 'translation:publish', 'match:update', 'transfer:manage', 'injury:manage'] },
      { name: 'Writer', desc: 'Authors drafts and submits content for editorial review', perms: ['article:create', 'article:edit', 'media:create'] },
      { name: 'Translator', desc: 'Translates and localizes multilingual stories', perms: ['translation:create', 'translation:publish'] },
      { name: 'Media Manager', desc: 'Curates photography, galleries and video highlights', perms: ['media:create', 'media:delete', 'gallery:manage', 'video:manage'] },
      { name: 'Data Operator', desc: 'Maintains live match centre, scores, tables and transfers', perms: ['match:update', 'standings:update', 'transfer:manage', 'injury:manage'] }
    ];

    for (const r of roles) {
      await query(
        `INSERT INTO roles (name, description, permissions) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (name) DO UPDATE SET description = $2, permissions = $3`,
        [r.name, r.desc, JSON.stringify(r.perms)]
      );
    }
  } catch (err: any) {
    console.error('[Migration Error]: Roles init:', err.message);
  }

  // 3. Seed Users if empty
  try {
    const userCount = await query(`SELECT COUNT(*) FROM users`);
    if (parseInt(userCount.rows[0].count, 10) === 0) {
      console.log('[Migration] Seeding initial staff users...');
      const defaultHash = await bcrypt.hash('admin123', 10);

      const usersToInsert = [
        { id: 'usr-1', email: 'admin@goalbangla.com', name: 'Tanvir Ahmed', role: 'Super Admin', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
        { id: 'usr-1b', email: 'rafiq@goalbangla.com', name: 'Rafiqul Islam', role: 'Admin', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
        { id: 'usr-2', email: 'editor@goalbangla.com', name: 'Sadequr Rahman', role: 'Editor', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
        { id: 'usr-3', email: 'writer@goalbangla.com', name: 'Anika Tabassum', role: 'Writer', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' },
        { id: 'usr-4', email: 'translator@goalbangla.com', name: 'Kazi Farhan', role: 'Translator', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
        { id: 'usr-5', email: 'media@goalbangla.com', name: 'Shakil Anwar', role: 'Media Manager', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80' },
        { id: 'usr-6', email: 'data@goalbangla.com', name: 'Mehedi Hasan', role: 'Data Operator', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80' }
      ];

      for (const u of usersToInsert) {
        await query(
          `INSERT INTO users (id, email, password_hash, name, role, avatar, status) 
           VALUES ($1, $2, $3, $4, $5, $6, 'active')
           ON CONFLICT (email) DO NOTHING`,
          [u.id, u.email, defaultHash, u.name, u.role, u.avatar]
        );
      }
    }
  } catch (err: any) {
    console.error('[Migration Error]: Users seed:', err.message);
  }

  // 4. Seed Authors if empty
  try {
    const res = await query(`SELECT COUNT(*) FROM authors`);
    if (parseInt(res.rows[0].count, 10) === 0) {
      console.log('[Migration] Seeding authors...');
      for (const a of initialAuthors) {
        await query(
          `INSERT INTO authors (id, name, bangla_name, role, avatar, bio, twitter_handle)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO NOTHING`,
          [a.id, a.name, a.banglaName, a.role, a.avatar, a.bio, a.twitter || null]
        );
      }
      const staffUsers = await query(`SELECT id, name, role, avatar FROM users`);
      for (const u of staffUsers.rows) {
        await query(
          `INSERT INTO authors (id, name, bangla_name, role, avatar, bio)
           VALUES ($1, $2, $2, $3, $4, 'GoalBangla Staff')
           ON CONFLICT (id) DO NOTHING`,
          [u.id, u.name, u.role, u.avatar]
        );
      }
    }
  } catch (err: any) {
    console.error('[Migration Error]: Authors seed:', err.message);
  }

  // 5. Seed Competitions if empty
  try {
    const res = await query(`SELECT COUNT(*) FROM competitions`);
    if (parseInt(res.rows[0].count, 10) === 0) {
      console.log('[Migration] Seeding competitions...');
      for (const c of initialCompetitions) {
        await query(
          `INSERT INTO competitions (id, name, bangla_name, slug, country, logo, type, priority, current_season)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO NOTHING`,
          [c.id, c.name, c.banglaName, c.slug, c.country, c.logo, c.type || 'league', 1, '2024-25']
        );
      }
    }
  } catch (err: any) {
    console.error('[Migration Error]: Competitions seed:', err.message);
  }

  // 6. Seed Clubs if empty
  try {
    const res = await query(`SELECT COUNT(*) FROM clubs`);
    if (parseInt(res.rows[0].count, 10) === 0) {
      console.log('[Migration] Seeding clubs...');
      for (const rawCl of initialClubs) {
        const cl: any = rawCl;
        const code = cl.code || cl.shortName || cl.slug.slice(0, 3).toUpperCase();
        await query(
          `INSERT INTO clubs (id, name, bangla_name, short_name, code, slug, logo, stadium, city, founded, competition_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO NOTHING`,
          [
            cl.id, cl.name, cl.banglaName, cl.shortName, code, cl.slug,
            cl.logo, cl.stadium || null, cl.city || null, cl.founded || 1900,
            cl.competitionId || null
          ]
        );
      }
    }
  } catch (err: any) {
    console.error('[Migration Error]: Clubs seed:', err.message);
  }

  // 7. Seed Players if empty
  try {
    const res = await query(`SELECT COUNT(*) FROM players`);
    if (parseInt(res.rows[0].count, 10) === 0) {
      console.log('[Migration] Seeding players...');
      for (const rawP of initialPlayers) {
        const p: any = rawP;
        const avatar = p.photo || p.avatar || 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=400&q=80';
        const shirtNumber = p.number || p.shirtNumber || null;
        await query(
          `INSERT INTO players (id, name, bangla_name, slug, club_id, nationality, position, shirt_number, avatar, market_value, goals, assists)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (id) DO NOTHING`,
          [
            p.id, p.name, p.banglaName, p.slug, p.clubId || null, p.nationality,
            p.position, shirtNumber, avatar, p.marketValue || null,
            p.stats?.goals || 0, p.stats?.assists || 0
          ]
        );
      }
    }
  } catch (err: any) {
    console.error('[Migration Error]: Players seed:', err.message);
  }

  // 8. Seed Categories
  try {
    const categories = [
      { id: 'cat-news', name: 'News', bangla: 'সংবাদ', slug: 'news' },
      { id: 'cat-match', name: 'Match Report', bangla: 'ম্যাচ রিপোর্ট', slug: 'match-report' },
      { id: 'cat-tactics', name: 'Tactical Analysis', bangla: 'কৌশলগত বিশ্লেষণ', slug: 'tactical-analysis' },
      { id: 'cat-transfers', name: 'Transfers', bangla: 'দলবদল', slug: 'transfers' },
      { id: 'cat-bangladesh', name: 'Bangladesh Football', bangla: 'বাংলাদেশ ফুটবল', slug: 'bangladesh-football' },
      { id: 'cat-interview', name: 'Interview', bangla: 'সাক্ষাৎকার', slug: 'interview' },
      { id: 'cat-opinion', name: 'Opinion', bangla: 'মতামত', slug: 'opinion' }
    ];
    for (const c of categories) {
      await query(
        `INSERT INTO categories (id, name, bangla_name, slug)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO NOTHING`,
        [c.id, c.name, c.bangla, c.slug]
      );
    }
  } catch (err: any) {
    console.error('[Migration Error]: Categories seed:', err.message);
  }

  // 9. Seed Articles & Translations if empty
  try {
    const res = await query(`SELECT COUNT(*) FROM articles`);
    if (parseInt(res.rows[0].count, 10) === 0) {
      console.log('[Migration] Seeding initial articles with translations...');
      for (const rawA of initialArticles) {
        const a: any = rawA;
        // Map category
        let categoryId: string | null = 'cat-news';
        const rawCat = (a.category || '').toLowerCase();
        if (rawCat.includes('tact') || rawCat.includes('কৌশল')) categoryId = 'cat-tactics';
        else if (rawCat.includes('trans') || rawCat.includes('দলবদল')) categoryId = 'cat-transfers';
        else if (rawCat.includes('bangla') || rawCat.includes('বাংলাদেশ')) categoryId = 'cat-bangladesh';
        else if (rawCat.includes('match') || rawCat.includes('রিপোর্ট')) categoryId = 'cat-match';
        else if (rawCat.includes('inter') || rawCat.includes('সাক্ষাৎ')) categoryId = 'cat-interview';
        else if (rawCat.includes('opin') || rawCat.includes('মতামত')) categoryId = 'cat-opinion';

        const authorId = a.authorId || a.author?.id || 'auth-1';
        const blocks = a.blocks || a.contentBlocks || [];
        const viewCount = a.viewsCount || a.viewCount || 120;
        const readTime = a.readTimeMinutes ? `${a.readTimeMinutes} মিনিট` : a.readTime || '৪ মিনিট';

        // Insert article
        await query(
          `INSERT INTO articles (
             id, slug, category_id, author_id, featured_image, image_caption, image_credit,
             status, is_breaking, is_featured, is_tactical, view_count, read_time, published_at
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
           ON CONFLICT (id) DO NOTHING`,
          [
            a.id, a.slug, categoryId, authorId,
            a.featuredImage, a.imageCaption || null, a.imageCredit || null,
            a.status || 'published', !!a.isBreaking, !!a.isFeatured, !!a.isTactical,
            viewCount, readTime, a.publishedAt || new Date().toISOString()
          ]
        );

        // Insert Bangla translation (default)
        await query(
          `INSERT INTO article_translations (
             id, article_id, language, title, excerpt, content_blocks, meta_title, meta_description
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (article_id, language) DO NOTHING`,
          [
            `trans-${a.id}-bn`, a.id, 'bn', a.title, a.excerpt,
            JSON.stringify(blocks), a.title, a.excerpt
          ]
        );

        // If translations exist in seed, insert them
        if (a.translations) {
          for (const [lang, tData] of Object.entries(a.translations)) {
            if (tData && (tData as any).title) {
              await query(
                `INSERT INTO article_translations (
                   id, article_id, language, title, excerpt, content_blocks, meta_title, meta_description
                 ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 ON CONFLICT (article_id, language) DO NOTHING`,
                [
                  `trans-${a.id}-${lang}`, a.id, lang, (tData as any).title, (tData as any).excerpt || '',
                  JSON.stringify((tData as any).blocks || (tData as any).contentBlocks || blocks),
                  (tData as any).title, (tData as any).excerpt || ''
                ]
              );
            }
          }
        }
      }
    }
  } catch (err: any) {
    console.error('[Migration Error]: Articles seed:', err.message);
  }

  // 10. Seed Matches if empty
  try {
    const res = await query(`SELECT COUNT(*) FROM matches`);
    if (parseInt(res.rows[0].count, 10) === 0) {
      console.log('[Migration] Seeding matches...');
      for (const rawM of initialMatches) {
        const m: any = rawM;
        await query(
          `INSERT INTO matches (
             id, competition_id, home_club_id, away_club_id, home_score, away_score,
             status, minute, date, stadium, referee, data_source, events, lineups, stats
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
           ON CONFLICT (id) DO NOTHING`,
          [
            m.id, m.competitionId, m.homeClubId, m.awayClubId,
            m.homeScore || 0, m.awayScore || 0, m.status || 'upcoming',
            m.minute || 0, m.date || m.matchDate || new Date().toISOString(),
            m.stadium || m.venue || 'Football Arena', m.referee || 'Referee', 'editorial',
            JSON.stringify(m.events || []), JSON.stringify(m.lineups || { home: [], away: [] }),
            JSON.stringify(m.stats || {})
          ]
        );
      }
    }
  } catch (err: any) {
    console.error('[Migration Error]: Matches seed:', err.message);
  }

  // 11. Seed Standings if empty
  try {
    const res = await query(`SELECT COUNT(*) FROM standings`);
    if (parseInt(res.rows[0].count, 10) === 0) {
      console.log('[Migration] Seeding standings...');
      for (const [compId, rows] of Object.entries(initialStandings)) {
        for (const r of rows) {
          await query(
            `INSERT INTO standings (
               id, competition_id, club_id, position, played, won, drawn, lost,
               goals_for, goals_against, goal_difference, points, form
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
             ON CONFLICT (competition_id, club_id) DO UPDATE SET
               position = $4, played = $5, won = $6, drawn = $7, lost = $8,
               goals_for = $9, goals_against = $10, goal_difference = $11, points = $12, form = $13`,
            [
              `std-${compId}-${r.clubId}`, compId, r.clubId, r.position,
              r.played, r.won, r.drawn, r.lost, r.goalsFor, r.goalsAgainst,
              r.goalDifference, r.points, JSON.stringify(r.form || [])
            ]
          );
        }
      }
    }
  } catch (err: any) {
    console.error('[Migration Error]: Standings seed:', err.message);
  }

  // 12. Seed Transfers if empty
  try {
    const res = await query(`SELECT COUNT(*) FROM transfers`);
    if (parseInt(res.rows[0].count, 10) === 0) {
      console.log('[Migration] Seeding transfers...');
      for (const t of initialTransfers) {
        await query(
          `INSERT INTO transfers (
             id, player_id, from_club_id, to_club_id, fee, fee_amount, currency,
             type, status, source, confidence, transfer_date, last_updated
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           ON CONFLICT (id) DO NOTHING`,
          [
            t.id, t.playerId, t.fromClubId || null, t.toClubId || null,
            t.fee, (t as any).feeAmount || 0, (t as any).currency || 'EUR', (t as any).type || 'permanent',
            t.status || 'rumour', t.source || 'GoalBangla Desk', (t as any).confidence || 75,
            (t as any).date || new Date().toISOString().slice(0, 10), new Date().toISOString()
          ]
        );
      }
    }
  } catch (err: any) {
    console.error('[Migration Error]: Transfers seed:', err.message);
  }

  // 13. Seed Injuries if empty
  try {
    const res = await query(`SELECT COUNT(*) FROM injuries`);
    if (parseInt(res.rows[0].count, 10) === 0) {
      console.log('[Migration] Seeding injuries...');
      for (const rawInj of initialInjuries) {
        const inj: any = rawInj;
        const type = inj.injuryType || inj.type || 'Muscle Strain';
        await query(
          `INSERT INTO injuries (
             id, player_id, club_id, type, description, status, expected_return, source, last_updated
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO NOTHING`,
          [
            inj.id, inj.playerId, inj.clubId || null, type,
            inj.description || inj.notes || '', inj.status || 'out', inj.expectedReturn || 'TBD',
            inj.source || 'Club Medical Staff', new Date().toISOString()
          ]
        );
      }
    }
  } catch (err: any) {
    console.error('[Migration Error]: Injuries seed:', err.message);
  }

  // 14. Seed Breaking News if empty
  try {
    const res = await query(`SELECT COUNT(*) FROM breaking_news`);
    if (parseInt(res.rows[0].count, 10) === 0) {
      console.log('[Migration] Seeding breaking news alerts...');
      for (const rawBn of initialBreakingNews) {
        const bn: any = rawBn;
        await query(
          `INSERT INTO breaking_news (id, headline, bangla_headline, priority, status, category, url, timestamp)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO NOTHING`,
          [
            bn.id, bn.headline, bn.banglaHeadline || bn.headline,
            bn.priority || 'high', bn.status || 'active', bn.category || 'breaking',
            bn.url || null, bn.timestamp || new Date().toISOString()
          ]
        );
      }
    }
  } catch (err: any) {
    console.error('[Migration Error]: Breaking news seed:', err.message);
  }

  // 15. Seed Homepage Config if empty
  try {
    const res = await query(`SELECT COUNT(*) FROM homepage_config`);
    if (parseInt(res.rows[0].count, 10) === 0) {
      console.log('[Migration] Seeding homepage config...');
      for (let i = 0; i < initialHomepageConfig.length; i++) {
        const sec: any = initialHomepageConfig[i];
        await query(
          `INSERT INTO homepage_config (id, section_id, title, bangla_title, enabled, order_index, limit_count, settings)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (section_id) DO NOTHING`,
          [
            `sec-${sec.id}`, sec.id, sec.title, sec.banglaTitle || sec.title,
            sec.enabled ?? true, sec.order ?? i, sec.limit ?? 6, JSON.stringify(sec.settings || {})
          ]
        );
      }
    }
  } catch (err: any) {
    console.error('[Migration Error]: Homepage config seed:', err.message);
  }

  // 16. Seed Media, Galleries, Videos if empty
  try {
    const resMed = await query(`SELECT COUNT(*) FROM media`);
    if (parseInt(resMed.rows[0].count, 10) === 0) {
      for (const rawM of initialMedia) {
        const m: any = rawM;
        await query(
          `INSERT INTO media (id, url, title, caption, alt_text, credit, category)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO NOTHING`,
          [m.id, m.url, m.title, m.caption || null, m.altText || null, m.credit || null, m.category || 'general']
        );
      }
    }

    const resGal = await query(`SELECT COUNT(*) FROM galleries`);
    if (parseInt(resGal.rows[0].count, 10) === 0) {
      for (const g of initialGalleries) {
        await query(
          `INSERT INTO galleries (id, title, bangla_title, slug, cover_image, description)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO NOTHING`,
          [g.id, g.title, g.banglaTitle, g.slug, g.coverImage, g.description || null]
        );
        if (g.images) {
          for (let idx = 0; idx < g.images.length; idx++) {
            const img = g.images[idx];
            await query(
              `INSERT INTO gallery_items (id, gallery_id, image_url, caption, credit, sort_order)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [`gi-${g.id}-${idx}`, g.id, img.url, img.caption || null, img.credit || null, idx]
            );
          }
        }
      }
    }

    const resVid = await query(`SELECT COUNT(*) FROM videos`);
    if (parseInt(resVid.rows[0].count, 10) === 0) {
      for (const rawV of initialVideos) {
        const v: any = rawV;
        const url = v.videoUrl || v.url;
        await query(
          `INSERT INTO videos (id, title, bangla_title, url, video_type, thumbnail, duration, category)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO NOTHING`,
          [v.id, v.title, v.banglaTitle, url, v.source || 'youtube', v.thumbnail, v.durationSeconds ? `${Math.floor(v.durationSeconds / 60)}:${(v.durationSeconds % 60).toString().padStart(2, '0')}` : '03:45', v.category || 'highlights']
        );
      }
    }
  } catch (err: any) {
    console.error('[Migration Error]: Media seed:', err.message);
  }

  console.log('[Migration] All PostgreSQL tables, schemas and seed data ready.');
}
