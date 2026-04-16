import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/Authcontext.jsx';
import { useCollection } from '../context/CollectionContext.jsx';

const GENRE_COLORS = {
  Action: '#f97316',
  Adventure: '#38bdf8',
  RPG: '#8b5cf6',
  Strategy: '#22c55e',
  Sports: '#eab308',
  Simulation: '#06b6d4',
  Horror: '#fb7185',
  FPS: '#ef4444',
  Puzzle: '#a855f7',
  Racing: '#14b8a6',
  Fighting: '#f43f5e',
  MMO: '#3b82f6',
  Indie: '#ec4899',
  Shooter: '#ef4444',
};

const toArray = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return value ? [value] : [];
};

const formatSpecValue = (value, unit) => {
  if (value === undefined || value === null || value === '') {
    return '--';
  }

  return `${value}${unit}`;
};

const normalizeRating = (rating) => {
  const parsed = Number(rating);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed <= 1 ? (parsed * 10).toFixed(1) : parsed.toFixed(1);
};

const getPerformanceTier = (matchScore) => {
  if (matchScore >= 90) return { label: 'Ultra ready', color: '#8b5cf6' };
  if (matchScore >= 75) return { label: 'High settings', color: '#3b82f6' };
  if (matchScore >= 50) return { label: 'Balanced play', color: '#22c55e' };
  if (matchScore >= 30) return { label: 'Low settings', color: '#eab308' };
  return { label: 'Bare minimum', color: '#f97316' };
};

const GameCard = ({ game, matchScore, showMatch = false, showSpecs = false, fromCache = false }) => {
  const [imgError, setImgError] = useState(false);
  const { isAuthenticated } = useAuth();
  const {
    isBookmarked,
    isFavorited,
    isBookmarkPending,
    isFavoritePending,
    toggleBookmark,
    toggleFavorite,
  } = useCollection();

  const genres = toArray(game?.genre);
  const platforms = toArray(game?.platform);
  const primaryGenre = genres[0] || 'Featured';
  const genreColor = GENRE_COLORS[primaryGenre] || '#22d3ee';
  const gameId = game?._id || game?.id;
  const imageUrl =
    game?.image || game?.imageUrl || game?.coverImage || game?.thumbnail || '';
  const showImage = Boolean(imageUrl) && !imgError;
  const normalizedRating = normalizeRating(game?.rating);
  const performanceTier =
    matchScore !== undefined ? getPerformanceTier(matchScore) : null;
  const isSavedBookmark = gameId ? isBookmarked(gameId) : false;
  const isSavedFavorite = gameId ? isFavorited(gameId) : false;
  const bookmarkPending = gameId ? isBookmarkPending(gameId) : false;
  const favoritePending = gameId ? isFavoritePending(gameId) : false;
  const gameTitle = game?.title || 'Untitled game';

  const specItems = useMemo(() => {
    const requirements = game?.requirements ?? {};

    return [
      {
        label: 'RAM',
        value: formatSpecValue(requirements.minRam ?? game?.minRam, ' GB'),
      },
      {
        label: 'CPU',
        value: formatSpecValue(requirements.minCpu ?? game?.minCpu, ' GHz'),
      },
      {
        label: 'GPU',
        value: formatSpecValue(requirements.minGpu ?? game?.minGpu, ' GB'),
      },
      {
        label: 'Storage',
        value: formatSpecValue(requirements.storage ?? game?.storage, ' GB'),
      },
    ];
  }, [game]);

  const cardDescription =
    game?.description ||
    'Open the game profile to see hardware requirements, platforms, and screenshots.';

  const detailUrl = gameId ? `/games/getGame/${gameId}` : '#';

  const handleToggleBookmark = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!gameId || !isAuthenticated) {
      toast.error('Sign in to save bookmarks.');
      return;
    }

    if (bookmarkPending) {
      return;
    }

    try {
      const nextState = await toggleBookmark(game);
      toast.success(nextState ? 'Added to bookmarks.' : 'Removed from bookmarks.');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to update bookmarks.'
      );
    }
  };

  const handleToggleFavorite = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!gameId || !isAuthenticated) {
      toast.error('Sign in to save favorites.');
      return;
    }

    if (favoritePending) {
      return;
    }

    try {
      const nextState = await toggleFavorite(game);
      toast.success(nextState ? 'Added to favorites.' : 'Removed from favorites.');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to update favorites.'
      );
    }
  };

  return (
    <Link
      to={detailUrl}
      className={`group block h-full no-underline ${
        gameId ? '' : 'pointer-events-none opacity-60'
      }`}
      onClick={(event) => {
        if (!gameId) {
          event.preventDefault();
        }
      }}
    >
      <article className="section-card flex h-full flex-col overflow-hidden border-white/10 transition duration-300 group-hover:-translate-y-1 group-hover:border-cyan-400/25 group-hover:shadow-[0_28px_60px_rgba(2,8,23,0.42)]">
        <div
          className="relative aspect-[16/10] overflow-hidden"
          style={{
            background: showImage
              ? undefined
              : `linear-gradient(135deg, ${genreColor}44 0%, rgba(8,13,28,0.96) 100%)`,
          }}
        >
          {showImage ? (
            <img
              src={imageUrl}
              alt={game?.title || 'Game artwork'}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_55%)]">
              <div className="rounded-full border border-white/10 bg-white/5 px-5 py-2 font-['Space_Grotesk'] text-sm font-semibold tracking-[0.28em] text-white/80">
                GAME
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/20 to-transparent" />

          <div className="absolute left-4 top-4 flex max-w-[70%] flex-wrap gap-2">
            {genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.08em]"
                style={{
                  background: `${GENRE_COLORS[genre] || genreColor}22`,
                  borderColor: `${GENRE_COLORS[genre] || genreColor}55`,
                  color: GENRE_COLORS[genre] || genreColor,
                }}
              >
                {genre}
              </span>
            ))}
          </div>

          <div className="absolute right-4 top-4 flex flex-col items-end gap-2">
            {showMatch && matchScore !== undefined && (
              <div className="rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-emerald-950/30">
                {matchScore}% match
              </div>
            )}

            {performanceTier && (
              <div
                className="rounded-full px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-white"
                style={{ background: performanceTier.color }}
              >
                {performanceTier.label}
              </div>
            )}

            {fromCache && (
              <div className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-cyan-200">
                Cached result
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <h3
                className="text-clamp-2 min-w-0 flex-1 font-['Space_Grotesk'] text-lg font-semibold leading-tight text-white sm:text-xl"
                title={gameTitle}
              >
                {gameTitle}
              </h3>

              {normalizedRating && (
                <span className="shrink-0 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-xs font-semibold text-amber-200">
                  {normalizedRating}/10
                </span>
              )}
            </div>

            <p className="text-clamp-2 text-sm leading-6 text-slate-400">
              {cardDescription}
            </p>
          </div>

          {(showSpecs || specItems.some((item) => item.value !== '--')) && (
            <div className="grid grid-cols-2 gap-2">
              {specItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/8 bg-black/20 px-3 py-2.5"
                >
                  <div className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    {item.label}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-white">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-auto space-y-3">
            <div className="flex min-h-[3.75rem] flex-wrap content-start items-start gap-2 pt-1">
              {platforms.length > 0 ? (
                platforms.map((platform) => (
                  <span
                    key={platform}
                    className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[0.72rem] font-medium text-slate-200"
                  >
                    {platform}
                  </span>
                ))
              ) : (
                <span className="flex min-h-[3.75rem] items-center text-xs text-slate-500">
                  Platform details pending
                </span>
              )}
            </div>

            <div className="flex items-center justify-end">
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-cyan-200 transition group-hover:text-cyan-100">
                Open profile
              </span>
            </div>
          </div>

          {isAuthenticated && gameId && (
            <div className="grid gap-2 pt-1 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleToggleBookmark}
                disabled={bookmarkPending}
                className={`rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                  isSavedBookmark
                    ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/20 hover:text-white'
                } ${bookmarkPending ? 'cursor-not-allowed opacity-70' : ''}`}
              >
                {bookmarkPending
                  ? 'Saving...'
                  : isSavedBookmark
                  ? 'Bookmarked'
                  : 'Bookmark'}
              </button>
              <button
                type="button"
                onClick={handleToggleFavorite}
                disabled={favoritePending}
                className={`rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                  isSavedFavorite
                    ? 'border-rose-400/30 bg-rose-400/10 text-rose-100'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-rose-400/20 hover:text-white'
                } ${favoritePending ? 'cursor-not-allowed opacity-70' : ''}`}
              >
                {favoritePending
                  ? 'Saving...'
                  : isSavedFavorite
                  ? 'Favorited'
                  : 'Favorite'}
              </button>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
};

export default GameCard;
