import { useState, useEffect, FormEvent } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function Navbar() {
  const [form, setForm] = useState({ links: '', style: 'default' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const { data } = await api.get('/navbar');
      setForm({
        links: data.links || '[{"label":"Home","href":"/"},{"label":"About","href":"/about"}]',
        style: data.style || 'default',
      });
    } catch {
      toast.error('Failed to load navbar settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/navbar', form);
      toast.success('Navbar settings saved');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Navbar Settings</h1>
        <p className="text-gray-500 mt-1">Configure the navigation bar links and style</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
          <select value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
            <option value="default">Default</option>
            <option value="transparent">Transparent</option>
            <option value="colored">Colored</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Links (JSON array)</label>
          <textarea value={form.links} onChange={(e) => setForm({ ...form, links: e.target.value })} rows={12} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none font-mono text-sm" placeholder='[{"label":"Home","href":"/"}]' />
          <p className="text-xs text-gray-400 mt-1">Array of objects with `label`, `href`, and optional `children` fields.</p>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
