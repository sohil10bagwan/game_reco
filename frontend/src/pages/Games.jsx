import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import GameCard from '../components/Gamecard.jsx';
import GameSlider from '../components/Gameslider.jsx';
import { gamesAPI } from '../services/api.js';

const GENRES = [
  'Action',
  'Adventure',
  'RPG',
  'Strategy',
  'Simulation',
  'Sports',
  'Puzzle',
  'Shooter',
  'Racing',
];

const ALPHABET_FILTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const CATEGORIES = [
  {
    key: 'recommended',
    label: 'Recommended picks',
    filter: (games) => games.filter((game) => Number(game.rating) >= 8).slice(0, 8),
  },
  {
    key: 'trending',
    label: 'Trending games',
    filter: (games) =>
      [...games].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 8),
  },
  {
    key: 'topRated',
    label: 'Top rated',
    filter: (games) =>
      [...games].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 8),
  },
  {
    key: 'recentlyAdded',
    label: 'Recently added',
    filter: (games) =>
      [...games]
        .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
        .slice(0, 8),
  },
  {
    key: 'popular',
    label: 'Popular games',
    filter: (games) => games.slice(0, 8),
  },
];

const PREVIEW_COUNT = 4;

const getTitleInitial = (title = '') => title.trim().charAt(0).toUpperCase();

const matchesAlphabetFilter = (title, alphabet) => {
  if (!alphabet) {
    return true;
  }

  const initial = getTitleInitial(title);

  if (!initial) {
    return false;
  }

  if (alphabet === '#') {
    return !/[A-Z]/.test(initial);
  }

  return initial === alphabet;
};

const FilterChip = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
      active
        ? 'border-cyan-400/30 bg-cyan-400/10 text-white'
        : 'border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/20 hover:text-white'
    }`}
  >
    {children}
  </button>
);

const CategorySection = ({ label, games, categoryKey, onViewAll }) => {
  if (!games.length) {
    return null;
  }

  const isPreview = Boolean(onViewAll);
  const visibleGames = isPreview ? games.slice(0, PREVIEW_COUNT) : games;

  return (
    <section className="space-y-5 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-['Space_Grotesk'] text-2xl font-semibold text-white">
            {label}
          </h2>
          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-cyan-100">
            {games.length}
          </span>
        </div>

        {isPreview && (
          <button
            type="button"
            onClick={() => onViewAll(categoryKey)}
            className="btn-ghost self-start sm:self-auto"
          >
            View all
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {visibleGames.map((game) => (
          <GameCard key={game._id} game={game} />
        ))}
      </div>
    </section>
  );
};

const Games = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(
    () => sessionStorage.getItem('games_search') || ''
  );
  const [genre, setGenre] = useState(
    () => sessionStorage.getItem('games_genre') || ''
  );
  const [alphabet, setAlphabet] = useState(
    () => sessionStorage.getItem('games_alphabet') || ''
  );
  const [alphabetMenuOpen, setAlphabetMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);

      try {
        const response = await gamesAPI.getAll();
        const data = response.data;
        const list =
          data?.data?.games ??
          data?.data ??
          data?.games ??
          (Array.isArray(data) ? data : []);
        setGames(list);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load games.');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const filtered = useMemo(
    () =>
      games.filter((game) => {
        const rawTitle = game.title || '';
        const title = rawTitle.toLowerCase();
        const matchesSearch = title.includes(search.toLowerCase());
        const matchesGenre = genre
          ? Array.isArray(game.genre)
            ? game.genre.includes(genre)
            : game.genre === genre
          : true;
        const matchesAlphabet = matchesAlphabetFilter(rawTitle, alphabet);

        return matchesSearch && matchesGenre && matchesAlphabet;
      }),
    [alphabet, games, search, genre]
  );

  const categorized = useMemo(
    () => CATEGORIES.map((category) => ({ ...category, games: category.filter(filtered) })),
    [filtered]
  );

  const hasSearch = search.trim() !== '';
  const hasGenreFilter = genre !== '';
  const hasAlphabetFilter = alphabet !== '';
  const isFiltering = hasSearch || hasGenreFilter || hasAlphabetFilter;
  const selectedCategory = categorized.find(
    (category) => category.key === activeCategory
  );

  const clearSearch = () => {
    setSearch('');
    sessionStorage.removeItem('games_search');
  };

  const setGenreFilter = (value) => {
    setGenre(value);

    if (value) {
      sessionStorage.setItem('games_genre', value);
    } else {
      sessionStorage.removeItem('games_genre');
    }
  };

  const setAlphabetFilter = (value) => {
    setAlphabet(value);

    if (value) {
      sessionStorage.setItem('games_alphabet', value);
    } else {
      sessionStorage.removeItem('games_alphabet');
    }
  };

  const handleAlphabetSelect = (value) => {
    setAlphabetFilter(value);
    setAlphabetMenuOpen(false);
  };

  const handleSearchChange = (value) => {
    setSearch(value);

    if (value) {
      sessionStorage.setItem('games_search', value);
    } else {
      sessionStorage.removeItem('games_search');
    }
  };

  const resetFilters = () => {
    clearSearch();
    setGenreFilter('');
    setAlphabetFilter('');
    setAlphabetMenuOpen(false);
    setActiveCategory('all');
  };

  return (
    <div className="page-shell">
      <div className="page-container page-container--wide space-y-8">
        <GameSlider mode="compact" />

        <section className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="section-card h-fit overflow-hidden lg:sticky lg:top-24">
            <div className="max-h-[calc(100vh-2rem)] space-y-6 overflow-y-auto overscroll-contain p-5 pr-2 [scrollbar-gutter:stable] sm:max-h-[calc(100vh-2rem)] sm:p-6 sm:pr-3 lg:max-h-[calc(100vh-6rem)]">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">
                  Browse center
                </div>
                <h1 className="mt-3 font-['Space_Grotesk'] text-3xl font-semibold text-white">
                  Game library
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {loading
                    ? 'Loading catalog...'
                    : `${games.length} games currently available.`}
                </p>

                <button
                  type="button"
                  onClick={() => setActiveCategory('allGames')}
                  className={`mt-5 w-full ${
                    activeCategory === 'allGames' ? 'btn-ghost' : 'btn-solid'
                  }`}
                >
                  {activeCategory === 'allGames' ? 'Browsing all games' : 'Browse all games'}
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm font-semibold text-slate-200">
                    Browse by alphabet
                  </label>
                  {alphabet && (
                    <button
                      type="button"
                      onClick={() => handleAlphabetSelect('')}
                      className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400 transition hover:text-white"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setAlphabetMenuOpen((current) => !current)}
                  aria-expanded={alphabetMenuOpen}
                  className="flex w-full items-center justify-between rounded-[1.15rem] border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:border-cyan-400/20 hover:text-white"
                >
                  <span className="text-sm font-semibold text-slate-200">
                    {alphabet
                      ? `Titles starting with ${alphabet === '#' ? '0-9 / symbol' : alphabet}`
                      : 'Choose a letter'}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                    {alphabetMenuOpen ? 'Hide' : 'Show'}
                  </span>
                </button>

                {alphabetMenuOpen && (
                  <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-3">
                    <div className="grid gap-2">
                      <button
                        type="button"
                        onClick={() => handleAlphabetSelect('')}
                        className={`rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                          alphabet === ''
                            ? 'border-cyan-400/30 bg-cyan-400/10 text-white'
                            : 'border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/20 hover:text-white'
                        }`}
                      >
                        All titles
                      </button>

                      <div className="grid grid-cols-7 gap-2">
                        {ALPHABET_FILTERS.map((letter) => (
                          <button
                            key={letter}
                            type="button"
                            onClick={() => handleAlphabetSelect(letter)}
                            className={`rounded-2xl border px-0 py-2 text-center text-sm font-semibold transition ${
                              alphabet === letter
                                ? 'border-cyan-400/30 bg-cyan-400/10 text-white'
                                : 'border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/20 hover:text-white'
                            }`}
                          >
                            {letter}
                          </button>
                        ))}

                        <button
                          type="button"
                          onClick={() => handleAlphabetSelect('#')}
                          className={`rounded-2xl border px-0 py-2 text-center text-sm font-semibold transition ${
                            alphabet === '#'
                              ? 'border-cyan-400/30 bg-cyan-400/10 text-white'
                              : 'border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/20 hover:text-white'
                          }`}
                        >
                          #
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-200">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => handleSearchChange(event.target.value)}
                    placeholder="Search by title"
                    className="field-control pr-12"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-slate-300 transition hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm font-semibold text-slate-200">
                    Genres
                  </label>
                  {genre && (
                    <button
                      type="button"
                      onClick={() => setGenreFilter('')}
                      className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400 transition hover:text-white"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    active={genre === ''}
                    onClick={() => setGenreFilter('')}
                  >
                    All genres
                  </FilterChip>
                  {GENRES.map((item) => (
                    <FilterChip
                      key={item}
                      active={genre === item}
                      onClick={() => setGenreFilter(genre === item ? '' : item)}
                    >
                      {item}
                    </FilterChip>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm font-semibold text-slate-200">
                    Categories
                  </label>
                  {activeCategory !== 'all' && (
                    <button
                      type="button"
                      onClick={() => setActiveCategory('all')}
                      className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400 transition hover:text-white"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="grid gap-2">
                  <FilterChip
                    active={activeCategory === 'all'}
                    onClick={() => setActiveCategory('all')}
                  >
                    All categories
                  </FilterChip>
                  <FilterChip
                    active={activeCategory === 'allGames'}
                    onClick={() => setActiveCategory('allGames')}
                  >
                    Entire catalog
                  </FilterChip>
                  {CATEGORIES.map((category) => (
                    <FilterChip
                      key={category.key}
                      active={activeCategory === category.key}
                      onClick={() => setActiveCategory(category.key)}
                    >
                      {category.label}
                    </FilterChip>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Active view
                </div>
                <div className="mt-2 text-sm leading-6 text-slate-300">
                  {isFiltering && activeCategory !== 'all'
                    ? 'Your selected category stays active while search, genre, and alphabet filters refine the list.'
                    : isFiltering
                      ? 'Search and alphabet filters update instantly as you narrow the catalog.'
                      : activeCategory !== 'all'
                        ? 'Category filters focus the browse view without changing the rest of the catalog.'
                        : 'Browse featured categories or jump directly into the full catalog.'}
                </div>
              </div>
            </div>
          </aside>

          <main className="min-w-0 space-y-6">
            <div className="section-card p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <span className="eyebrow">Catalog browser</span>
                  <h2 className="page-subtitle mt-4">
                    Browse by title, genre, or category
                  </h2>
                  <p className="mt-3 max-w-[42rem] text-sm leading-7 text-slate-400 sm:text-base">
                    Use filters to narrow the library quickly, then open any
                    title for full requirements, screenshots, and platform info.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  {(search || genre || alphabet) && (
                    <button type="button" onClick={resetFilters} className="btn-ghost">
                      Reset filters
                    </button>
                  )}
                </div>
              </div>

              {(search || genre || alphabet) && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {search && (
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-cyan-100">
                      Search: {search}
                    </span>
                  )}
                  {genre && (
                    <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-violet-100">
                      Genre: {genre}
                    </span>
                  )}
                  {alphabet && (
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-100">
                      Alphabet: {alphabet === '#' ? '0-9 / symbol' : alphabet}
                    </span>
                  )}
                </div>
              )}
            </div>

            {loading ? (
              <div className="section-card flex min-h-[18rem] items-center justify-center p-8 text-center">
                <div className="space-y-3">
                  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-cyan-300" />
                  <p className="text-sm leading-6 text-slate-400 sm:text-base">
                    Loading the game catalog.
                  </p>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="section-card p-6 sm:p-8">
                <h2 className="page-subtitle">No games matched your filters</h2>
                <p className="mt-4 max-w-[36rem] text-sm leading-7 text-slate-400 sm:text-base">
                  Try clearing the search term, changing the alphabet, switching
                  genres, or jumping back to the curated categories for a broader scan.
                </p>
                <button type="button" onClick={resetFilters} className="btn-solid mt-6">
                  Reset browse filters
                </button>
              </div>
            ) : activeCategory === 'all' ? (
              isFiltering ? (
                <CategorySection
                  label={`Search results${search ? ` for "${search}"` : ''}${genre ? ` in ${genre}` : ''}${
                    alphabet
                      ? ` ${search || genre ? 'starting with' : 'for titles starting with'} ${
                          alphabet === '#' ? 'a number or symbol' : alphabet
                        }`
                      : ''
                  }`}
                  games={filtered}
                />
              ) : (
                <div className="space-y-8">
                  {categorized.map((category) => (
                    <CategorySection
                      key={category.key}
                      label={category.label}
                      games={category.games}
                      categoryKey={category.key}
                      onViewAll={setActiveCategory}
                    />
                  ))}
                </div>
              )
            ) : activeCategory === 'allGames' ? (
              <CategorySection
                label={isFiltering ? 'Filtered catalog' : 'Entire catalog'}
                games={filtered}
              />
            ) : selectedCategory?.games.length ? (
              <CategorySection
                label={selectedCategory.label}
                games={selectedCategory.games}
              />
            ) : (
              <div className="section-card p-6 sm:p-8">
                <h2 className="page-subtitle">No games matched this category</h2>
                <p className="mt-4 max-w-[36rem] text-sm leading-7 text-slate-400 sm:text-base">
                  Try another category, clear the active genre or alphabet
                  filter, or reset the search term to widen the current results.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className="btn-solid mt-6"
                >
                  Show all categories
                </button>
              </div>
            )}
          </main>
        </section>
      </div>
    </div>
  );
};

export default Games;
