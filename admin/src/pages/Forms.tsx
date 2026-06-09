import { useState, useEffect, useMemo } from 'react';
import { Eye, Trash2, Mail, Check, Reply, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface Submission {
  id: string;
  formType: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  data: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ParsedData {
  organization?: string;
  subject?: string;
  [key: string]: string | undefined;
}

const STATUS_OPTIONS = ['ALL', 'UNREAD', 'READ', 'REPLIED', 'SPAM'] as const;
const PAGE_SIZE = 20;

export default function Forms() {
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [replyModal, setReplyModal] = useState<Submission | null>(null);

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    try {
      const { data } = await api.get('/forms', { params: { limit: 100 } });
      setItems(data.items);
    } catch {
      toast.error('Failed to load form submissions');
    } finally {
      setLoading(false);
    }
  };

  const markAs = async (id: string, status: string) => {
    try {
      await api.put(`/forms/${id}`, { status });
      toast.success(`Marked as ${status.toLowerCase()}`);
      loadItems();
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this submission?')) return;
    try {
      await api.delete(`/forms/${id}`);
      toast.success('Submission deleted');
      if (selected?.id === id) setSelected(null);
      loadItems();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const parseData = (raw: string | null): ParsedData | null => {
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  };

  const filtered = useMemo(() => {
    let result = items;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(s => (s.name?.toLowerCase() || '').includes(q) || (s.email?.toLowerCase() || '').includes(q));
    }
    if (statusFilter !== 'ALL') {
      result = result.filter(s => s.status === statusFilter);
    }
    return result;
  }, [items, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      UNREAD: 'bg-blue-100 text-blue-700',
      READ: 'bg-gray-100 text-gray-600',
      REPLIED: 'bg-green-100 text-green-700',
      SPAM: 'bg-red-100 text-red-700',
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-500'}`}>{status}</span>;
  };

  const ReplyModal = () => {
    if (!replyModal) return null;
    const parsed = parseData(replyModal.data);
    const subject = parsed?.subject || 'Contact Form Inquiry';
    const name = replyModal.name || 'there';
    const body = `Hi ${name},

Thank you for reaching out.

Regarding your inquiry: ${subject}

Best regards,
CLUKSTARS Team`;
    const mailto = `mailto:${replyModal.email}?subject=${encodeURIComponent(`Re: ${subject}`)}&body=${encodeURIComponent(body)}`;

    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setReplyModal(null)}>
        <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Reply to {replyModal.name || replyModal.email}</h3>
            <button onClick={() => setReplyModal(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1 text-gray-600">
            <p><span className="text-gray-400 font-medium">To:</span> {replyModal.email}</p>
            <p><span className="text-gray-400 font-medium">Subject:</span> Re: {subject}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1 font-medium">Reply Body</label>
            <textarea readOnly rows={6} value={body} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 resize-none font-sans" />
          </div>
          <p className="text-xs text-gray-400">This will open your default email client with the pre-filled message above.</p>
          <a
            href={mailto}
            onClick={() => { markAs(replyModal.id, 'REPLIED'); setReplyModal(null); }}
            className="block w-full text-center px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            <Reply size={16} className="inline mr-1.5" /> Open in Mail Client
          </a>
        </div>
      </div>
    );
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Form Submissions</h1>
          <p className="text-gray-500 mt-1">Review incoming contact form entries</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white"
        >
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s.charAt(0) + s.slice(1).toLowerCase()}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
            {paginated.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Mail size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No submissions found</p>
              </div>
            ) : (
              paginated.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selected?.id === item.id ? 'bg-teal-50 border-l-2 border-teal-500' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-gray-900 truncate">{item.name || item.email || 'Anonymous'}</span>
                    {statusBadge(item.status)}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{item.email || ''}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>
                </button>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Submission Details</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setReplyModal(selected)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                  >
                    <Reply size={14} /> Reply
                  </button>
                  {selected.status === 'UNREAD' && (
                    <button onClick={() => markAs(selected.id, 'READ')} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"><Eye size={14} /> Mark Read</button>
                  )}
                  {selected.status === 'READ' && (
                    <button onClick={() => markAs(selected.id, 'REPLIED')} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100"><Check size={14} /> Mark Replied</button>
                  )}
                  <button onClick={() => markAs(selected.id, 'SPAM')} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100">Spam</button>
                  <button onClick={() => handleDelete(selected.id)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /> Delete</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 text-xs block">Form Type</span>
                  <span className="font-medium capitalize">{selected.formType}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block">Status</span>
                  <span>{statusBadge(selected.status)}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block">Name</span>
                  <span className="font-medium">{selected.name || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block">Email</span>
                  {selected.email ? (
                    <a href={`mailto:${selected.email}`} className="font-medium text-teal-600 hover:underline">{selected.email}</a>
                  ) : (
                    <span className="font-medium">—</span>
                  )}
                </div>
                <div>
                  <span className="text-gray-500 text-xs block">Phone</span>
                  <span className="font-medium">{selected.phone || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block">Submitted</span>
                  <span className="font-medium">{new Date(selected.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {(() => {
                const parsed = parseData(selected.data);
                if (parsed) {
                  const fields = Object.entries(parsed).filter(([, v]) => v);
                  if (fields.length > 0) {
                    return (
                      <div>
                        <span className="text-gray-500 text-xs block mb-2 font-semibold uppercase tracking-wider">Contact Details</span>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          {fields.map(([key, val]) => (
                            <div key={key} className="flex gap-2 text-sm">
                              <span className="text-gray-400 capitalize min-w-[120px] font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                              <span className="text-gray-800">{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                }
                return null;
              })()}

              {selected.message && (
                <div>
                  <span className="text-gray-500 text-xs block mb-2 font-semibold uppercase tracking-wider">Message</span>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{selected.message}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
              <Eye size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium mb-1">Select a submission</p>
              <p className="text-sm">Choose a submission from the list to view details.</p>
            </div>
          )}
        </div>
      </div>

      <ReplyModal />
    </div>
  );
}
