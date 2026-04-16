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

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });
  const { register, loading, setError, getDefaultRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.password !== form.confirm) {
      toast.error('Passwords do not match.');
      return;
    }

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    const result = await register(form.name, form.email, form.password);

    if (result.success) {
      toast.success(
        result.authenticated
          ? 'Account created successfully.'
          : 'Account created successfully. Please sign in.'
      );
      navigate(
        result.authenticated
          ? getRedirectTarget(location, getDefaultRoute, result.user)
          : '/',
        {
          replace: true,
        }
      );
      return;
    }

    toast.error(result.message || 'Registration failed. Please try again.');
  };

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(440px,0.92fr)] lg:items-stretch">
          <section className="section-card hidden p-8 lg:flex lg:flex-col lg:justify-between xl:p-10">
            <div>
              <span className="eyebrow">Create account</span>
              <h1 className="page-title mt-4 max-w-[11ch] text-balance">
                Build your game-ready profile.
              </h1>
              <p className="page-copy mt-5 max-w-[38rem]">
                Create an account to save your place in the recommendation flow,
                access your profile dashboard, and move between player and admin
                experiences from the same polished interface.
              </p>
            </div>

            <div className="grid gap-4">
              {[
                'Responsive account screens with clear spacing and readable forms.',
                'Fast jump from registration into recommendations or the admin workspace.',
                'Consistent styling across home, browse, detail, profile, and management views.',
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

          <section className="section-card mx-auto w-full max-w-[34rem] p-6 sm:p-8">
            <div className="text-center">
              <span className="eyebrow">Join GameReco</span>
              <h1 className="page-subtitle mt-4">Create your account</h1>
              <p className="mt-3 text-sm leading-7 text-slate-400 sm:text-base">
                Save your profile and jump directly into hardware-aware discovery.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">
                  Full name
                </span>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  autoComplete="name"
                  required
                  className="field-control"
                />
              </label>

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

              <div className="grid gap-5 sm:grid-cols-2">
                <PasswordField
                  label="Password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  required
                />

                <PasswordField
                  label="Confirm password"
                  name="confirm"
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-solid w-full disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm leading-7 text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-cyan-200 no-underline">
                Sign in
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Register;
