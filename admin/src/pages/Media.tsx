import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Trash2, Copy, Check, X, Loader2, ImageIcon } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  url: string;
  urls: { thumbnail: string; medium: string; original: string };
  createdAt: string;
}

export default function Media() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadMedia(); }, []);

  const loadMedia = async () => {
    try {
      const { data } = await api.get('/media?limit=100');
      setItems(data.items);
    } catch {
      toast.error('Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/media', formData);
      setItems(prev => [data, ...prev]);
      toast.success('Uploaded successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) handleUpload(file);
  };

  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`Delete "${item.originalName}"?`)) return;
    try {
      await api.delete(`/media/${item.id}`);
      setItems(prev => prev.filter(i => i.id !== item.id));
      if (preview?.id === item.id) setPreview(null);
      toast.success('Deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('URL copied');
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-500 mt-1">Upload and manage images</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`mb-6 border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragOver ? 'border-teal-500 bg-teal-50' : 'border-gray-200 bg-gray-50'
        }`}
      >
        <ImageIcon size={40} className="mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500">Drop an image here or click the Upload button</p>
        <p className="text-sm text-gray-400 mt-1">JPEG, PNG, GIF, WebP, SVG, AVIF — max 10MB</p>
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 truncate">{preview.originalName}</h3>
              <button onClick={() => setPreview(null)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <div className="p-4">
              <img
                src={preview.urls.medium}
                alt={preview.altText || ''}
                className="w-full rounded-lg max-h-96 object-contain bg-gray-100"
              />
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Dimensions:</span> <span className="font-medium">{preview.width}×{preview.height}</span></div>
                <div><span className="text-gray-500">Size:</span> <span className="font-medium">{formatSize(preview.size)}</span></div>
                <div><span className="text-gray-500">Type:</span> <span className="font-medium">{preview.mimeType}</span></div>
                <div><span className="text-gray-500">Uploaded:</span> <span className="font-medium">{new Date(preview.createdAt).toLocaleDateString()}</span></div>
              </div>
              <div className="mt-3">
                <label className="block text-sm text-gray-500 mb-1">Alt Text</label>
                <input
                  type="text"
                  value={preview.altText || ''}
                  onChange={async (e) => {
                    const val = e.target.value;
                    setPreview({ ...preview, altText: val });
                    try {
                      await api.put(`/media/${preview.id}`, { altText: val });
                    } catch {}
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="Describe this image..."
                />
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => copyUrl(preview.urls.original, preview.id)} className="flex items-center gap-1.5 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  {copiedId === preview.id ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  Copy URL
                </button>
                <button onClick={() => { handleDelete(preview); setPreview(null); }} className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <ImageIcon size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 text-lg font-medium">No images yet</p>
          <p className="text-gray-400 text-sm mt-1">Upload your first image to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setPreview(item)}
            >
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                <img
                  src={item.urls.thumbnail}
                  alt={item.altText || item.originalName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); copyUrl(item.urls.original, item.id); }}
                    className="p-1.5 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
                  >
                    {copiedId === item.id ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                    className="p-1.5 bg-white rounded-lg shadow hover:bg-red-50 transition-colors text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-600 truncate font-medium">{item.originalName}</p>
                <p className="text-xs text-gray-400">{item.width}×{item.height}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
