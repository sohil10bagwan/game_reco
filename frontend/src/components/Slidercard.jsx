import { useEffect, useMemo, useState } from 'react';

const TYPE_COLORS = {
  Featured: '#8b5cf6',
  Sale: '#fb7185',
  New: '#34d399',
  Update: '#22d3ee',
  Event: '#f59e0b',
  DLC: '#f97316',
};

const clampDescription = (value = '') => {
  if (value.length <= 110) {
    return value;
  }

  return `${value.slice(0, 110).trim()}...`;
};

export default function SliderCard({
  slider,
  onEdit,
  onDelete,
  onToggleActive,
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgLoaded(false);
    setImgError(false);
  }, [slider?.image, slider?.imageUrl]);

  const accentColor = TYPE_COLORS[slider?.type] || slider?.accent || '#22d3ee';
  const imageUrl = slider?.imageUrl || slider?.image || '';
  const showImage = Boolean(imageUrl) && !imgError;

  const meta = useMemo(
    () =>
      [
        slider?.version ? `Version ${slider.version}` : null,
        slider?.platform || null,
        slider?.type || null,
        slider?.year || null,
      ].filter(Boolean),
    [slider]
  );

  return (
    <article className="section-card flex h-full flex-col overflow-hidden">
      <div
        className="relative aspect-[16/10] overflow-hidden"
        style={{
          background:
            slider?.bg ||
            `linear-gradient(135deg, ${accentColor}55 0%, rgba(15,23,42,0.96) 100%)`,
        }}
      >
        {showImage ? (
          <>
            <img
              src={imageUrl}
              alt={slider?.title || 'Slider artwork'}
              className={`h-full w-full object-cover transition duration-500 ${
                imgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImgLoaded(true)}
              onError={() => {
                setImgLoaded(false);
                setImgError(true);
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/20 to-transparent" />
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
              Slider
            </div>
          </div>
        )}

        <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
          {slider?.type ? (
            <span
              className="rounded-full px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-white"
              style={{ background: accentColor }}
            >
              {slider.type}
            </span>
          ) : (
            <span />
          )}

          <span
            className={`rounded-full px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.08em] ${
              slider?.isActive
                ? 'border border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                : 'border border-rose-400/30 bg-rose-400/10 text-rose-200'
            }`}
          >
            {slider?.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <div>
          <h3 className="font-['Space_Grotesk'] text-xl font-semibold text-white">
            {slider?.title || 'Untitled slider'}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {clampDescription(
              slider?.description ||
                'Add copy, visuals, and badges to shape the hero carousel.'
            )}
          </p>
        </div>

        {meta.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {meta.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.72rem] font-medium text-slate-300"
              >
                {item}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto grid gap-2 sm:grid-cols-3">
          {onToggleActive && (
            <button
              type="button"
              className={`rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                slider?.isActive
                  ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/15'
                  : 'border-rose-400/30 bg-rose-400/10 text-rose-100 hover:bg-rose-400/15'
              }`}
              onClick={() => onToggleActive(slider?._id)}
            >
              {slider?.isActive ? 'Deactivate' : 'Activate'}
            </button>
          )}

          <button
            type="button"
            className="rounded-2xl border border-cyan-400/25 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/15"
            onClick={() => onEdit?.(slider)}
          >
            Edit
          </button>

          <button
            type="button"
            className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/15"
            onClick={() => onDelete?.(slider?._id)}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
