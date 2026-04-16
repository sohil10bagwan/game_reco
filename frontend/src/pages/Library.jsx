import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import GameCard from '../components/Gamecard.jsx';
import { useCollection } from '../context/CollectionContext.jsx';

const Library = () => {
  const {
    bookmarks,
    favorites,
    bookmarkCount,
    favoriteCount,
    loading,
    error,
  } = useCollection();
  const [activeTab, setActiveTab] = useState('bookmarks');

  const activeItems = useMemo(
    () => (activeTab === 'bookmarks' ? bookmarks : favorites),
    [activeTab, bookmarks, favorites]
  );

  const tabMeta = {
    bookmarks: {
      title: 'Your bookmarks',
      description: 'Games you saved to revisit later.',
      emptyTitle: 'No bookmarked games yet',
      emptyDescription:
        'Browse the library and bookmark games you want to come back to.',
    },
    favorites: {
      title: 'Your favorites',
      description: 'Games you marked as personal favorites.',
      emptyTitle: 'No favorite games yet',
      emptyDescription:
        'Mark games as favorites to build your personal shortlist.',
    },
  };

  const currentTab = tabMeta[activeTab];

  return (
    <div className="page-shell">
      <div className="page-container space-y-8">
        <section className="section-card p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <span className="eyebrow">My library</span>
              <h1 className="page-subtitle mt-4">Bookmarks and favorites</h1>
              <p className="mt-4 max-w-[42rem] text-sm leading-7 text-slate-400 sm:text-base">
                Keep track of games you want to revisit and the titles you like
                the most. Your saved lists are synced to your signed-in account.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <MetricCard label="Bookmarks" value={bookmarkCount} />
              <MetricCard label="Favorites" value={favoriteCount} />
            </div>
          </div>
        </section>

        <section className="section-card p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-['Space_Grotesk'] text-2xl font-semibold text-white">
                Saved collections
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Switch between bookmarks and favorites any time.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <TabButton
                active={activeTab === 'bookmarks'}
                onClick={() => setActiveTab('bookmarks')}
              >
                Bookmarks ({bookmarkCount})
              </TabButton>
              <TabButton
                active={activeTab === 'favorites'}
                onClick={() => setActiveTab('favorites')}
              >
                Favorites ({favoriteCount})
              </TabButton>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div>
            <h2 className="font-['Space_Grotesk'] text-2xl font-semibold text-white">
              {currentTab.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {currentTab.description}
            </p>
          </div>

          {loading ? (
            <div className="section-card p-6 sm:p-8">
              <h3 className="page-subtitle">Loading your library</h3>
              <p className="mt-4 max-w-[36rem] text-sm leading-7 text-slate-400 sm:text-base">
                Fetching bookmarks and favorites from your account.
              </p>
            </div>
          ) : error ? (
            <div className="section-card p-6 sm:p-8">
              <h3 className="page-subtitle">Library unavailable</h3>
              <p className="mt-4 max-w-[36rem] text-sm leading-7 text-slate-400 sm:text-base">
                {error}
              </p>
            </div>
          ) : activeItems.length === 0 ? (
            <div className="section-card p-6 sm:p-8">
              <h3 className="page-subtitle">{currentTab.emptyTitle}</h3>
              <p className="mt-4 max-w-[36rem] text-sm leading-7 text-slate-400 sm:text-base">
                {currentTab.emptyDescription}
              </p>
              <Link to="/games" className="btn-solid mt-6 inline-flex no-underline">
                Browse games
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {activeItems.map((game) => (
                <GameCard key={`${activeTab}-${game._id || game.id}`} game={game} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value }) => (
  <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-4">
    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
      {label}
    </div>
    <div className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-white">
      {value}
    </div>
  </div>
);

const TabButton = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
      active
        ? 'border-cyan-400/30 bg-cyan-400/10 text-white'
        : 'border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/20 hover:text-white'
    }`}
  >
    {children}
  </button>
);

export default Library;
