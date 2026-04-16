import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import GameSlider from '../components/Gameslider.jsx';
import { gamesAPI } from '../services/api.js';

const GENRES = [
  'Action', 'RPG', 'Strategy', 'Sports', 'Simulation',
  'Horror', 'Adventure', 'FPS', 'Puzzle', 'Racing',
  'Fighting', 'MMO', 'Indie',
];

const PLATFORMS = ['PC', 'PlayStation', 'Xbox', 'Nintendo', 'Mobile'];

const EMPTY_FORM = {
  title: '',
  description: '',
  Years: '',
  rating: '',
  version: '',
  genre: [],
  platform: [],
  minRam: '',
  minCpu: '',
  minGpu: '',
  storage: '',
  imageUrl: '',
  screenshots: [],
};

const toArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
};

const AdminPanel = () => {
  const [games, setGames] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const formRef = useRef(null);

  useEffect(() => {
    fetchGames();
  }, []);

  const filteredGames = useMemo(
    () => games.filter((game) => game.title?.toLowerCase().includes(search.toLowerCase())),
    [games, search]
  );

  async function fetchGames() {
    try {
      const response = await gamesAPI.getAll();
      const data = response.data;
      const list =
        data?.data?.games ??
        data?.data ??
        data?.games ??
        (Array.isArray(data) ? data : []);
      setGames(list);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load games. Please refresh.');
    }
  }

  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm(EMPTY_FORM);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const toggleArray = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: current[field].includes(value)
        ? current[field].filter((item) => item !== value)
        : [...current[field], value],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.genre.length === 0 || form.platform.length === 0) {
      toast.error('Please select at least one genre and one platform.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...form,
        minRam: Number(form.minRam),
        minCpu: Number(form.minCpu),
        minGpu: Number(form.minGpu),
        storage: Number(form.storage),
        rating: form.rating ? Number(form.rating) : 0,
        Years: form.Years ? Number(form.Years) : undefined,
        imageUrl: form.imageUrl || undefined,
        screenshots: form.screenshots.filter(Boolean),
      };

      if (editId) {
        await gamesAPI.update(editId, payload);
        toast.success('Game updated successfully.');
      } else {
        await gamesAPI.add(payload);
        toast.success('Game added successfully.');
      }

      closeForm();
      fetchGames();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (game) => {
    setForm({
      ...EMPTY_FORM,
      ...game,
      Years: game.Years || game.year || '',
      genre: toArray(game.genre),
      platform: toArray(game.platform),
      screenshots: toArray(game.screenshots),
    });
    setEditId(game._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this game? This cannot be undone.')) return;
    try {
      await gamesAPI.delete(id);
      toast.success('Game deleted successfully.');
      fetchGames();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete game.');
    }
  };

  const addScreenshot = () =>
    setForm((current) => ({
      ...current,
      screenshots: [...current.screenshots, ''],
    }));

  const updateScreenshot = (index, value) =>
    setForm((current) => {
      const screenshots = [...current.screenshots];
      screenshots[index] = value;
      return { ...current, screenshots };
    });

  const removeScreenshot = (index) =>
    setForm((current) => ({
      ...current,
      screenshots: current.screenshots.filter((_, i) => i !== index),
    }));

  return (
    <div className="page-shell">
      <div className="page-container space-y-8">

        {/* Header */}
        <section className="section-card p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <span className="eyebrow">Admin workspace</span>
              <h1 className="page-subtitle mt-4">Manage the game catalog</h1>
              <p className="mt-4 max-w-[44rem] text-sm leading-7 text-slate-400 sm:text-base">
                Create, edit, and remove game entries from the catalog, then update the featured
                slider when you want to highlight releases or events on the home and browse pages.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <MetricCard label="Games in catalog" value={games.length} />
              <Link to="/admin/edit-slider" className="btn-ghost no-underline">
                Edit slider
              </Link>
              <button type="button" onClick={() => setShowForm(true)} className="btn-solid">
                Add game
              </button>
            </div>
          </div>
        </section>

        <GameSlider mode="compact" />

        {/* Search + metrics + table */}
        <section className="section-card p-5 sm:p-6">
          <div className="grid gap-5 xl:grid-cols-[minmax(320px,1fr)_minmax(0,1fr)] xl:items-end">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-200">
                Search catalog
              </span>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by title"
                className="field-control"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard label="Visible results" value={filteredGames.length} compact />
              <MetricCard label="Genres tracked" value={GENRES.length} compact />
              <MetricCard label="Platforms tracked" value={PLATFORMS.length} compact />
            </div>
          </div>

          {/* Mobile cards */}
          <div className="mt-6 grid gap-4 lg:hidden">
            {filteredGames.map((game) => (
              <article
                key={game._id}
                className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5"
              >
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="font-['Space_Grotesk'] text-xl font-semibold text-white">
                      {game.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {(toArray(game.genre).join(', ') || 'No genre set') +
                        ' | ' +
                        (toArray(game.platform).join(', ') || 'No platform set')}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => handleEdit(game)}
                      className="btn-ghost flex-1"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(game._id)}
                      className="rounded-full border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/15"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Desktop table */}
          <div className="mt-6 hidden overflow-x-auto lg:block">
            <table className="min-w-full table-auto border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.14em] text-slate-500">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Genre</th>
                  <th className="px-4 py-3">RAM</th>
                  <th className="px-4 py-3">CPU</th>
                  <th className="px-4 py-3">GPU</th>
                  <th className="px-4 py-3">Storage</th>
                  <th className="px-4 py-3">Platform</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGames.map((game) => (
                  <tr key={game._id}>
                    <td className="px-4 py-3 font-semibold text-white">{game.title}</td>
                    <td className="px-4 py-3 text-slate-400">{toArray(game.genre).join(', ')}</td>
                    <td className="px-4 py-3 text-slate-400">{game.minRam}GB</td>
                    <td className="px-4 py-3 text-slate-400">{game.minCpu}GHz</td>
                    <td className="px-4 py-3 text-slate-400">{game.minGpu}GB</td>
                    <td className="px-4 py-3 text-slate-400">{game.storage}GB</td>
                    <td className="px-4 py-3 text-slate-400">{toArray(game.platform).join(', ')}</td>
                    <td className="px-4 py-3 text-slate-400">{game.rating}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(game)}
                          className="btn-ghost"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(game._id)}
                          className="rounded-full border border-rose-400/25 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/15"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Add/Edit modal */}
        {showForm && (
          <div className="fixed inset-0 z-[1200] overflow-y-auto bg-[rgba(2,6,23,0.82)] p-4 backdrop-blur-sm">
            <div className="mx-auto max-w-6xl">
              <div className="section-card p-5 sm:p-6 lg:p-8" ref={formRef}>
                <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="eyebrow">Editor</span>
                    <h2 className="page-subtitle mt-4">
                      {editId ? 'Edit game entry' : 'Add new game'}
                    </h2>
                  </div>
                  <button type="button" onClick={closeForm} className="btn-ghost">
                    Close
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  {/* Basic info */}
                  <div className="grid gap-5 xl:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-200">
                        Game image URL
                      </span>
                      <input
                        type="text"
                        name="imageUrl"
                        value={form.imageUrl || ''}
                        onChange={handleChange}
                        className="field-control"
                        placeholder="https://example.com/cover.jpg"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-200">
                        Title
                      </span>
                      <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        className="field-control"
                        required
                      />
                    </label>

                    <label className="block xl:col-span-2">
                      <span className="mb-2 block text-sm font-semibold text-slate-200">
                        Description
                      </span>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        className="field-textarea"
                        placeholder="Write a short description for the game."
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-200">
                        Release year
                      </span>
                      <input
                        type="number"
                        name="Years"
                        value={form.Years}
                        onChange={handleChange}
                        className="field-control"
                        placeholder="2026"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-200">
                        Rating
                      </span>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        name="rating"
                        value={form.rating}
                        onChange={handleChange}
                        className="field-control"
                        placeholder="8.7"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-200">
                        Version
                      </span>
                      <input
                        type="text"
                        name="version"
                        value={form.version || ''}
                        onChange={handleChange}
                        className="field-control"
                        placeholder="1.0"
                      />
                    </label>
                  </div>

                  {/* Genres */}
                  <section>
                    <div className="text-sm font-semibold uppercase tracking-[0.12em] text-cyan-200">
                      Genres
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {GENRES.map((genre) => (
                        <SelectionChip
                          key={genre}
                          active={form.genre.includes(genre)}
                          onClick={() => toggleArray('genre', genre)}
                        >
                          {genre}
                        </SelectionChip>
                      ))}
                    </div>
                  </section>

                  {/* Platforms */}
                  <section>
                    <div className="text-sm font-semibold uppercase tracking-[0.12em] text-cyan-200">
                      Platforms
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {PLATFORMS.map((platform) => (
                        <SelectionChip
                          key={platform}
                          active={form.platform.includes(platform)}
                          onClick={() => toggleArray('platform', platform)}
                        >
                          {platform}
                        </SelectionChip>
                      ))}
                    </div>
                  </section>

                  {/* Min requirements */}
                  <section>
                    <div className="text-sm font-semibold uppercase tracking-[0.12em] text-cyan-200">
                      Minimum requirements
                    </div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      {[
                        { name: 'minRam', label: 'RAM', placeholder: '8' },
                        { name: 'minCpu', label: 'CPU', placeholder: '3.5' },
                        { name: 'minGpu', label: 'GPU', placeholder: '6' },
                        { name: 'storage', label: 'Storage', placeholder: '120' },
                      ].map((field) => (
                        <label key={field.name} className="block">
                          <span className="mb-2 block text-sm font-semibold text-slate-200">
                            {field.label}
                          </span>
                          <input
                            type="number"
                            name={field.name}
                            value={form[field.name]}
                            onChange={handleChange}
                            className="field-control"
                            placeholder={field.placeholder}
                            required
                          />
                        </label>
                      ))}
                    </div>
                  </section>

                  {/* Screenshots */}
                  <section>
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold uppercase tracking-[0.12em] text-cyan-200">
                        Screenshots
                      </div>
                      <button type="button" onClick={addScreenshot} className="btn-ghost">
                        Add screenshot
                      </button>
                    </div>

                    <div className="mt-4 grid gap-3">
                      {form.screenshots.length === 0 && (
                        <div className="rounded-[1.35rem] border border-dashed border-white/15 bg-white/5 px-4 py-4 text-sm text-slate-400">
                          Add screenshot URLs to enrich the detail page gallery.
                        </div>
                      )}
                      {form.screenshots.map((url, index) => (
                        <div
                          key={index}
                          className="grid gap-3 rounded-[1.35rem] border border-white/10 bg-white/5 p-4 sm:grid-cols-[minmax(0,1fr)_auto]"
                        >
                          <input
                            type="text"
                            value={url}
                            onChange={(event) => updateScreenshot(index, event.target.value)}
                            className="field-control"
                            placeholder={`Screenshot URL ${index + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => removeScreenshot(index)}
                            className="rounded-full border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/15"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
                    <button type="button" onClick={closeForm} className="btn-ghost">
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-solid disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {submitting
                        ? editId ? 'Updating game...' : 'Adding game...'
                        : editId ? 'Update game' : 'Add game'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

const MetricCard = ({ label, value, compact = false }) => (
  <div className={`rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-4 ${compact ? '' : 'min-w-[10rem]'}`}>
    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</div>
    <div className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-white">{value}</div>
  </div>
);

const SelectionChip = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
      active
        ? 'border-cyan-400/30 bg-cyan-400/10 text-white'
        : 'border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/20 hover:text-white'
    }`}
  >
    {children}
  </button>
);

export default AdminPanel;