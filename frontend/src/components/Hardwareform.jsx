import React, { useState } from 'react';
import toast from 'react-hot-toast';

const PRESETS = {
  'Low-end PC': { ram: 4, cpu: 2.0, gpu: 2, storage: 100 },
  'Mid-range PC': { ram: 16, cpu: 3.5, gpu: 6, storage: 500 },
  'High-end PC': { ram: 32, cpu: 4.5, gpu: 12, storage: 1000 },
  'Creator rig': { ram: 64, cpu: 5.0, gpu: 24, storage: 2000 },
};

const HardwareForm = ({ onSubmit, loading }) => {
  const [specs, setSpecs] = useState({
    ram: '',
    cpu: '',
    gpu: '',
    storage: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSpecs((current) => ({ ...current, [name]: value }));
  };

  const applyPreset = (preset) => {
    setSpecs(PRESETS[preset]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (Object.values(specs).some((value) => value === '')) {
      toast.error('Please fill in every hardware field.');
      return;
    }

    if (
      Object.values(specs).some(
        (value) => Number(value) <= 0 || Number.isNaN(Number(value))
      )
    ) {
      toast.error('Hardware values must be positive numbers.');
      return;
    }

    onSubmit({
      ram: Number(specs.ram),
      cpu: Number(specs.cpu),
      gpu: Number(specs.gpu),
      storage: Number(specs.storage),
    });
  };

  return (
    <div className="section-card mx-auto w-full max-w-[960px] p-5 sm:p-8 lg:p-10">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(250px,0.8fr)] xl:gap-8">
        <div className="space-y-6">
          <div className="space-y-3">
            <span className="eyebrow">Compatibility scan</span>
            <h2 className="page-subtitle">Enter your hardware profile</h2>
            <p className="page-copy">
              We compare your RAM, CPU, GPU, and free storage against every game
              in the library, then rank the best fits first.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {Object.keys(PRESETS).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => applyPreset(preset)}
                className="pill-button"
              >
                {preset}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="RAM"
                name="ram"
                value={specs.ram}
                onChange={handleChange}
                unit="GB"
                placeholder="16"
                hint="Total system memory"
              />
              <FormField
                label="CPU speed"
                name="cpu"
                value={specs.cpu}
                onChange={handleChange}
                unit="GHz"
                placeholder="3.5"
                hint="Base or boost clock"
              />
              <FormField
                label="GPU memory"
                name="gpu"
                value={specs.gpu}
                onChange={handleChange}
                unit="GB"
                placeholder="8"
                hint="Dedicated graphics memory"
              />
              <FormField
                label="Free storage"
                name="storage"
                value={specs.storage}
                onChange={handleChange}
                unit="GB"
                placeholder="500"
                hint="Available install space"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-solid w-full disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Scanning library...' : 'Find compatible games'}
            </button>
          </form>
        </div>

        <aside className="section-card--soft flex flex-col gap-4 p-5 sm:p-6">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">
              What we compare
            </div>
            <h3 className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-white">
              Hardware-first results
            </h3>
          </div>

          {[
            'Minimum requirement checks for each title in the catalog.',
            'Compatibility scoring so you can spot comfortable fits quickly.',
            'Clear upgrade signals when your current setup is under target.',
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm leading-6 text-slate-300"
            >
              {item}
            </div>
          ))}

          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm leading-6 text-cyan-100">
            Tip: use a preset first, then fine tune individual fields if you
            want a more exact match.
          </div>
        </aside>
      </div>
    </div>
  );
};

const FormField = ({
  label,
  name,
  value,
  onChange,
  unit,
  placeholder,
  hint,
}) => (
  <label className="block min-w-0">
    <span className="mb-2 block text-sm font-semibold text-slate-200">
      {label}
    </span>

    <div className="flex overflow-hidden rounded-2xl border border-white/10 bg-black/20">
      <input
        type="number"
        inputMode="decimal"
        min="0"
        step="0.1"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="min-h-[3.1rem] min-w-0 flex-1 border-0 bg-transparent px-4 text-white outline-none placeholder:text-slate-500"
      />
      <span className="flex items-center border-l border-white/10 bg-white/5 px-4 text-sm font-semibold text-cyan-100">
        {unit}
      </span>
    </div>

    <span className="mt-2 block text-xs uppercase tracking-[0.08em] text-slate-500">
      {hint}
    </span>
  </label>
);

export default HardwareForm;
