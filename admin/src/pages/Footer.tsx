import { useState, useEffect, FormEvent } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function Footer() {
  const [form, setForm] = useState({ columns: '', copyright: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const { data } = await api.get('/footer');
      setForm({
        columns: data.columns || '[]',
        copyright: data.copyright || '© {year} CLUKSTARS Limited',
      });
    } catch {
      toast.error('Failed to load footer settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/footer', form);
      toast.success('Footer settings saved');
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
        <h1 className="text-2xl font-bold text-gray-900">Footer Settings</h1>
        <p className="text-gray-500 mt-1">Configure the footer columns and copyright text</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Copyright</label>
          <input type="text" value={form.copyright} onChange={(e) => setForm({ ...form, copyright: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="© {year} CLUKSTARS Limited" />
          <p className="text-xs text-gray-400 mt-1">Use `{'{'}year{'}'}` as a placeholder for the current year.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Columns (JSON)</label>
          <textarea value={form.columns} onChange={(e) => setForm({ ...form, columns: e.target.value })} rows={14} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none font-mono text-sm" placeholder='[{"title":"Services","links":[{"label":"Public Sector","href":"/services"}]}]' />
          <p className="text-xs text-gray-400 mt-1">Array of column objects with `title` and `links` array.</p>
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
