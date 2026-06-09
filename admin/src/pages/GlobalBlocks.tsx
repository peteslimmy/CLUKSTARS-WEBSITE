import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Box } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface Block {
  id: string;
  name: string;
  type: string | null;
  content: string | null;
}

export default function GlobalBlocks() {
  const [items, setItems] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Block | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: '', content: '' });

  useEffect(() => { loadItems(); }, []);
  const loadItems = async () => { try { const { data } = await api.get('/global-blocks'); setItems(data); } catch { toast.error('Failed'); } finally { setLoading(false); } };
  const openCreate = () => { setEditing(null); setForm({ name: '', type: '', content: '' }); setShowForm(true); };
  const openEdit = (item: Block) => { setEditing(item); setForm({ name: item.name, type: item.type || '', content: item.content || '' }); setShowForm(true); };
  const handleSave = async () => { try { if (editing) { await api.put(`/global-blocks/${editing.id}`, form); toast.success('Updated'); } else { await api.post('/global-blocks', form); toast.success('Created'); } setShowForm(false); loadItems(); } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); } };
  const handleDelete = async (id: string) => { if (!confirm('Delete?')) return; try { await api.delete(`/global-blocks/${id}`); toast.success('Deleted'); loadItems(); } catch { toast.error('Failed'); } };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8"><div><h1 className="text-2xl font-bold text-gray-900">Global Blocks</h1><p className="text-gray-500 mt-1">Reusable content blocks (JSON)</p></div><button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700"><Plus size={18} />Add Block</button></div>
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
          <h3 className="font-semibold text-gray-900">{editing ? 'Edit' : 'New'} Block</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-teal-500" placeholder="technological-edge" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label><input type="text" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-teal-500" placeholder="custom" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Content (JSON)</label><textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-teal-500 font-mono text-sm" placeholder='[{"title":"...","desc":"..."}]' /></div>
          </div>
          <div className="flex justify-end gap-3"><button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button><button onClick={handleSave} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium">{editing ? 'Update' : 'Create'}</button></div>
        </div>
      )}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {items.length === 0 ? (<div className="p-12 text-center text-gray-500"><Box size={40} className="mx-auto mb-3 text-gray-300" /><p className="text-lg font-medium mb-1">No blocks yet</p></div>) : (
          <table className="w-full"><thead className="bg-gray-50 border-b"><tr><th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th><th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Type</th><th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Content</th><th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead><tbody className="divide-y divide-gray-100">{items.map((item) => (<tr key={item.id} className="hover:bg-gray-50"><td className="px-4 py-3"><p className="font-medium text-gray-900">{item.name}</p></td><td className="px-4 py-3 text-sm text-gray-500">{item.type || 'custom'}</td><td className="px-4 py-3 text-xs text-gray-500 font-mono truncate max-w-md">{item.content ? item.content.substring(0, 80) + '...' : '—'}</td><td className="px-4 py-3 text-right"><div className="flex justify-end gap-2"><button onClick={() => openEdit(item)} className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg"><Pencil size={16} /></button><button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button></div></td></tr>))}</tbody></table>
        )}
      </div>
    </div>
  );
}