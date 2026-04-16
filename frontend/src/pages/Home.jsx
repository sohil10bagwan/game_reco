import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/Authcontext.jsx';

const FEATURE_CARDS = [
  {
    title: 'Compatibility-first search',
    description:
      'Start with your hardware profile and narrow the catalog to games that actually fit your machine.',
  },
  {
    title: 'Clear requirement snapshots',
    description:
      'See RAM, CPU, GPU, and storage at a glance instead of digging through long detail pages.',
  },
  {
    title: 'Detailed game pages',
    description:
      'Open screenshots, platforms, release info, and system requirements from one place.',
  },
];

const WORKFLOW = [
  {
    step: '01',
    title: 'Describe your setup',
    description:
      'Use quick presets or enter exact RAM, CPU, GPU, and storage values.',
  },
  {
    step: '02',
    title: 'Scan the catalog',
    description:
      'We compare your hardware against the game library and rank the strongest fits.',
  },
  {
    step: '03',
    title: 'Open the details',
    description:
      'Explore screenshots, platforms, release info, and system requirements without losing context.',
  },
];

const DEVICE_CARDS = [
  {
    title: 'Search the library',
    description:
      'Browse titles, use filters, and move quickly between categories and search results.',
  },
  {
    title: 'Check compatibility',
    description:
      'Enter your specs and get ranked matches based on the minimum requirements in the catalog.',
  },
  {
    title: 'Open full details',
    description:
      'Review screenshots, platforms, release info, and system requirements before you decide.',
  },
];

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="page-shell">
      <div className="page-container space-y-8 sm:space-y-10 lg:space-y-12">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div className="section-card p-6 sm:p-8 lg:p-10">
            <span className="eyebrow">Game recommendation platform</span>
            <h1 className="page-title mt-4 max-w-[14ch] text-balance">
              Find games that match your rig, not just your wishlist.
            </h1>
            <p className="page-copy mt-5 max-w-[42rem]">
              GameReco helps players search a growing game library by hardware
              fit, not guesswork. Enter your PC specs, browse featured releases,
              and move from recommendation to deep detail view in one clear flow.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={isAuthenticated ? '/recommend' : '/register'}
                className="btn-solid no-underline"
              >
                {isAuthenticated ? 'Start matching' : 'Create free account'}
              </Link>
              <Link to="/games" className="btn-ghost no-underline">
                Explore game library
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                { value: 'Smart matches', label: 'Recommendations based on hardware fit' },
                { value: 'Live filters', label: 'Search, genre, and category controls' },
                { value: 'Game details', label: 'Requirements, screenshots, and metadata' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-4"
                >
                  <div className="font-['Space_Grotesk'] text-xl font-semibold text-white">
                    {item.value}
                  </div>
                  <div className="mt-1 text-sm leading-6 text-slate-400">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            <div className="section-card p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
                    Compatibility board
                  </div>
                  <h2 className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-white">
                    One glance, clear decision
                  </h2>
                </div>
                <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-cyan-100">
                  Sample
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  { label: 'Performance match', value: '92%', tone: 'text-emerald-300' },
                  { label: 'Recommended tier', value: 'High settings', tone: 'text-cyan-200' },
                  { label: 'Required storage', value: '120 GB', tone: 'text-violet-200' },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/15 px-4 py-3"
                  >
                    <span className="text-sm text-slate-400">{row.label}</span>
                    <span className={`text-sm font-semibold ${row.tone}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-card--soft p-5 sm:p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-200">
                Quick benefits
              </div>
              <div className="mt-3 grid gap-3">
                {[
                  'Check match scores before you install or download.',
                  'Browse featured titles and jump directly into full game details.',
                  'Keep recommendations, profile actions, and admin tools in one app.',
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm leading-6 text-slate-300"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {FEATURE_CARDS.map((card) => (
            <div key={card.title} className="section-card p-5 sm:p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
                Feature
              </div>
              <h2 className="mt-3 font-['Space_Grotesk'] text-2xl font-semibold text-white">
                {card.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                {card.description}
              </p>
            </div>
          ))}
        </section>

        <section className="section-card p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="eyebrow">What you can do here</span>
              <h2 className="page-subtitle mt-4">Search, compare, and decide faster</h2>
            </div>
            <p className="max-w-[34rem] text-sm leading-7 text-slate-400 sm:text-right">
              Move from the game library to compatibility checks and full detail
              pages without losing context along the way.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {DEVICE_CARDS.map((card) => (
              <div
                key={card.title}
                className="rounded-[1.5rem] border border-white/10 bg-black/15 p-5"
              >
                <div className="font-['Space_Grotesk'] text-xl font-semibold text-white">
                  {card.title}
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {WORKFLOW.map((item) => (
            <div key={item.step} className="section-card p-5 sm:p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-200">
                Step {item.step}
              </div>
              <h2 className="mt-3 font-['Space_Grotesk'] text-2xl font-semibold text-white">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                {item.description}
              </p>
            </div>
          ))}
        </section>

        <section className="section-card overflow-hidden p-6 sm:p-8 lg:p-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <span className="eyebrow">Start the library pass</span>
              <h2 className="page-subtitle mt-4 max-w-[18ch]">
                Browse the catalog or run your hardware scan now.
              </h2>
              <p className="mt-4 max-w-[42rem] text-sm leading-7 text-slate-400 sm:text-base">
                The app is already structured around searchable pages, detailed
                game views, and authenticated recommendation flows, so you can
                move straight from curiosity to a shortlist of games you can play.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                to={isAuthenticated ? '/recommend' : '/register'}
                className="btn-solid no-underline"
              >
                {isAuthenticated ? 'Open recommender' : 'Create account'}
              </Link>
              <Link to="/games" className="btn-ghost no-underline">
                Browse games
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
