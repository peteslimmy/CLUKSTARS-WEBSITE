import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, BarChart3 } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface Stat {
  id: string;
  number: string;
  symbol: string | null;
  label: string;
  italicText: string | null;
  explanationTitle: string | null;
  explanationText: string | null;
  highlights: string | null;
  sortOrder: number;
  isActive: boolean;
}

export default function HomepageStats() {
  const [items, setItems] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Stat | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ number: '', symbol: '', label: '', italicText: '', explanationTitle: '', explanationText: '', highlights: '', sortOrder: 0, isActive: true });

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    try {
      const { data } = await api.get('/homepage-stats');
      setItems(data);
    } catch { toast.error('Failed to load stats'); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ number: '', symbol: '', label: '', italicText: '', explanationTitle: '', explanationText: '', highlights: '', sortOrder: 0, isActive: true });
    setShowForm(true);
  };

  const openEdit = (item: Stat) => {
    setEditing(item);
    setForm({
      number: item.number, symbol: item.symbol || '', label: item.label, italicText: item.italicText || '',
      explanationTitle: item.explanationTitle || '', explanationText: item.explanationText || '', highlights: item.highlights || '',
      sortOrder: item.sortOrder, isActive: item.isActive,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      if (editing) { await api.put(`/homepage-stats/${editing.id}`, form); toast.success('Stat updated'); }
      else { await api.post('/homepage-stats', form); toast.success('Stat created'); }
      setShowForm(false); loadItems();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed to save'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    try { await api.delete(`/homepage-stats/${id}`); toast.success('Deleted'); loadItems(); }
    catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-gray-900">Homepage Stats</h1><p className="text-gray-500 mt-1">Stats popup cards</p></div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700"><Plus size={18} />Add Stat</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
          <h3 className="font-semibold text-gray-900">{editing ? 'Edit' : 'New'} Stat</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Number *</label><input type="text" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-teal-500" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label><input type="text" value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-teal-500" placeholder="+" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Label *</label><input type="text" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-teal-500" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Italic Text</label><input type="text" value={form.italicText} onChange={(e) => setForm({ ...form, italicText: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-teal-500" placeholder="years" /></div>
            <div className="flex gap-4 items-end"><div><label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label><input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-teal-500" /></div><label className="flex items-center gap-2 pb-2.5"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 text-teal-600" /><span className="text-sm text-gray-700">Active</span></label></div>
            <div className="md:col-span-3"><label className="block text-sm font-medium text-gray-700 mb-1">Explanation Title</label><input type="text" value={form.explanationTitle} onChange={(e) => setForm({ ...form, explanationTitle: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-teal-500" /></div>
            <div className="md:col-span-3"><label className="block text-sm font-medium text-gray-700 mb-1">Explanation Text</label><textarea value={form.explanationText} onChange={(e) => setForm({ ...form, explanationText: e.target.value })} rows={2} className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-teal-500" /></div>
            <div className="md:col-span-3"><label className="block text-sm font-medium text-gray-700 mb-1">Highlights (JSON array)</label><textarea value={form.highlights} onChange={(e) => setForm({ ...form, highlights: e.target.value })} rows={3} className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-teal-500 font-mono text-sm" placeholder='["Highlight 1", "Highlight 2"]' /></div>
          </div>
          <div className="flex justify-end gap-3"><button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button><button onClick={handleSave} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium">{editing ? 'Update' : 'Create'}</button></div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {items.length === 0 ? (<div className="p-12 text-center text-gray-500"><BarChart3 size={40} className="mx-auto mb-3 text-gray-300" /><p className="text-lg font-medium mb-1">No stats yet</p></div>) : (
          <table className="w-full"><thead className="bg-gray-50 border-b"><tr><th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Number</th><th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Label</th><th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Order</th><th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th><th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead><tbody className="divide-y divide-gray-100">{items.map((item) => (<tr key={item.id} className="hover:bg-gray-50"><td className="px-4 py-3"><p className="font-medium text-gray-900">{item.number}{item.symbol}</p></td><td className="px-4 py-3 text-sm text-gray-500">{item.label}</td><td className="px-4 py-3 text-sm text-gray-500">{item.sortOrder}</td><td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{item.isActive ? 'Active' : 'Inactive'}</span></td><td className="px-4 py-3 text-right"><div className="flex justify-end gap-2"><button onClick={() => openEdit(item)} className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg"><Pencil size={16} /></button><button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button></div></td></tr>))}</tbody></table>
        )}
      </div>
    </div>
  );
}