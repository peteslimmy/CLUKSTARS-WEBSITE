import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: string;
  twoFactorEnabled: boolean;
  role: { id: string; name: string } | null;
  createdAt: string;
}

interface Role {
  id: string;
  name: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', roleId: '', status: 'ACTIVE' });

  useEffect(() => {
    Promise.all([loadUsers(), loadRoles()]);
  }, []);

  const loadUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const loadRoles = async () => {
    try {
      const { data } = await api.get('/roles');
      setRoles(data);
    } catch { /* ignore */ }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ email: '', password: '', firstName: '', lastName: '', roleId: '', status: 'ACTIVE' });
    setShowForm(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    setForm({ email: user.email, password: '', firstName: user.firstName || '', lastName: user.lastName || '', roleId: user.role?.id || '', status: user.status });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        const payload: any = { email: form.email, firstName: form.firstName, lastName: form.lastName, roleId: form.roleId || undefined, status: form.status };
        if (form.password) payload.password = form.password;
        await api.put(`/users/${editing.id}`, payload);
        toast.success('User updated');
      } else {
        await api.post('/users', { ...form, roleId: form.roleId || undefined });
        toast.success('User created');
      }
      setShowForm(false);
      loadUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user permanently?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted');
      loadUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete');
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-700',
      INACTIVE: 'bg-gray-100 text-gray-600',
      SUSPENDED: 'bg-red-100 text-red-700',
    };
    return <span className={`text-xs px-2 py-1 rounded-full font-medium ${styles[status] || styles.INACTIVE}`}>{status}</span>;
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1">Manage system users and their roles</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors">
          <Plus size={18} />
          Add User
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
          <h3 className="font-semibold text-gray-900">{editing ? 'Edit User' : 'New User'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password {editing && '(leave blank to keep)'}</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder={editing ? 'Leave blank to keep' : 'Min 8 chars'} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
                <option value="">No role</option>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">{editing ? 'Update' : 'Create'}</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">2FA</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{user.role?.name || '—'}</td>
                <td className="px-4 py-3">{statusBadge(user.status)}</td>
                <td className="px-4 py-3 text-sm">{user.twoFactorEnabled ? <span className="text-green-600 font-medium">Enabled</span> : <span className="text-gray-400">Off</span>}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(user)} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"><Pencil size={15} /></button>
                    <button onClick={() => handleDelete(user.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <div className="p-12 text-center text-gray-500">No users found</div>}
      </div>
    </div>
  );
}
