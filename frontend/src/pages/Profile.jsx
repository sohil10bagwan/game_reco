import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/Authcontext.jsx';
import { authAPI } from '../services/api.js';

const Profile = () => {
  const { user, logout, syncSession } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    });
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.updateProfile(formData);
      const updatedUser = response.data?.data;

      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        syncSession();
        toast.success('Profile updated successfully.');
        setIsEditing(false);
      }
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to update profile.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    if (!window.confirm('Are you sure you want to log out?')) {
      return;
    }

    logout();
    toast.success('Logged out successfully.');
    navigate('/');
  };

  return (
    <div className="page-shell">
      <div className="page-container space-y-6">
        <section className="section-card p-6 sm:p-8 lg:p-10">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)] xl:items-center">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[2rem] border border-cyan-400/20 bg-cyan-400/10 font-['Space_Grotesk'] text-4xl font-semibold text-cyan-100 shadow-[0_18px_40px_rgba(34,211,238,0.14)]">
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>

              <div>
                <span className="eyebrow">Profile hub</span>
                <h1 className="page-subtitle mt-4">{user?.name || 'Player profile'}</h1>
                <p className="mt-3 text-sm leading-7 text-slate-400 sm:text-base">
                  Manage your account details, review your role, and keep your
                  player information ready for recommendations and admin access.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {[
                { label: 'Email', value: user?.email || 'Not set' },
                {
                  label: 'Role',
                  value: user?.role === 'admin' ? 'Administrator' : 'Player',
                },
                {
                  label: 'Member since',
                  value: formatDate(user?.createdAt),
                },
                { label: 'Status', value: 'Active account' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-4"
                >
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    {item.label}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-white sm:text-base">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div className="section-card p-6 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="eyebrow">Account details</span>
                <h2 className="page-subtitle mt-4">
                  {isEditing ? 'Edit your profile' : 'Current account information'}
                </h2>
              </div>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="btn-ghost self-start sm:self-auto"
                >
                  Edit profile
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-200">
                    Full name
                  </span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="field-control"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-200">
                    Email
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="field-control"
                    required
                  />
                </label>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-solid flex-1 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? 'Saving...' : 'Save changes'}
                  </button>
                  <button type="button" onClick={handleCancel} className="btn-ghost flex-1">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-8 space-y-4">
                <InfoRow label="Full name" value={user?.name || 'Not provided'} />
                <InfoRow label="Email address" value={user?.email || 'Not provided'} />
                <InfoRow label="User ID" value={user?._id || 'Unavailable'} />
                <InfoRow
                  label="Account role"
                  value={user?.role === 'admin' ? 'Administrator' : 'Player'}
                />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <section className="section-card p-6">
              <span className="eyebrow">Account health</span>
              <div className="mt-5 space-y-3">
                {[
                  'Profile data syncs back into the shared auth context after edits.',
                  'The layout keeps actions separated from sensitive account controls.',
                  'Responsive cards preserve readability on smaller devices without hiding detail.',
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-7 text-slate-300"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section className="section-card border-rose-400/20 bg-[linear-gradient(180deg,rgba(59,7,20,0.75)_0%,rgba(9,15,31,0.92)_100%)] p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-200">
                Sensitive actions
              </div>
              <h2 className="mt-4 font-['Space_Grotesk'] text-2xl font-semibold text-white">
                Manage account access
              </h2>
              <p className="mt-3 text-sm leading-7 text-rose-100/80">
                Logging out is available right away. Permanent account deletion
                is not implemented in this project yet, so the control stays out
                of the active flow to avoid confusion.
              </p>

              <button type="button" onClick={handleLogout} className="btn-solid mt-6 w-full">
                Logout
              </button>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-4">
    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
      {label}
    </div>
    <div className="mt-2 text-sm leading-7 text-white sm:text-base">{value}</div>
  </div>
);

const formatDate = (dateString) => {
  if (!dateString) {
    return 'Unavailable';
  }

  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default Profile;
