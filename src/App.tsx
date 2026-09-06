import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { LiveScoreStrip } from './components/common/LiveScoreStrip';
import { SearchModal } from './components/search/SearchModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Home Widgets
import { HeroSection } from './components/home/HeroSection';
import { TransferRadarWidget } from './components/home/TransferRadarWidget';
import { LeagueSpotlight } from './components/home/LeagueSpotlight';
import { TacticalFeaturesSection } from './components/home/TacticalFeaturesSection';
import { GalleryWidget } from './components/home/GalleryWidget';
import { VideoWidget } from './components/home/VideoWidget';
import { NewsletterSection } from './components/home/NewsletterSection';

// Page Views
import { ArticleDetailPage } from './components/articles/ArticleDetailPage';
import { MatchCentre } from './components/matches/MatchCentre';
import { LiveMatchesPage } from './components/matches/LiveMatchesPage';
import { TransfersPage } from './components/transfers/TransfersPage';
import { StandingsPage } from './components/standings/StandingsPage';
import { TacticsPage } from './components/tactics/TacticsPage';
import { BangladeshFootballPage } from './components/bangladesh/BangladeshFootballPage';
import { ClubProfilePage } from './components/entities/ClubProfilePage';
import { PlayerProfilePage } from './components/entities/PlayerProfilePage';
import { MediaHubPage } from './components/media/MediaHubPage';
import { InjuriesPage } from './components/injuries/InjuriesPage';
import { ArchivePage } from './components/archive/ArchivePage';
import { AdminDashboard } from './components/admin/AdminDashboard';

type ViewMode = 
  | 'home'
  | 'article'
  | 'match'
  | 'live-matches'
  | 'transfers'
  | 'standings'
  | 'tactics'
  | 'bangladesh'
  | 'club'
  | 'player'
  | 'media'
  | 'injuries'
  | 'archive'
  | 'admin';

const MainAppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [viewParam, setViewParam] = useState<string | undefined>(undefined);
  const [historyStack, setHistoryStack] = useState<Array<{ view: ViewMode; param?: string }>>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navigateTo = (view: string, param?: string) => {
    let targetView = view;
    let targetParam = param;

    if (view === 'live') targetView = 'live-matches';
    else if (view === 'bangladesh-football') targetView = 'bangladesh';
    else if (view === 'competition') {
      targetView = 'standings';
      targetParam = param;
    } else if (view === 'galleries' || view === 'videos') {
      targetView = 'media';
    }

    setHistoryStack(prev => [...prev, { view: currentView, param: viewParam }]);
    setCurrentView(targetView as ViewMode);
    setViewParam(targetParam);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateBack = () => {
    if (historyStack.length > 0) {
      const prev = historyStack[historyStack.length - 1];
      setHistoryStack(h => h.slice(0, -1));
      setCurrentView(prev.view);
      setViewParam(prev.param);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentView('home');
      setViewParam(undefined);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* Global Navigation Header */}
      <Header
        currentView={currentView}
        activeNav={currentView}
        onNavigate={navigateTo}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Global Ticker & Live Score Strip (visible on all pages) */}
      <LiveScoreStrip
        onSelectMatch={(mId) => navigateTo('match', mId)}
        onViewAllMatches={() => navigateTo('live-matches')}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        
        {/* VIEW: HOME */}
        {currentView === 'home' && (
          <div className="space-y-12">
            <HeroSection
              onSelectArticle={(slug) => navigateTo('article', slug)}
              onSelectMatch={(mId) => navigateTo('match', mId)}
              onNavigate={navigateTo}
            />

            <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-12">
              <TransferRadarWidget
                onNavigate={navigateTo}
              />

              <LeagueSpotlight
                onSelectArticle={(slug) => navigateTo('article', slug)}
                onNavigate={navigateTo}
              />

              <TacticalFeaturesSection
                onSelectArticle={(slug) => navigateTo('article', slug)}
                onNavigate={navigateTo}
              />

              <GalleryWidget
                onNavigate={navigateTo}
              />

              <VideoWidget
                onSelectVideo={() => navigateTo('media')}
              />

              <NewsletterSection />
            </div>
          </div>
        )}

        {/* VIEW: ARTICLE DETAIL */}
        {currentView === 'article' && viewParam && (
          <ArticleDetailPage
            slug={viewParam}
            onNavigate={navigateTo}
            onBack={navigateBack}
          />
        )}

        {/* VIEW: MATCH CENTRE */}
        {currentView === 'match' && viewParam && (
          <MatchCentre
            matchId={viewParam}
            onNavigate={navigateTo}
            onBack={navigateBack}
          />
        )}

        {/* VIEW: LIVE MATCHES & SCHEDULE */}
        {currentView === 'live-matches' && (
          <LiveMatchesPage
            onSelectMatch={(mId) => navigateTo('match', mId)}
            onSelectClub={(clubSlug) => navigateTo('club', clubSlug)}
          />
        )}

        {/* VIEW: TRANSFERS RADAR */}
        {currentView === 'transfers' && (
          <TransfersPage
            onNavigate={navigateTo}
          />
        )}

        {/* VIEW: STANDINGS & LEAGUE TABLES */}
        {currentView === 'standings' && (
          <StandingsPage
            onNavigate={navigateTo}
            defaultCompId={viewParam}
          />
        )}

        {/* VIEW: TACTICAL ANALYSIS */}
        {currentView === 'tactics' && (
          <TacticsPage
            onSelectArticle={(slug) => navigateTo('article', slug)}
          />
        )}

        {/* VIEW: BANGLADESH FOOTBALL HUB */}
        {currentView === 'bangladesh' && (
          <BangladeshFootballPage
            onSelectArticle={(slug) => navigateTo('article', slug)}
            onSelectMatch={(mId) => navigateTo('match', mId)}
            onNavigate={navigateTo}
          />
        )}

        {/* VIEW: CLUB PROFILE */}
        {currentView === 'club' && viewParam && (
          <ClubProfilePage
            slug={viewParam}
            onNavigate={navigateTo}
            onBack={navigateBack}
          />
        )}

        {/* VIEW: PLAYER PROFILE */}
        {currentView === 'player' && viewParam && (
          <PlayerProfilePage
            slug={viewParam}
            onNavigate={navigateTo}
            onBack={navigateBack}
          />
        )}

        {/* VIEW: MEDIA HUB (Galleries & Videos) */}
        {currentView === 'media' && (
          <MediaHubPage />
        )}

        {/* VIEW: INJURIES & SUSPENSIONS */}
        {currentView === 'injuries' && (
          <InjuriesPage />
        )}

        {/* VIEW: ARCHIVE & TAGS */}
        {currentView === 'archive' && (
          <ArchivePage
            onSelectArticle={(slug) => navigateTo('article', slug)}
          />
        )}

        {/* VIEW: ADMIN / CMS NEWSROOM */}
        {currentView === 'admin' && (
          <AdminDashboard
            onNavigate={navigateTo}
            defaultSection={viewParam}
          />
        )}

      </main>

      {/* Global Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={navigateTo}
      />

    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <MainAppContent />
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
