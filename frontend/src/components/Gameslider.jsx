import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sliderAPI } from '../services/api.js';

const FALLBACK_BG =
  'linear-gradient(135deg, rgba(13,27,42,0.95) 0%, rgba(27,40,56,0.92) 42%, rgba(42,63,95,0.9) 100%)';

const slideMeta = (slide) =>
  [
    slide?.version ? `Version ${slide.version}` : null,
    slide?.platform || null,
    slide?.type || null,
    slide?.year || null,
  ].filter(Boolean);

export default function GameSlider({ mode = 'hero' }) {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        setLoading(true);
        const response = await sliderAPI.getAll();
        const sliderData = response.data?.data || [];
        setSlides(sliderData.filter((slider) => slider.isActive !== false));
      } catch (error) {
        console.error('Failed to fetch sliders:', error);
        setSlides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  useEffect(() => {
    setImageError(false);
  }, [current]);

  useEffect(() => {
    if (slides.length <= 1) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setCurrent((value) => (value + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [slides.length]);

  const isCompact = mode === 'compact';
  const currentSlide = slides[current];
  const slideImage = currentSlide?.imageUrl || currentSlide?.image || '';
  const minHeightClass = isCompact
    ? 'min-h-[420px] sm:min-h-[500px] lg:min-h-[560px]'
    : 'min-h-[560px] sm:min-h-[640px] xl:min-h-[720px]';
  const contentPadding = isCompact
    ? 'px-5 py-6 sm:px-8 sm:py-8 lg:px-10'
    : 'px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12 xl:px-16';

  const goTo = (index) => {
    if (slides.length === 0) {
      return;
    }

    setCurrent(index);
  };

  const next = () => {
    setCurrent((value) => (value + 1) % slides.length);
  };

  const prev = () => {
    setCurrent((value) => (value - 1 + slides.length) % slides.length);
  };

  if (loading) {
    return (
      <div
        className={`section-card relative overflow-hidden ${minHeightClass}`}
        style={{ background: FALLBACK_BG }}
      >
        <div className="flex h-full items-center justify-center px-6 py-20 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/15 border-t-cyan-300" />
            <p className="max-w-md text-sm leading-6 text-slate-300 sm:text-base">
              Loading featured games and slider visuals.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentSlide) {
    return null;
  }

  return (
    <section
      className={`section-card relative overflow-hidden ${minHeightClass}`}
      style={{ background: currentSlide.bg || FALLBACK_BG }}
    >
      {slideImage && !imageError && (
        <img
          src={slideImage}
          alt={currentSlide.title || 'Featured slide'}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      )}

      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(3,7,18,0.97)_0%,rgba(3,7,18,0.86)_42%,rgba(3,7,18,0.32)_72%,rgba(3,7,18,0.62)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.2),_transparent_28%)]" />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#020617] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#020617] to-transparent" />

      <div className={`relative z-10 flex h-full ${minHeightClass} items-end lg:items-center`}>
        <div
          key={currentSlide._id || currentSlide.id || current}
          className={`flex w-full flex-col gap-6 lg:flex-row lg:items-end lg:justify-between ${contentPadding} animate-fade-in`}
        >
          <div className="max-w-[42rem] space-y-5">
            <span className="eyebrow">
              {isCompact ? 'Featured now' : 'Featured release'}
            </span>

            <div className="space-y-4">
              <h2 className="font-['Space_Grotesk'] text-[clamp(2.2rem,6vw,5.4rem)] font-bold leading-[0.92] tracking-[-0.06em] text-white">
                {currentSlide.title || 'Featured game'}
              </h2>

              <p className="max-w-[34rem] text-sm leading-7 text-slate-200/85 sm:text-base sm:leading-8">
                {currentSlide.description ||
                  'Use this space to highlight a release, update, event, or promotion from your catalog.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {slideMeta(currentSlide).map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-[0.76rem] font-semibold uppercase tracking-[0.08em] text-white/90 backdrop-blur-md"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/games" className="btn-solid no-underline">
                Browse library
              </Link>
              <Link to="/recommend" className="btn-ghost no-underline">
                Check compatibility
              </Link>
            </div>
          </div>

          <div className="w-full max-w-[24rem] self-stretch lg:self-auto">
            <div className="section-card--soft flex h-full flex-col gap-5 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200">
                    Slider status
                  </div>
                  <div className="mt-1 font-['Space_Grotesk'] text-2xl font-semibold text-white">
                    {current + 1} of {slides.length}
                  </div>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-300">
                  Auto rotate
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  key={current}
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-400 animate-[progressFill_5s_linear_forwards]"
                  style={{ width: `${100 / Math.max(slides.length, 1)}%` }}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    label: 'Platform',
                    value: currentSlide.platform || 'Cross-platform',
                  },
                  {
                    label: 'Type',
                    value: currentSlide.type || 'Featured',
                  },
                  {
                    label: 'Release year',
                    value: currentSlide.year || 'Current',
                  },
                  {
                    label: 'Accent',
                    value: currentSlide.accent || '#22d3ee',
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
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 left-5 right-5 z-20 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:px-3">
        <div className="flex flex-wrap items-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide._id || slide.id || `${slide.title}-${index}`}
              type="button"
              onClick={() => goTo(index)}
              className={`h-2.5 rounded-full border-0 transition ${
                index === current
                  ? 'w-10 bg-cyan-300'
                  : 'w-2.5 bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {slides.length > 1 && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={prev}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/8 text-lg font-semibold text-white transition hover:bg-white/14"
              aria-label="Previous slide"
            >
              <span aria-hidden="true">&lt;</span>
            </button>
            <button
              type="button"
              onClick={next}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/8 text-lg font-semibold text-white transition hover:bg-white/14"
              aria-label="Next slide"
            >
              <span aria-hidden="true">&gt;</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
