import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Layers } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface Feature {
  id: string;
  label: string;
  sortOrder: number;
}

interface Service {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  imageUrl: string | null;
  categoryId: string | null;
  sortOrder: number;
  isActive: boolean;
  features: Feature[];
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  services: Service[];
}

export default function ServicesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [catEditing, setCatEditing] = useState<Category | null>(null);
  const [showCatForm, setShowCatForm] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', description: '', icon: '', sortOrder: 0, isActive: true });

  const [svcEditing, setSvcEditing] = useState<Service | null>(null);
  const [showSvcForm, setShowSvcForm] = useState(false);
  const [svcForm, setSvcForm] = useState({ title: '', description: '', icon: '', imageUrl: '', categoryId: '', sortOrder: 0, isActive: true, features: '' });

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    try {
      const { data } = await api.get('/services/categories');
      setCategories(data);
    } catch {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const openCatCreate = () => {
    setCatEditing(null);
    setCatForm({ name: '', description: '', icon: '', sortOrder: 0, isActive: true });
    setShowCatForm(true);
  };

  const openCatEdit = (item: Category) => {
    setCatEditing(item);
    setCatForm({ name: item.name, description: item.description || '', icon: item.icon || '', sortOrder: item.sortOrder, isActive: item.isActive });
    setShowCatForm(true);
  };

  const saveCategory = async () => {
    try {
      if (catEditing) {
        await api.put(`/services/categories/${catEditing.id}`, catForm);
        toast.success('Category updated');
      } else {
        await api.post('/services/categories', catForm);
        toast.success('Category created');
      }
      setShowCatForm(false);
      loadCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save category');
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete this category and all its services?')) return;
    try {
      await api.delete(`/services/categories/${id}`);
      toast.success('Category deleted');
      loadCategories();
    } catch {
      toast.error('Failed to delete category');
    }
  };

  const openSvcCreate = (categoryId?: string) => {
    setSvcEditing(null);
    setSvcForm({ title: '', description: '', icon: '', imageUrl: '', categoryId: categoryId || '', sortOrder: 0, isActive: true, features: '' });
    setShowSvcForm(true);
  };

  const openSvcEdit = (item: Service) => {
    setSvcEditing(item);
    setSvcForm({
      title: item.title,
      description: item.description || '',
      icon: item.icon || '',
      imageUrl: item.imageUrl || '',
      categoryId: item.categoryId || '',
      sortOrder: item.sortOrder,
      isActive: item.isActive,
      features: item.features.map((f) => f.label).join(', '),
    });
    setShowSvcForm(true);
  };

  const saveService = async () => {
    const payload = {
      ...svcForm,
      features: svcForm.features.split(',').map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (svcEditing) {
        await api.put(`/services/${svcEditing.id}`, payload);
        toast.success('Service updated');
      } else {
        await api.post('/services', payload);
        toast.success('Service created');
      }
      setShowSvcForm(false);
      loadCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save service');
    }
  };

  const deleteService = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    try {
      await api.delete(`/services/${id}`);
      toast.success('Service deleted');
      loadCategories();
    } catch {
      toast.error('Failed to delete service');
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-500 mt-1">Manage service categories and services</p>
        </div>
      </div>

      {/* Category Form */}
      {showCatForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
          <h3 className="font-semibold text-gray-900">{catEditing ? 'Edit Category' : 'New Category'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input type="text" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
              <input type="text" value={catForm.icon} onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Monitor" />
            </div>
            <div className="flex gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input type="number" value={catForm.sortOrder} onChange={(e) => setCatForm({ ...catForm, sortOrder: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <label className="flex items-center gap-2 pb-2.5">
                <input type="checkbox" checked={catForm.isActive} onChange={(e) => setCatForm({ ...catForm, isActive: e.target.checked })} className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} rows={2} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowCatForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
            <button onClick={saveCategory} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">{catEditing ? 'Update' : 'Create'}</button>
          </div>
        </div>
      )}

      {/* Service Form */}
      {showSvcForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
          <h3 className="font-semibold text-gray-900">{svcEditing ? 'Edit Service' : 'New Service'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" value={svcForm.title} onChange={(e) => setSvcForm({ ...svcForm, title: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={svcForm.categoryId} onChange={(e) => setSvcForm({ ...svcForm, categoryId: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
                <option value="">None</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
              <input type="text" value={svcForm.icon} onChange={(e) => setSvcForm({ ...svcForm, icon: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input type="url" value={svcForm.imageUrl} onChange={(e) => setSvcForm({ ...svcForm, imageUrl: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div className="flex gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input type="number" value={svcForm.sortOrder} onChange={(e) => setSvcForm({ ...svcForm, sortOrder: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <label className="flex items-center gap-2 pb-2.5">
                <input type="checkbox" checked={svcForm.isActive} onChange={(e) => setSvcForm({ ...svcForm, isActive: e.target.checked })} className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Features (comma separated)</label>
              <input type="text" value={svcForm.features} onChange={(e) => setSvcForm({ ...svcForm, features: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="E-Governance, Revenue Assurance, Digital ID" />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={svcForm.description} onChange={(e) => setSvcForm({ ...svcForm, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowSvcForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
            <button onClick={saveService} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">{svcEditing ? 'Update' : 'Create'}</button>
          </div>
        </div>
      )}

      {/* Categories & Services Display */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
          <button onClick={openCatCreate} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
            <Plus size={16} />
            Add Category
          </button>
        </div>

        {categories.length === 0 ? (
          <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
            <Layers size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium mb-1">No categories yet</p>
            <p className="text-sm">Add a category to organize your services.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                    {cat.icon && <span className="text-xs text-gray-400">({cat.icon})</span>}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openSvcCreate(cat.id)} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Add service"><Plus size={16} /></button>
                    <button onClick={() => openCatEdit(cat)} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Edit category"><Pencil size={16} /></button>
                    <button onClick={() => deleteCategory(cat.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete category"><Trash2 size={16} /></button>
                  </div>
                </div>

                {cat.services.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Features</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="text-right px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {cat.services.map((svc) => (
                        <tr key={svc.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2.5">
                            <p className="font-medium text-gray-900 text-sm">{svc.title}</p>
                          </td>
                          <td className="px-4 py-2.5 text-xs text-gray-500">
                            {svc.features.map((f) => f.label).join(', ') || '—'}
                          </td>
                          <td className="px-4 py-2.5 text-xs text-gray-500">{svc.sortOrder}</td>
                          <td className="px-4 py-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${svc.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {svc.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => openSvcEdit(svc)} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                              <button onClick={() => deleteService(svc.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-6 text-center text-sm text-gray-400">
                    No services in this category.
                    <button onClick={() => openSvcCreate(cat.id)} className="ml-2 text-teal-600 hover:underline">Add one</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
