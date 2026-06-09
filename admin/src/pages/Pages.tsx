import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface Page {
  id: string;
  title: string;
  slug: string;
  status: string;
  template: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function Pages() {
  const { user, hasPermission } = useAuth();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [canCreate, setCanCreate] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    setCanCreate(hasPermission('pages', 'create'));
    setCanEdit(hasPermission('pages', 'update'));
    setCanDelete(hasPermission('pages', 'delete'));
    fetchPages();
  }, [user]);

  async function fetchPages() {
    try {
      const res = await fetch('/api/pages', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPages(data);
      } else {
        toast.error('Failed to load pages');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this page? This will also delete all sections and blocks.')) return;
    try {
      const res = await fetch(`/api/pages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      if (res.ok) {
        toast.success('Page deleted');
        fetchPages();
      } else {
        toast.error('Failed to delete');
      }
    } catch (err) {
      toast.error('Network error');
    }
  }

  if (loading) return <div className="py-8 text-center">Loading pages...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
        {canCreate && (
          <Link to="/pages/new" className="btn-primary">
            New Page
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Published</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pages.map((page) => (
              <tr key={page.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{page.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">/{page.slug}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    page.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {page.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{page.template}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {page.publishedAt ? new Date(page.publishedAt).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {canEdit && (
                    <>
                      <Link to={`/pages/${page.id}/builder`} className="text-indigo-600 hover:text-indigo-900 mr-3">
                        Edit
                      </Link>
                      <Link to={`/pages/${page.id}/edit`} className="text-blue-600 hover:text-blue-900 mr-3">
                        Settings
                      </Link>
                    </>
                  )}
                  {canDelete && (
                    <button onClick={() => handleDelete(page.id)} className="text-red-600 hover:text-red-900">
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {pages.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No pages yet. Create your first page!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}