import { useState, useEffect, type FormEvent } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function SEO() {
  const [form, setForm] = useState({ defaultTitle: '', defaultDesc: '', ogImageUrl: '', googleAnalyticsId: '', metaJson: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const { data } = await api.get('/seo');
      setForm({
        defaultTitle: data.defaultTitle || '',
        defaultDesc: data.defaultDesc || '',
        ogImageUrl: data.ogImageUrl || '',
        googleAnalyticsId: data.googleAnalyticsId || '',
        metaJson: data.metaJson || '',
      });
    } catch {
      toast.error('Failed to load SEO settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/seo', form);
      toast.success('SEO settings saved');
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
        <h1 className="text-2xl font-bold text-gray-900">SEO & Analytics Settings</h1>
        <p className="text-gray-500 mt-1">Default meta tags, Open Graph, and analytics configuration</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Default Title</label>
          <input type="text" value={form.defaultTitle} onChange={(e) => setForm({ ...form, defaultTitle: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="CLUKSTARS LIMITED | Sovereign Infrastructure" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Default Description</label>
          <textarea value={form.defaultDesc} onChange={(e) => setForm({ ...form, defaultDesc: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Empowering governments and enterprises..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
          <input type="url" value={form.ogImageUrl} onChange={(e) => setForm({ ...form, ogImageUrl: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="https://..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Google Analytics ID</label>
          <input type="text" value={form.googleAnalyticsId} onChange={(e) => setForm({ ...form, googleAnalyticsId: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="G-XXXXXXXXXX" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Additional Meta (JSON)</label>
          <textarea value={form.metaJson} onChange={(e) => setForm({ ...form, metaJson: e.target.value })} rows={6} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none font-mono text-sm" placeholder='{"robots":"index,follow"}' />
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
