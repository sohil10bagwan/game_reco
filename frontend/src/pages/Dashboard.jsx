import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import GameCard from '../components/Gamecard.jsx';
import GameSlider from '../components/Gameslider.jsx';
import { useAuth } from '../context/Authcontext.jsx';
import { useDebounce } from '../hooks/useDebounce.js';
import { gamesAPI } from '../services/api.js';

const GENRES = [
  'All',
  'Action',
  'RPG',
  'Strategy',
  'Sports',
  'Simulation',
  'Horror',
  'Adventure',
  'FPS',
  'Puzzle',
  'Racing',
  'Fighting',
  'MMO',
  'Indie',
];

const PLATFORMS = ['All', 'PC', 'PlayStation', 'Xbox', 'Nintendo', 'Mobile'];

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All');
  const [platform, setPlatform] = useState('All');

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      setError('');

      try {
        const params = {};

        if (debouncedSearch) params.search = debouncedSearch;
        if (genre !== 'All') params.genre = genre;
        if (platform !== 'All') params.platform = platform;

        const response = await gamesAPI.getAll(params);
        const data = response.data;
        const list =
          data?.data?.games ??
          data?.data ??
          data?.games ??
          (Array.isArray(data) ? data : []);
        setGames(list);
      } catch (fetchError) {
        const message =
          fetchError.response?.data?.message ||
          fetchError.message ||
          'Failed to load games.';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [debouncedSearch, genre, platform]);

  const resetFilters = () => {
    setSearch('');
    setGenre('All');
    setPlatform('All');
  };

  return (
    <div className="page-shell">
      <div className="page-container space-y-8">
        <GameSlider mode="compact" />

        <section className="section-card p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <span className="eyebrow">Dashboard</span>
              <h1 className="page-subtitle mt-4">
                Welcome back, {user?.name || 'player'}
              </h1>
              <p className="mt-4 max-w-[42rem] text-sm leading-7 text-slate-400 sm:text-base">
                Search the library, refine results by genre or platform, and
                jump straight into detailed game pages from one place.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Visible results
                </div>
                <div className="mt-1 font-['Space_Grotesk'] text-2xl font-semibold text-white">
                  {loading ? '--' : games.length}
                </div>
              </div>

              {isAdmin && (
                <Link to="/adminpanel" className="btn-ghost no-underline">
                  Open admin panel
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className="section-card p-5 sm:p-6">
          <div className="grid gap-5 xl:grid-cols-[minmax(320px,1fr)_minmax(0,1.2fr)_minmax(0,1.2fr)]">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-200">
                Search games
              </span>
              <input
                type="text"
                placeholder="Search by title"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="field-control"
              />
            </label>

            <div>
              <span className="mb-2 block text-sm font-semibold text-slate-200">
                Genre
              </span>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((item) => (
                  <FilterChip
                    key={item}
                    active={genre === item}
                    onClick={() => setGenre(item)}
                  >
                    {item}
                  </FilterChip>
                ))}
              </div>
            </div>

            <div>
              <span className="mb-2 block text-sm font-semibold text-slate-200">
                Platform
              </span>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((item) => (
                  <FilterChip
                    key={item}
                    active={platform === item}
                    onClick={() => setPlatform(item)}
                  >
                    {item}
                  </FilterChip>
                ))}
              </div>
            </div>
          </div>

          {(search || genre !== 'All' || platform !== 'All') && (
            <div className="mt-5 flex flex-wrap gap-2">
              {search && (
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-cyan-100">
                  Search: {search}
                </span>
              )}
              {genre !== 'All' && (
                <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-violet-100">
                  Genre: {genre}
                </span>
              )}
              {platform !== 'All' && (
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-100">
                  Platform: {platform}
                </span>
              )}
              <button type="button" onClick={resetFilters} className="btn-ghost">
                Reset filters
              </button>
            </div>
          )}
        </section>

        {loading ? (
          <div className="section-card flex min-h-[18rem] items-center justify-center p-8 text-center">
            <div className="space-y-3">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-cyan-300" />
              <p className="text-sm leading-6 text-slate-400 sm:text-base">
                Loading your library view.
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="section-card border-rose-400/25 bg-rose-400/10 p-6 text-rose-100">
            <h2 className="font-['Space_Grotesk'] text-2xl font-semibold text-white">
              Unable to load games
            </h2>
            <p className="mt-3 max-w-[36rem] text-sm leading-7 text-rose-100/90 sm:text-base">
              {error}
            </p>
          </div>
        ) : games.length === 0 ? (
          <div className="section-card p-6 sm:p-8">
            <h2 className="page-subtitle">No games matched your filters</h2>
            <p className="mt-4 max-w-[36rem] text-sm leading-7 text-slate-400 sm:text-base">
              Try broadening the search, switching the active genre, or opening
              the full browse page for a wider scan.
            </p>
            <button type="button" onClick={resetFilters} className="btn-solid mt-6">
              Reset filters
            </button>
          </div>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {games.map((game) => (
              <GameCard key={game._id} game={game} />
            ))}
          </section>
        )}
      </div>
    </div>
  );
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

export default Dashboard;
