import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Shield } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface Permission {
  id: string;
  resource: string;
  action: string;
}

interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: Permission[];
  _count: { users: number };
}

const RESOURCES = ['organization', 'brand', 'social', 'users', 'roles', 'pages', 'blog', 'media', 'forms', 'seo', 'team', 'services', 'case-studies', 'homepage-stats', 'about-values', 'about-stats', 'global-blocks'];
const ACTIONS = ['list', 'read', 'create', 'update', 'delete'];

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [form, setForm] = useState<{ name: string; description: string; permissions: Record<string, string[]> }>({
    name: '',
    description: '',
    permissions: {},
  });

  useEffect(() => { loadRoles(); }, []);

  const loadRoles = async () => {
    try {
      const { data } = await api.get('/roles');
      setRoles(data);
    } catch { toast.error('Failed to load roles'); }
    finally { setLoading(false); }
  };

  const permsToRecord = (perms: Permission[]) => {
    const record: Record<string, string[]> = {};
    RESOURCES.forEach((r) => { record[r] = []; });
    perms.forEach((p) => {
      if (!record[p.resource]) record[p.resource] = [];
      record[p.resource].push(p.action);
    });
    return record;
  };

  const openCreate = () => {
    setEditing(null);
    const empty: Record<string, string[]> = {};
    RESOURCES.forEach((r) => { empty[r] = []; });
    setForm({ name: '', description: '', permissions: empty });
    setShowForm(true);
  };

  const openEdit = (role: Role) => {
    setEditing(role);
    setForm({ name: role.name, description: role.description || '', permissions: permsToRecord(role.permissions) });
    setShowForm(true);
  };

  const togglePermission = (resource: string, action: string) => {
    setForm((prev) => {
      const perms = { ...prev.permissions };
      const actions = [...(perms[resource] || [])];
      const idx = actions.indexOf(action);
      if (idx >= 0) actions.splice(idx, 1);
      else actions.push(action);
      perms[resource] = actions;
      return { ...prev, permissions: perms };
    });
  };

  const handleSave = async () => {
    const permissionsPayload = Object.entries(form.permissions).flatMap(([resource, actions]) =>
      actions.map((action) => ({ resource, action }))
    );
    try {
      if (editing) {
        await api.put(`/roles/${editing.id}`, { name: form.name, description: form.description, permissions: permissionsPayload });
        toast.success('Role updated');
      } else {
        await api.post('/roles', { name: form.name, description: form.description, permissions: permissionsPayload });
        toast.success('Role created');
      }
      setShowForm(false);
      loadRoles();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this role permanently?')) return;
    try {
      await api.delete(`/roles/${id}`);
      toast.success('Role deleted');
      loadRoles();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete');
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-gray-500 mt-1">Define user roles and access permissions</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors">
          <Plus size={18} />
          Add Role
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-6">
          <h3 className="font-semibold text-gray-900">{editing ? 'Edit Role' : 'New Role'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Permissions</h4>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600">Resource</th>
                    {ACTIONS.map((a) => <th key={a} className="text-center px-2 py-2.5 font-medium text-gray-600 uppercase text-xs">{a}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {RESOURCES.map((resource) => (
                    <tr key={resource} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-medium text-gray-700 capitalize">{resource.replace('_', ' ')}</td>
                      {ACTIONS.map((action) => (
                        <td key={action} className="text-center px-2 py-2.5">
                          <input
                            type="checkbox"
                            checked={(form.permissions[resource] || []).includes(action)}
                            onChange={() => togglePermission(resource, action)}
                            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">{editing ? 'Update' : 'Create'}</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <div key={role.id} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Shield size={18} className={role.isSystem ? 'text-amber-500' : 'text-teal-500'} />
                  <h3 className="font-semibold text-gray-900">{role.name}</h3>
                </div>
                {role.description && <p className="text-sm text-gray-500 mt-1">{role.description}</p>}
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>{role.permissions.length} permissions</span>
              <span>{role._count.users} user(s)</span>
            </div>
            {role.isSystem && <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">System Role</span>}
            {!role.isSystem && (
              <div className="flex gap-2 mt-2">
                <button onClick={() => openEdit(role)} className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><Pencil size={14} /> Edit</button>
                <button onClick={() => handleDelete(role.id)} className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /> Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
