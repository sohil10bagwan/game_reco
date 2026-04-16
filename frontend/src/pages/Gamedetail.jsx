import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { gamesAPI } from '../services/api.js';
import { useAuth } from '../context/Authcontext.jsx';
import { useCollection } from '../context/CollectionContext.jsx';
import './Gamedetail.css';

const toList = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return value ? [value] : [];
};

const getGameId = (game) => game?._id || game?.id || null;

const formatRequirementLabel = (key) =>
  key.replace(/([A-Z])/g, ' $1').replace(/^./, (value) => value.toUpperCase());

const StarRating = ({ rating }) => {
  const numericRating = Number(rating) || 0;
  const outOfFive = Math.max(0, Math.min(5, numericRating / 2));
  const fullStars = Math.floor(outOfFive);
  const hasHalf = outOfFive - fullStars >= 0.5;

  return (
    <div className="gd-rating">
      <div className="gd-rating__stars" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className={`gd-rating__star ${
              index < fullStars
                ? 'is-full'
                : hasHalf && index === fullStars
                ? 'is-half'
                : ''
            }`}
          >
            &#9733;
          </span>
        ))}
      </div>
      <span className="gd-rating__value">{numericRating.toFixed(1)}/10</span>
    </div>
  );
};

const GameDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const {
    isBookmarked,
    isFavorited,
    isBookmarkPending,
    isFavoritePending,
    toggleBookmark,
    toggleFavorite,
  } = useCollection();

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeScreenshot, setActiveScreenshot] = useState(null);

  useEffect(() => {
    if (!id) {
      setError('Game ID is missing from the route.');
      setLoading(false);
      return;
    }

    const fetchGame = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await gamesAPI.getById(id);
        const raw = response.data;
        const gameData = raw?.data?.game ?? raw?.data ?? raw?.game ?? raw;
        setGame(gameData);
      } catch (fetchError) {
        setError(
          fetchError.response?.status === 404
            ? 'Game not found.'
            : fetchError.response?.status === 400
            ? 'Invalid game ID.'
            : 'Unable to load this game right now.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [id]);

  if (loading) {
    return (
      <div className="gd-page">
        <div className="gd-shell">
          <div className="gd-state-card">
            <div className="gd-spinner" />
            <p>Loading game details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gd-page">
        <div className="gd-shell">
          <div className="gd-state-card">
            <p className="gd-state-card__error">{error}</p>
            <button type="button" className="gd-back-btn" onClick={() => navigate(-1)}>
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return null;
  }

  const coverImage = game.imageUrl || game.image || '';
  const years = toList(game.year);
  const platforms = toList(game.platform);
  const genres = toList(game.genre);
  const languages = toList(game.language);
  const screenshots = toList(game.screenshots);
  const requirements = game.requirements ?? {};
  const gameId = getGameId(game);
  const bookmarked = gameId ? isBookmarked(gameId) : false;
  const favorited = gameId ? isFavorited(gameId) : false;
  const bookmarkPending = gameId ? isBookmarkPending(gameId) : false;
  const favoritePending = gameId ? isFavoritePending(gameId) : false;
  const heroStyle = coverImage
    ? {
        backgroundImage: `linear-gradient(115deg, rgba(2,6,23,0.96) 0%, rgba(2,6,23,0.9) 48%, rgba(2,6,23,0.42) 100%), url(${coverImage})`,
      }
    : undefined;

  const requireLoginToSave = () => {
    toast.error('Please sign in to save bookmarks and favorites.');
    navigate('/login', {
      state: { from: location },
    });
  };

  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      requireLoginToSave();
      return;
    }

    if (bookmarkPending) {
      return;
    }

    try {
      const nextState = await toggleBookmark(game);
      toast.success(nextState ? 'Added to bookmarks.' : 'Removed from bookmarks.');
    } catch (toggleError) {
      toast.error(
        toggleError.response?.data?.message || 'Failed to update bookmarks.'
      );
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      requireLoginToSave();
      return;
    }

    if (favoritePending) {
      return;
    }

    try {
      const nextState = await toggleFavorite(game);
      toast.success(nextState ? 'Added to favorites.' : 'Removed from favorites.');
    } catch (toggleError) {
      toast.error(
        toggleError.response?.data?.message || 'Failed to update favorites.'
      );
    }
  };

  return (
    <div className="gd-page">
      <div className="gd-shell">
        <button type="button" className="gd-back-btn" onClick={() => navigate(-1)}>
          Back to library
        </button>

        <section className="gd-hero" style={heroStyle}>
          <div className="gd-hero__media">
            <div className="gd-cover-frame">
              {coverImage ? (
                <img src={coverImage} alt={game.title} className="gd-cover" />
              ) : (
                <div className="gd-cover-placeholder">No cover available</div>
              )}
            </div>
          </div>

          <div className="gd-hero__content">
            {(game.subtitle || game.type) && (
              <p className="gd-overline">
                {[game.subtitle, game.type].filter(Boolean).join(' | ')}
              </p>
            )}

            <h1 className="gd-title">{game.title}</h1>

            <div className="gd-rating-row">
              {game.rating != null && <StarRating rating={game.rating} />}
              {game.totalRatings != null && (
                <span className="gd-review-count">
                  {Number(game.totalRatings).toLocaleString()} ratings
                </span>
              )}
            </div>

            <div className="gd-chip-row">
              {platforms.map((platform) => (
                <span key={platform} className="gd-chip gd-chip--platform">
                  {platform}
                </span>
              ))}
              {game.size && <span className="gd-chip">{game.size}</span>}
              {years.length > 0 && <span className="gd-chip">{years.join(', ')}</span>}
              {game.version && (
                <span className="gd-chip gd-chip--accent">Version {game.version}</span>
              )}
            </div>

            <p className="gd-description">
              {game.description ||
                'No long description is available for this title yet.'}
            </p>

            <div className="gd-action-row">
              <button
                type="button"
                className={`gd-action-btn ${
                  bookmarked ? 'gd-action-btn--primary' : ''
                }`}
                disabled={bookmarkPending}
                onClick={handleToggleBookmark}
              >
                {bookmarkPending
                  ? 'Saving...'
                  : bookmarked
                  ? 'Bookmarked'
                  : 'Bookmark'}
              </button>
              <button
                type="button"
                className={`gd-action-btn ${
                  favorited ? 'gd-action-btn--primary' : 'gd-action-btn--ghost'
                }`}
                disabled={favoritePending}
                onClick={handleToggleFavorite}
              >
                {favoritePending
                  ? 'Saving...'
                  : favorited
                  ? 'Favorited'
                  : 'Favorite'}
              </button>
              {isAuthenticated && (
                <button
                  type="button"
                  className="gd-action-btn gd-action-btn--ghost"
                  onClick={() => navigate('/library')}
                >
                  Open my library
                </button>
              )}
              <button
                type="button"
                className="gd-action-btn gd-action-btn--ghost"
                onClick={() => navigate('/games')}
              >
                Browse more games
              </button>
              {!isAuthenticated && (
                <button
                  type="button"
                  className="gd-action-btn gd-action-btn--ghost"
                  onClick={requireLoginToSave}
                >
                  Sign in to save
                </button>
              )}
            </div>

            {!isAuthenticated && (
              <p className="gd-description">
                Sign in to keep your own bookmark and favorite lists.
              </p>
            )}

            <div className="gd-highlight-grid">
              {[
                { label: 'Genre', value: genres.join(', ') || 'Not listed' },
                { label: 'Languages', value: languages.join(', ') || 'Not listed' },
                { label: 'Release group', value: game.type || 'Standard release' },
                {
                  label: 'Published',
                  value: game.addedBy?.addedDate || 'Date unavailable',
                },
              ].map((item) => (
                <div key={item.label} className="gd-highlight-card">
                  <div className="gd-highlight-card__label">{item.label}</div>
                  <div className="gd-highlight-card__value">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="gd-content-grid">
          <div className="gd-main">
            <section className="gd-panel">
              <h2 className="gd-panel__title">Overview</h2>
              <p className="gd-panel__copy">
                {game.description ||
                  'Detailed editorial copy has not been added for this game yet.'}
              </p>
            </section>

            {screenshots.length > 0 && (
              <section className="gd-panel">
                <h2 className="gd-panel__title">Screenshot gallery</h2>
                <div className="gd-gallery">
                  {screenshots.map((src, index) => (
                    <button
                      key={`${src}-${index}`}
                      type="button"
                      className="gd-gallery__item"
                      onClick={() => setActiveScreenshot(src)}
                    >
                      <img src={src} alt={`Screenshot ${index + 1}`} />
                      <span className="gd-gallery__label">View image</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {Object.keys(requirements).length > 0 && (
              <section className="gd-panel">
                <h2 className="gd-panel__title">System requirements</h2>
                <div className="gd-requirement-grid">
                  {Object.entries(requirements).map(([key, value]) => (
                    <div key={key} className="gd-requirement-card">
                      <div className="gd-requirement-card__label">
                        {formatRequirementLabel(key)}
                      </div>
                      <div className="gd-requirement-card__value">{value}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="gd-side">
            <section className="gd-panel">
              <h2 className="gd-panel__title">Game info</h2>
              <div className="gd-info-list">
                <InfoRow label="Title" value={game.title || 'Untitled'} />
                <InfoRow
                  label="Release year"
                  value={years.length > 0 ? years.join(', ') : 'Unavailable'}
                />
                <InfoRow
                  label="Genres"
                  value={genres.length > 0 ? genres.join(', ') : 'Unavailable'}
                />
                <InfoRow
                  label="Platforms"
                  value={platforms.length > 0 ? platforms.join(', ') : 'Unavailable'}
                />
                <InfoRow label="File size" value={game.size || 'Unavailable'} />
                <InfoRow
                  label="Languages"
                  value={languages.length > 0 ? languages.join(', ') : 'Unavailable'}
                />
                <InfoRow label="Version" value={game.version || 'Unavailable'} />
              </div>
            </section>
          </aside>
        </section>
      </div>

      {activeScreenshot && (
        <div className="gd-lightbox" onClick={() => setActiveScreenshot(null)}>
          <button
            type="button"
            className="gd-lightbox__close"
            onClick={() => setActiveScreenshot(null)}
          >
            Close
          </button>
          <img
            src={activeScreenshot}
            alt="Selected screenshot"
            className="gd-lightbox__image"
          />
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="gd-info-list__row">
    <span className="gd-info-list__label">{label}</span>
    <span className="gd-info-list__value">{value}</span>
  </div>
);

export default GameDetail;
