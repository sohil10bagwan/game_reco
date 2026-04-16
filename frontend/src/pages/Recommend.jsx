import React, { useState } from 'react';
import toast from 'react-hot-toast';
import HardwareForm from '../components/Hardwareform.jsx';
import GameCard from '../components/Gamecard.jsx';
import { recommendAPI } from '../services/api.js';

const RESULTS_BATCH_SIZE = 8;

const Recommend = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(RESULTS_BATCH_SIZE);

  const handleSubmit = async (specs) => {
    setLoading(true);

    try {
      const response = await recommendAPI.getRecommendations(specs);
      const payload = response.data?.data;
      setResults(payload);
      setVisibleCount(RESULTS_BATCH_SIZE);
      toast.success('Compatibility results updated.');
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Recommendation failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const resultGames = results?.games || [];
  const visibleGames = resultGames.slice(0, visibleCount);
  const hasMoreGames = visibleGames.length < resultGames.length;

  const handleShowMore = () => {
    setVisibleCount((current) => current + RESULTS_BATCH_SIZE);
  };

  return (
    <div className="page-shell">
      <div className="page-container space-y-8">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <div className="section-card p-6 sm:p-8 lg:p-10">
            <span className="eyebrow">Compatibility check</span>
            <h1 className="page-title mt-4 max-w-[12ch] text-balance">
              Match your hardware with the right games.
            </h1>
            <p className="page-copy mt-5 max-w-[42rem]">
              Enter your specs once and we compare them against the game
              library. Results are ranked by hardware fit, with direct access
              to requirements, screenshots, and full game details.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                {
                  label: 'Scored',
                  value: 'Compatibility percentage per title',
                },
                {
                  label: 'Sorted',
                  value: 'Strongest matches shown first',
                },
                {
                  label: 'Actionable',
                  value: 'Upgrade hints when no title qualifies',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-4"
                >
                  <div className="font-['Space_Grotesk'] text-xl font-semibold text-white">
                    {item.label}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-400">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section-card--soft flex flex-col gap-4 p-5 sm:p-6">
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">
              How matching works
            </div>
            {[
              'Start with a preset if you want a quick estimate, then fine tune the exact numbers.',
              'Higher match scores usually mean more performance headroom for that title.',
              'Open any result to compare screenshots, platforms, and requirement details.',
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm leading-6 text-slate-300"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <HardwareForm onSubmit={handleSubmit} loading={loading} />

        {results && (
          <section className="space-y-6">
            <div className="section-card p-5 sm:p-6 lg:p-8">
              <div className="grid gap-4 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
                <div className="rounded-[1.35rem] border border-cyan-400/20 bg-cyan-400/10 px-5 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
                    Games shown
                  </div>
                  <div className="mt-2 font-['Space_Grotesk'] text-4xl font-semibold text-white">
                    {visibleGames.length}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: 'RAM', value: `${results.userSpecs?.ram ?? '--'} GB` },
                    { label: 'CPU', value: `${results.userSpecs?.cpu ?? '--'} GHz` },
                    { label: 'GPU', value: `${results.userSpecs?.gpu ?? '--'} GB` },
                    {
                      label: 'Storage',
                      value: `${results.userSpecs?.storage ?? '--'} GB`,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3"
                    >
                      <div className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        {item.label}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-white">
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>

                {results.fromCache && (
                  <div className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100">
                    Cached result
                  </div>
                )}
              </div>
            </div>

            {results.totalMatches === 0 ? (
              <div className="section-card p-6 sm:p-8">
                <h2 className="page-subtitle">No compatible games yet</h2>
                <p className="mt-4 max-w-[42rem] text-sm leading-7 text-slate-400 sm:text-base">
                  Your current hardware profile is below the minimum target for
                  the games in this library. These upgrade ideas focus on the
                  fields that will unlock the biggest improvement first.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {Number(results.userSpecs?.ram) < 8 && (
                    <SuggestCard
                      title="Increase RAM"
                      description="Aim for at least 8 GB to widen the list of modern titles."
                    />
                  )}
                  {Number(results.userSpecs?.gpu) < 4 && (
                    <SuggestCard
                      title="Upgrade GPU memory"
                      description="4 GB of VRAM is a practical floor for more demanding games."
                    />
                  )}
                  {Number(results.userSpecs?.storage) < 50 && (
                    <SuggestCard
                      title="Free more storage"
                      description="Reserve enough room for installs, patches, and cached assets."
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {visibleGames.map((game) => (
                    <GameCard
                      key={game._id}
                      game={game}
                      matchScore={game.matchScore}
                      showMatch
                      showSpecs
                      fromCache={results.fromCache}
                    />
                  ))}
                </div>

                {(resultGames.length > RESULTS_BATCH_SIZE || hasMoreGames) && (
                  <div className="section-card flex flex-col items-center gap-4 p-5 text-center sm:p-6">
                    <div className="text-sm leading-6 text-slate-400">
                      Showing {visibleGames.length} games on screen.
                    </div>

                    {hasMoreGames ? (
                      <button
                        type="button"
                        onClick={handleShowMore}
                        className="btn-ghost"
                      >
                        Show more games
                      </button>
                    ) : (
                      <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-100">
                        All compatible games loaded
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

const SuggestCard = ({ title, description }) => (
  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
    <div className="font-['Space_Grotesk'] text-xl font-semibold text-white">
      {title}
    </div>
    <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
  </div>
);

export default Recommend;
