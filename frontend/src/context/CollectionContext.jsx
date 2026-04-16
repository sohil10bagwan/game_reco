import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth } from './Authcontext.jsx';
import { libraryAPI } from '../services/api.js';

const CollectionContext = createContext(null);

const createEmptyCollections = () => ({
  bookmarks: [],
  favorites: [],
});

const createEmptyPendingState = () => ({
  bookmarks: [],
  favorites: [],
});

const getGameId = (game) => game?._id || game?.id || null;

const normalizeArray = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return value ? [value] : [];
};

const normalizeGame = (game) => {
  const id = getGameId(game);

  if (!id) {
    return null;
  }

  const requirements = game.requirements ?? {};
  const image =
    game.image || game.imageUrl || game.coverImage || game.thumbnail || '';

  return {
    ...game,
    _id: game._id || id,
    id,
    title: game.title || 'Untitled game',
    description: game.description || '',
    genre: normalizeArray(game.genre),
    platform: normalizeArray(game.platform),
    image,
    imageUrl: game.imageUrl || image,
    minRam: game.minRam ?? requirements.minRam ?? '',
    minCpu: game.minCpu ?? requirements.minCpu ?? '',
    minGpu: game.minGpu ?? requirements.minGpu ?? '',
    storage: game.storage ?? requirements.storage ?? '',
    requirements: {
      ...requirements,
      minRam: requirements.minRam ?? game.minRam ?? '',
      minCpu: requirements.minCpu ?? game.minCpu ?? '',
      minGpu: requirements.minGpu ?? game.minGpu ?? '',
      storage: requirements.storage ?? game.storage ?? '',
    },
    savedAt: game.savedAt || Date.now(),
  };
};

const normalizeCollections = (library) => ({
  bookmarks: Array.isArray(library?.bookmarks)
    ? library.bookmarks.map(normalizeGame).filter(Boolean)
    : [],
  favorites: Array.isArray(library?.favorites)
    ? library.favorites.map(normalizeGame).filter(Boolean)
    : [],
});

const extractCollections = (payload) => {
  const root = payload?.data ?? payload ?? {};
  const library = root?.library ?? root;
  return normalizeCollections(library);
};

export const CollectionProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const userKey = useMemo(
    () => user?._id || user?.id || user?.email || null,
    [user]
  );
  const [collections, setCollections] = useState(createEmptyCollections);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(createEmptyPendingState);

  const syncCollections = useCallback((payload) => {
    const nextCollections = extractCollections(payload);
    setCollections(nextCollections);
    return nextCollections;
  }, []);

  const setPendingState = useCallback((type, gameId, active) => {
    setPending((current) => ({
      ...current,
      [type]: active
        ? Array.from(new Set([...current[type], gameId]))
        : current[type].filter((item) => item !== gameId),
    }));
  }, []);

  const isStored = useCallback(
    (type, gameId) =>
      collections[type].some((item) => getGameId(item) === gameId),
    [collections]
  );

  const refreshLibrary = useCallback(async () => {
    if (!isAuthenticated || !userKey) {
      const emptyCollections = createEmptyCollections();
      setCollections(emptyCollections);
      setPending(createEmptyPendingState());
      setError(null);
      return emptyCollections;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await libraryAPI.getMyLibrary();
      return syncCollections(response.data);
    } catch (fetchError) {
      console.error(fetchError);
      setCollections(createEmptyCollections());
      setError(
        fetchError.response?.data?.message || 'Failed to load your library.'
      );
      throw fetchError;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, syncCollections, userKey]);

  useEffect(() => {
    let ignore = false;

    if (!isAuthenticated || !userKey) {
      setCollections(createEmptyCollections());
      setPending(createEmptyPendingState());
      setLoading(false);
      setError(null);
      return undefined;
    }

    setLoading(true);
    setError(null);

    const loadLibrary = async () => {
      try {
        const response = await libraryAPI.getMyLibrary();

        if (!ignore) {
          syncCollections(response.data);
        }
      } catch (fetchError) {
        if (!ignore) {
          console.error(fetchError);
          setCollections(createEmptyCollections());
          setError(
            fetchError.response?.data?.message || 'Failed to load your library.'
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadLibrary();

    return () => {
      ignore = true;
    };
  }, [isAuthenticated, syncCollections, userKey]);

  const toggleBookmark = useCallback(
    async (game) => {
      const gameId = getGameId(game);

      if (!gameId || !isAuthenticated || !userKey) {
        return false;
      }

      const currentlyBookmarked = isStored('bookmarks', gameId);
      setPendingState('bookmarks', gameId, true);

      try {
        const response = currentlyBookmarked
          ? await libraryAPI.removeBookmark(gameId)
          : await libraryAPI.addBookmark(gameId);

        syncCollections(response.data);
        setError(null);
        return !currentlyBookmarked;
      } catch (toggleError) {
        console.error(toggleError);
        setError(
          toggleError.response?.data?.message ||
            'Failed to update bookmarks.'
        );
        throw toggleError;
      } finally {
        setPendingState('bookmarks', gameId, false);
      }
    },
    [isAuthenticated, isStored, setPendingState, syncCollections, userKey]
  );

  const toggleFavorite = useCallback(
    async (game) => {
      const gameId = getGameId(game);

      if (!gameId || !isAuthenticated || !userKey) {
        return false;
      }

      const currentlyFavorited = isStored('favorites', gameId);
      setPendingState('favorites', gameId, true);

      try {
        const response = currentlyFavorited
          ? await libraryAPI.removeFavorite(gameId)
          : await libraryAPI.addFavorite(gameId);

        syncCollections(response.data);
        setError(null);
        return !currentlyFavorited;
      } catch (toggleError) {
        console.error(toggleError);
        setError(
          toggleError.response?.data?.message ||
            'Failed to update favorites.'
        );
        throw toggleError;
      } finally {
        setPendingState('favorites', gameId, false);
      }
    },
    [isAuthenticated, isStored, setPendingState, syncCollections, userKey]
  );

  const removeBookmark = useCallback(
    async (gameId) => {
      if (!gameId || !isAuthenticated || !userKey) {
        return;
      }

      setPendingState('bookmarks', gameId, true);

      try {
        const response = await libraryAPI.removeBookmark(gameId);
        syncCollections(response.data);
        setError(null);
      } catch (removeError) {
        console.error(removeError);
        setError(
          removeError.response?.data?.message ||
            'Failed to remove bookmark.'
        );
        throw removeError;
      } finally {
        setPendingState('bookmarks', gameId, false);
      }
    },
    [isAuthenticated, setPendingState, syncCollections, userKey]
  );

  const removeFavorite = useCallback(
    async (gameId) => {
      if (!gameId || !isAuthenticated || !userKey) {
        return;
      }

      setPendingState('favorites', gameId, true);

      try {
        const response = await libraryAPI.removeFavorite(gameId);
        syncCollections(response.data);
        setError(null);
      } catch (removeError) {
        console.error(removeError);
        setError(
          removeError.response?.data?.message ||
            'Failed to remove favorite.'
        );
        throw removeError;
      } finally {
        setPendingState('favorites', gameId, false);
      }
    },
    [isAuthenticated, setPendingState, syncCollections, userKey]
  );

  const value = useMemo(
    () => ({
      bookmarks: collections.bookmarks,
      favorites: collections.favorites,
      bookmarkCount: collections.bookmarks.length,
      favoriteCount: collections.favorites.length,
      isAuthenticated,
      loading,
      error,
      refreshLibrary,
      isBookmarked: (gameId) => isStored('bookmarks', gameId),
      isFavorited: (gameId) => isStored('favorites', gameId),
      isBookmarkPending: (gameId) => pending.bookmarks.includes(gameId),
      isFavoritePending: (gameId) => pending.favorites.includes(gameId),
      toggleBookmark,
      toggleFavorite,
      removeBookmark,
      removeFavorite,
    }),
    [
      collections,
      error,
      isAuthenticated,
      isStored,
      loading,
      pending,
      refreshLibrary,
      removeBookmark,
      removeFavorite,
      toggleBookmark,
      toggleFavorite,
    ]
  );

  return (
    <CollectionContext.Provider value={value}>
      {children}
    </CollectionContext.Provider>
  );
};

export const useCollection = () => {
  const context = useContext(CollectionContext);

  if (!context) {
    throw new Error('useCollection must be used within CollectionProvider');
  }

  return context;
};
