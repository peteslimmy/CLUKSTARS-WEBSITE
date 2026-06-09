import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  label: string | null;
  icon: string | null;
  sortOrder: number;
}

const platformOptions = [
  'LinkedIn', 'Twitter', 'Facebook', 'Instagram', 'YouTube', 'GitHub',
  'Dribbble', 'Behance', 'Medium', 'TikTok', 'WhatsApp', 'Telegram',
];

export default function SocialLinks() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SocialLink | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ platform: '', url: '', label: '', icon: '' });

  useEffect(() => { loadLinks(); }, []);

  const loadLinks = async () => {
    try {
      const { data } = await api.get('/social-links');
      setLinks(data);
    } catch {
      toast.error('Failed to load social links');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ platform: '', url: '', label: '', icon: '' });
    setShowForm(true);
  };

  const openEdit = (link: SocialLink) => {
    setEditing(link);
    setForm({ platform: link.platform, url: link.url, label: link.label || '', icon: link.icon || '' });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await api.put(`/social-links/${editing.id}`, form);
        toast.success('Link updated');
      } else {
        await api.post('/social-links', form);
        toast.success('Link created');
      }
      setShowForm(false);
      loadLinks();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this social link?')) return;
    try {
      await api.delete(`/social-links/${id}`);
      toast.success('Link deleted');
      loadLinks();
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Social Links</h1>
          <p className="text-gray-500 mt-1">Manage your social media presence</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
        >
          <Plus size={18} />
          Add Link
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
          <h3 className="font-semibold text-gray-900">{editing ? 'Edit Link' : 'New Link'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform *</label>
              <select
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                required
              >
                <option value="">Select platform</option>
                {platformOptions.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL *</label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="https://..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="Follow us on..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon (optional)</label>
              <input
                type="text"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="Icon name or URL"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
              {editing ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200">
        {links.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg font-medium mb-1">No social links yet</p>
            <p className="text-sm">Click "Add Link" to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {links.map((link) => (
              <div key={link.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                <GripVertical size={18} className="text-gray-300 cursor-move" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{link.platform}</p>
                  <p className="text-sm text-gray-500 truncate">{link.url}</p>
                </div>
                {link.label && <span className="text-sm text-gray-400 hidden sm:block">{link.label}</span>}
                <div className="flex gap-2">
                  <button onClick={() => openEdit(link)} className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(link.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
