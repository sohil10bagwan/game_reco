import React from 'react';

const SkeletonBlock = ({ className = '' }) => (
  <div className={`loading-shimmer ${className}`.trim()} />
);

const RouteSkeleton = () => (
  <div className="page-shell" aria-hidden="true">
    <div className="page-container space-y-8 sm:space-y-10">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div className="section-card p-6 sm:p-8 lg:p-10">
          <SkeletonBlock className="h-9 w-44 rounded-full" />
          <SkeletonBlock className="mt-6 h-14 max-w-[36rem] rounded-[1.75rem]" />
          <SkeletonBlock className="mt-4 h-4 max-w-[40rem] rounded-full" />
          <SkeletonBlock className="mt-3 h-4 max-w-[32rem] rounded-full" />

          <div className="mt-8 flex flex-wrap gap-3">
            <SkeletonBlock className="h-12 w-40 rounded-full" />
            <SkeletonBlock className="h-12 w-44 rounded-full" />
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] p-4"
              >
                <SkeletonBlock className="h-7 w-28 rounded-full" />
                <SkeletonBlock className="mt-3 h-3 w-full rounded-full" />
                <SkeletonBlock className="mt-2 h-3 w-4/5 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="section-card p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <SkeletonBlock className="h-4 w-32 rounded-full" />
                <SkeletonBlock className="h-10 w-52 rounded-full" />
              </div>
              <SkeletonBlock className="h-8 w-20 rounded-full" />
            </div>

            <div className="mt-6 space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-4">
                    <SkeletonBlock className="h-3 w-28 rounded-full" />
                    <SkeletonBlock className="h-4 w-20 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section-card--soft p-5 sm:p-6">
            <SkeletonBlock className="h-4 w-32 rounded-full" />
            <div className="mt-4 space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3"
                >
                  <SkeletonBlock className="h-3 w-full rounded-full" />
                  <SkeletonBlock className="mt-2 h-3 w-5/6 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-card p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(280px,0.95fr)_minmax(0,1.2fr)_minmax(0,1.2fr)]">
          {[1, 2, 3].map((item) => (
            <div key={item} className="space-y-3">
              <SkeletonBlock className="h-4 w-24 rounded-full" />
              <div className="rounded-[1.15rem] border border-white/10 bg-white/[0.04] p-4">
                <SkeletonBlock className="h-5 w-1/2 rounded-full" />
                <SkeletonBlock className="mt-4 h-10 w-full rounded-2xl" />
                <SkeletonBlock className="mt-3 h-10 w-4/5 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="section-card overflow-hidden p-4"
          >
            <SkeletonBlock className="h-40 w-full rounded-[1.35rem]" />
            <SkeletonBlock className="mt-4 h-6 w-4/5 rounded-full" />
            <SkeletonBlock className="mt-3 h-3 w-full rounded-full" />
            <SkeletonBlock className="mt-2 h-3 w-5/6 rounded-full" />
            <div className="mt-5 flex gap-2">
              <SkeletonBlock className="h-8 w-20 rounded-full" />
              <SkeletonBlock className="h-8 w-24 rounded-full" />
            </div>
          </div>
        ))}
      </section>
    </div>
  </div>
);

export default RouteSkeleton;
