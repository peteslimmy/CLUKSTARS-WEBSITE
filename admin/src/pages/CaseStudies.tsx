import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Briefcase } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface Study {
  id: string;
  title: string;
  slug: string;
  client: string | null;
  excerpt: string | null;
  content: string | null;
  coverImageUrl: string | null;
  result: string | null;
  tags: string | null;
  status: string;
  publishedAt: string | null;
  createdAt: string;
}

export default function CaseStudies() {
  const [items, setItems] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Study | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', slug: '', client: '', excerpt: '', content: '', coverImageUrl: '', result: '', sector: '', metrics: '', tags: '', status: 'DRAFT' });

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    try {
      const { data } = await api.get('/case-studies');
      setItems(data.items);
    } catch {
      toast.error('Failed to load case studies');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', slug: '', client: '', excerpt: '', content: '', coverImageUrl: '', result: '', sector: '', metrics: '', tags: '', status: 'DRAFT' });
    setShowForm(true);
  };

  const openEdit = (item: Study) => {
    setEditing(item);
    setForm({
      title: item.title,
      slug: item.slug,
      client: item.client || '',
      excerpt: item.excerpt || '',
      content: item.content || '',
      coverImageUrl: item.coverImageUrl || '',
      result: item.result || '',
      sector: item.sector || '',
      metrics: item.metrics || '',
      tags: item.tags || '',
      status: item.status,
    });
    setShowForm(true);
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await api.put(`/case-studies/${editing.id}`, form);
        toast.success('Case study updated');
      } else {
        await api.post('/case-studies', form);
        toast.success('Case study created');
      }
      setShowForm(false);
      loadItems();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this case study?')) return;
    try {
      await api.delete(`/case-studies/${id}`);
      toast.success('Case study deleted');
      loadItems();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PUBLISHED: 'bg-green-100 text-green-700',
      DRAFT: 'bg-yellow-100 text-yellow-700',
      ARCHIVED: 'bg-gray-100 text-gray-500',
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-500'}`}>{status}</span>;
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Case Studies</h1>
          <p className="text-gray-500 mt-1">Manage your case studies</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors">
          <Plus size={18} />
          New Case Study
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
          <h3 className="font-semibold text-gray-900">{editing ? 'Edit Case Study' : 'New Case Study'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: editing ? form.slug : generateSlug(e.target.value) })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
              <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <input type="text" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Ministry of Health" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
              <input type="text" value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Public Sector" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
              <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Healthcare, Zero-Trust" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
              <input type="url" value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="https://..." />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Result</label>
              <input type="text" value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Deployed 80+ nodes..." />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Metrics (JSON array of { val, label })</label>
              <textarea value={form.metrics} onChange={(e) => setForm({ ...form, metrics: e.target.value })} rows={2} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none font-mono text-sm" placeholder='[{"val":"80+","label":"Nodes Deployed"},...]' />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
              <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Brief summary..." />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Content (HTML)</label>
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={12} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none font-mono text-sm" placeholder="Full content..." />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">{editing ? 'Update' : 'Create'}</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {items.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Briefcase size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium mb-1">No case studies yet</p>
            <p className="text-sm">Click "New Case Study" to get started.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{item.title}</p>
                    {item.client && <p className="text-sm text-gray-500">{item.client}</p>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.client || '—'}</td>
                  <td className="px-4 py-3">{statusBadge(item.status)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(item)} className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"><Pencil size={16} /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
