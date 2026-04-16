const normalizePath = (path = '/') => {
  if (!path) {
    return '/';
  }

  return path.startsWith('/') ? path : `/${path}`;
};

export const getCurrentAppPath = () => {
  if (typeof window === 'undefined') {
    return '/';
  }

  const hashPath = window.location.hash.replace(/^#/, '');
  const rawPath = hashPath || window.location.pathname || '/';
  const [path] = rawPath.split(/[?#]/);

  return normalizePath(path || '/');
};

export const buildAppUrl = (path) => {
  if (typeof window === 'undefined') {
    return normalizePath(path);
  }

  const normalizedPath = normalizePath(path);
  const basePath = window.location.pathname.replace(/\/index\.html$/, '/');

  return `${window.location.origin}${basePath}${window.location.search}#${normalizedPath}`;
};
