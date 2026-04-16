import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import SliderCard from '../components/Slidercard.jsx';
import { sliderAPI } from '../services/api.js';

const INITIAL_FORM = {
  title: '',
  version: '',
  platform: '',
  type: '',
  year: '',
  description: '',
  image: '',
  bg: 'linear-gradient(135deg, rgba(13,27,42,0.95) 0%, rgba(27,40,56,0.92) 42%, rgba(42,63,95,0.9) 100%)',
  accent: '#22d3ee',
  isActive: true,
};

const EditSlider = () => {
  const navigate = useNavigate();
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      setLoading(true);
      const response = await sliderAPI.getAll();
      setSliders(response.data?.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch sliders.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
  };

  const handleEdit = (slider) => {
    setEditingId(slider._id);
    setFormData({
      title: slider.title || '',
      version: slider.version || '',
      platform: slider.platform || '',
      type: slider.type || '',
      year: slider.year || '',
      description: slider.description || '',
      image: slider.imageUrl || slider.image || '',
      bg: slider.bg || INITIAL_FORM.bg,
      accent: slider.accent || INITIAL_FORM.accent,
      isActive: slider.isActive !== undefined ? slider.isActive : true,
    });
  };

  const handleAddNew = () => {
    setEditingId('new');
    setFormData(INITIAL_FORM);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required.');
      return;
    }

    if (!formData.image.trim()) {
      toast.error('Image URL is required.');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Description is required.');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...formData,
        imageUrl: formData.image,
        isActive: formData.isActive,
      };

      delete payload.image;

      if (editingId === 'new') {
        await sliderAPI.add(payload);
        toast.success('Slider added successfully.');
      } else {
        await sliderAPI.update(editingId, payload);
        toast.success('Slider updated successfully.');
      }

      closeModal();
      fetchSliders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save slider.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id) => {
    const slider = sliders.find((item) => item._id === id);

    if (!slider) {
      return;
    }

    try {
      await sliderAPI.update(id, { ...slider, isActive: !slider.isActive });
      toast.success(`Slider ${!slider.isActive ? 'activated' : 'deactivated'}.`);
      fetchSliders();
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to change slider status.'
      );
    }
  };

  const handleDelete = async (id) => {
    const slider = sliders.find((item) => item._id === id);

    if (
      !window.confirm(
        `Delete "${slider?.title || 'this slider'}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await sliderAPI.delete(id);
      toast.success('Slider deleted successfully.');
      fetchSliders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete slider.');
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container space-y-8">
        <section className="section-card p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <span className="eyebrow">Hero slider</span>
              <h1 className="page-subtitle mt-4">Manage featured slides</h1>
              <p className="mt-4 max-w-[42rem] text-sm leading-7 text-slate-400 sm:text-base">
                Create the carousel content that powers the most prominent
                surfaces in the app. The editor now scales between mobile,
                tablet, and desktop without collapsing the preview.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => navigate('/adminpanel')} className="btn-ghost">
                Back to admin
              </button>
              <button type="button" onClick={handleAddNew} className="btn-solid">
                Add new slider
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="Total sliders" value={sliders.length} />
          <MetricCard
            label="Active sliders"
            value={sliders.filter((slider) => slider.isActive !== false).length}
          />
          <MetricCard
            label="Inactive sliders"
            value={sliders.filter((slider) => slider.isActive === false).length}
          />
        </section>

        {loading ? (
          <div className="section-card flex min-h-[18rem] items-center justify-center p-8 text-center">
            <div className="space-y-3">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-cyan-300" />
              <p className="text-sm leading-6 text-slate-400 sm:text-base">
                Loading slider collection.
              </p>
            </div>
          </div>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sliders.map((slider) => (
              <SliderCard
                key={slider._id}
                slider={slider}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
              />
            ))}
          </section>
        )}

        {editingId && (
          <div className="fixed inset-0 z-[1200] overflow-y-auto bg-[rgba(2,6,23,0.82)] p-4 backdrop-blur-sm">
            <div className="mx-auto max-w-5xl">
              <div className="section-card p-5 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="eyebrow">Slider editor</span>
                    <h2 className="page-subtitle mt-4">
                      {editingId === 'new' ? 'Add new slide' : 'Edit slide'}
                    </h2>
                  </div>
                  <button type="button" onClick={closeModal} className="btn-ghost">
                    Close
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  <section className="section-card--soft overflow-hidden p-5 sm:p-6">
                    <div className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">
                      Live preview
                    </div>
                    <div
                      className="relative mt-4 overflow-hidden rounded-[1.6rem] border border-white/10"
                      style={{ background: formData.bg }}
                    >
                      {formData.image && (
                        <img
                          src={formData.image}
                          alt="Slider preview"
                          className="h-[280px] w-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(3,7,18,0.94)_0%,rgba(3,7,18,0.78)_55%,rgba(3,7,18,0.38)_100%)]" />
                      <div className="relative z-10 flex min-h-[280px] flex-col justify-end gap-4 p-6">
                        <div className="flex flex-wrap gap-2">
                          {[
                            formData.version,
                            formData.platform,
                            formData.type,
                            formData.year,
                          ]
                            .filter(Boolean)
                            .map((item) => (
                              <span
                                key={item}
                                className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-[0.76rem] font-semibold uppercase tracking-[0.08em] text-white/90"
                              >
                                {item}
                              </span>
                            ))}
                        </div>
                        <div className="max-w-[36rem]">
                          <h3 className="font-['Space_Grotesk'] text-3xl font-semibold text-white">
                            {formData.title || 'Untitled slider'}
                          </h3>
                          <p className="mt-3 text-sm leading-7 text-slate-200/85 sm:text-base">
                            {formData.description ||
                              'Add descriptive copy to shape the tone of the hero carousel.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <div className="grid gap-5 xl:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-200">
                        Title
                      </span>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="field-control"
                        required
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-200">
                        Image URL
                      </span>
                      <input
                        type="url"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        className="field-control"
                        placeholder="https://example.com/image.jpg"
                        required
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-200">
                        Version
                      </span>
                      <input
                        type="text"
                        name="version"
                        value={formData.version}
                        onChange={handleChange}
                        className="field-control"
                        placeholder="Version 1.0"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-200">
                        Platform
                      </span>
                      <input
                        type="text"
                        name="platform"
                        value={formData.platform}
                        onChange={handleChange}
                        className="field-control"
                        placeholder="PC"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-200">
                        Type
                      </span>
                      <input
                        type="text"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="field-control"
                        placeholder="Featured"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-200">
                        Year
                      </span>
                      <input
                        type="text"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="field-control"
                        placeholder="2026"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-200">
                        Accent color
                      </span>
                      <div className="flex items-center gap-3 rounded-[1rem] border border-white/10 bg-black/20 px-3 py-3">
                        <input
                          type="color"
                          name="accent"
                          value={formData.accent}
                          onChange={handleChange}
                          className="h-10 w-16 rounded border-0 bg-transparent"
                        />
                        <span className="text-sm font-semibold text-slate-300">
                          {formData.accent}
                        </span>
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-200">
                        Background gradient
                      </span>
                      <textarea
                        name="bg"
                        value={formData.bg}
                        onChange={handleChange}
                        className="field-textarea"
                        rows="4"
                        placeholder="linear-gradient(...)"
                      ></textarea>
                    </label>

                    <label className="block xl:col-span-2">
                      <span className="mb-2 block text-sm font-semibold text-slate-200">
                        Description
                      </span>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="field-textarea"
                        rows="4"
                        placeholder="Describe this feature slide."
                        required
                      ></textarea>
                    </label>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((current) => ({
                          ...current,
                          isActive: !current.isActive,
                        }))
                      }
                      className={`rounded-full border px-4 py-3 text-sm font-semibold transition ${
                        formData.isActive
                          ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/15'
                          : 'border-rose-400/30 bg-rose-400/10 text-rose-100 hover:bg-rose-400/15'
                      }`}
                    >
                      {formData.isActive ? 'Set inactive' : 'Set active'}
                    </button>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button type="button" onClick={closeModal} className="btn-ghost">
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="btn-solid disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {saving
                          ? editingId === 'new'
                            ? 'Adding slider...'
                            : 'Updating slider...'
                          : editingId === 'new'
                          ? 'Add slider'
                          : 'Update slider'}
                      </button>
                    </div>
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

const MetricCard = ({ label, value }) => (
  <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-4">
    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
      {label}
    </div>
    <div className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-white">
      {value}
    </div>
  </div>
);

export default EditSlider;
