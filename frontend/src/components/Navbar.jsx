import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/Authcontext.jsx';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const navLinks = useMemo(() => {
    const links = [
      { to: '/', label: 'Home' },
      { to: '/games', label: 'Browse games' },
    ];

    if (isAuthenticated) {
      links.push(
        { to: '/recommend', label: 'Recommendations' },
        { to: '/library', label: 'My library' },
        { to: '/profile', label: 'Profile' }
      );
    }

    if (isAdmin) {
      links.push({ to: '/adminpanel', label: 'Admin panel' });
    }

    return links;
  }, [isAdmin, isAuthenticated]);

  const isActive = (path) =>
    path === '/'
      ? location.pathname === path
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-[1100] border-b border-white/10 bg-[rgba(4,8,22,0.86)] backdrop-blur-xl">
      <div className="page-container">
        <div className="flex min-h-[4.75rem] items-center gap-4 py-3">
          <Link
            to="/"
            className="group flex min-w-0 items-center gap-3 no-underline"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 shadow-[0_12px_32px_rgba(34,211,238,0.15)]">
              <span className="font-['Space_Grotesk'] text-lg font-bold text-cyan-200">
                GR
              </span>
            </div>
            <div className="min-w-0">
              <div className="truncate font-['Space_Grotesk'] text-lg font-bold tracking-[-0.04em] text-white sm:text-xl">
                GameReco
              </div>
              <div className="hidden truncate text-xs text-slate-400 sm:block">
                Hardware-aware game discovery
              </div>
            </div>
          </Link>

          <div className="hidden flex-1 items-center justify-between gap-4 xl:flex">
            <div className="flex flex-wrap items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`pill-button no-underline ${
                    isActive(link.to)
                      ? 'border-cyan-400/30 bg-cyan-400/10 text-white'
                      : ''
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                    Signed in as{' '}
                    <span className="font-semibold text-white">
                      {user?.name || 'Player'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn-ghost"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-ghost no-underline">
                    Login
                  </Link>
                  <Link to="/register" className="btn-solid no-underline">
                    Create account
                  </Link>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="ml-auto inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10 xl:hidden"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 bg-[rgba(4,8,22,0.96)] xl:hidden">
          <div className="page-container pb-5 pt-4">
            <div className="section-card space-y-5 px-4 py-4 sm:px-6">
              <div className="grid gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold no-underline transition ${
                      isActive(link.to)
                        ? 'border-cyan-400/35 bg-cyan-400/10 text-white'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/25 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                      Signed in as{' '}
                      <span className="font-semibold text-white">
                        {user?.name || 'Player'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="btn-ghost w-full"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Link to="/login" className="btn-ghost no-underline">
                      Login
                    </Link>
                    <Link to="/register" className="btn-solid no-underline">
                      Create account
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
