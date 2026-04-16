import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/Authcontext.jsx';
import PasswordField from '../components/PasswordField.jsx';

const AUTH_PAGES = new Set(['/login', '/register']);

const getRedirectTarget = (location, getDefaultRoute, user) => {
  const from = location.state?.from;
  const fromPath = from?.pathname;

  if (fromPath && !AUTH_PAGES.has(fromPath)) {
    return `${fromPath}${from.search || ''}${from.hash || ''}`;
  }

  return getDefaultRoute(user);
};

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, loading, setError, getDefaultRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const result = await login(form.email, form.password);

    if (result.success) {
      toast.success('Welcome back.');
      navigate(getRedirectTarget(location, getDefaultRoute, result.user), {
        replace: true,
      });
      return;
    }

    toast.error(result.message || 'Login failed. Please check your credentials.');
  };

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)] lg:items-stretch">
          <section className="section-card hidden p-8 lg:flex lg:flex-col lg:justify-between xl:p-10">
            <div>
              <span className="eyebrow">Sign in</span>
              <h1 className="page-title mt-4 max-w-[10ch] text-balance">
                Pick up where you left off.
              </h1>
              <p className="page-copy mt-5 max-w-[38rem]">
                Your profile, recommendations, and admin tools are all inside
                the same responsive shell, so you can move between flows without
                the UI fighting you.
              </p>
            </div>

            <div className="grid gap-4">
              {[
                'Browse the catalog with persistent filters and adaptive grids.',
                'Run hardware recommendations and jump straight into the matching detail view.',
                'Manage your account from a layout that scales from mobile to desktop.',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.35rem] border border-white/10 bg-white/5 px-5 py-4 text-sm leading-7 text-slate-300"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="section-card mx-auto w-full max-w-[32rem] p-6 sm:p-8">
            <div className="text-center">
              <span className="eyebrow">Welcome back</span>
              <h1 className="page-subtitle mt-4">Sign in to GameReco</h1>
              <p className="mt-3 text-sm leading-7 text-slate-400 sm:text-base">
                Access your recommendations, profile, and library progress.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">
                  Email
                </span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="field-control"
                />
              </label>

              <PasswordField
                label="Password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="btn-solid w-full disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm leading-7 text-slate-400">
              Do not have an account?{' '}
              <Link to="/register" className="font-semibold text-cyan-200 no-underline">
                Create one
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Login;
