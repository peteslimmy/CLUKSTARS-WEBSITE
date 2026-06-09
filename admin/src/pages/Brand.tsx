import { useState, useEffect, FormEvent, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface BrandData {
  id: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontHeading: string;
  fontBody: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  customCss: string | null;
}

const fontOptions = ['Inter', 'Roboto', 'Open Sans', 'Montserrat', 'Poppins', 'Lato', 'Playfair Display', 'Source Sans Pro'];

const colorPresets = [
  { label: 'Default', primary: '#0F172A', secondary: '#00897B', accent: '#38BDF8' },
  { label: 'Ocean', primary: '#0D1B2A', secondary: '#1B4965', accent: '#62B6CB' },
  { label: 'Forest', primary: '#1A3C34', secondary: '#2D6A4F', accent: '#95D5B2' },
  { label: 'Warm', primary: '#2D1B00', secondary: '#C97B2D', accent: '#F4A261' },
  { label: 'Dark', primary: '#111111', secondary: '#333333', accent: '#666666' },
];

export default function Brand() {
  const [data, setData] = useState<BrandData | null>(null);
  const [form, setForm] = useState({
    primaryColor: '#0F172A',
    secondaryColor: '#00897B',
    accentColor: '#38BDF8',
    fontHeading: 'Inter',
    fontBody: 'Inter',
    logoUrl: '',
    faviconUrl: '',
    customCss: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data: brand } = await api.get('/brand');
      setData(brand);
      setForm({
        primaryColor: brand.primaryColor || '#0F172A',
        secondaryColor: brand.secondaryColor || '#00897B',
        accentColor: brand.accentColor || '#38BDF8',
        fontHeading: brand.fontHeading || 'Inter',
        fontBody: brand.fontBody || 'Inter',
        logoUrl: brand.logoUrl || '',
        faviconUrl: brand.faviconUrl || '',
        customCss: brand.customCss || '',
      });
    } catch {
      toast.error('Failed to load brand settings');
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset: typeof colorPresets[0]) => {
    setForm({
      ...form,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        logoUrl: form.logoUrl || undefined,
        faviconUrl: form.faviconUrl || undefined,
        customCss: form.customCss || undefined,
      };
      const { data: updated } = await api.put('/brand', payload);
      setData(updated);
      toast.success('Brand settings updated');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Brand Settings</h1>
        <p className="text-gray-500 mt-1">Customize your brand appearance</p>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Color Presets</h3>
        <div className="flex flex-wrap gap-2">
          {colorPresets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors text-sm"
            >
              <div className="flex -space-x-1">
                <div className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: preset.primary }} />
                <div className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: preset.secondary }} />
                <div className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: preset.accent }} />
              </div>
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Colors</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  className="w-10 h-10 p-0.5 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={form.primaryColor}
                  onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none font-mono text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={form.secondaryColor}
                  onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                  className="w-10 h-10 p-0.5 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={form.secondaryColor}
                  onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none font-mono text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={form.accentColor}
                  onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                  className="w-10 h-10 p-0.5 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={form.accentColor}
                  onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Typography</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heading Font</label>
              <select
                value={form.fontHeading}
                onChange={(e) => setForm({ ...form, fontHeading: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              >
                {fontOptions.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Body Font</label>
              <select
                value={form.fontBody}
                onChange={(e) => setForm({ ...form, fontBody: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              >
                {fontOptions.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
        </div>

        <AssetUploader
          label="Logo"
          uploadType="logo"
          url={form.logoUrl}
          onUrlChange={(url) => setForm({ ...form, logoUrl: url })}
          onAutoSave={async () => {
            try { setSaving(true); await api.put('/brand', { ...form, logoUrl: form.logoUrl || undefined, faviconUrl: form.faviconUrl || undefined, customCss: form.customCss || undefined }); } catch {} finally { setSaving(false); }
          }}
          api={api}
        />
        <AssetUploader
          label="Favicon"
          uploadType="favicon"
          url={form.faviconUrl}
          onUrlChange={(url) => setForm({ ...form, faviconUrl: url })}
          onAutoSave={async () => {
            try { setSaving(true); await api.put('/brand', { ...form, logoUrl: form.logoUrl || undefined, faviconUrl: form.faviconUrl || undefined, customCss: form.customCss || undefined }); } catch {} finally { setSaving(false); }
          }}
          api={api}
        />

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom CSS</h3>
          <textarea
            value={form.customCss}
            onChange={(e) => setForm({ ...form, customCss: e.target.value })}
            rows={6}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none font-mono text-sm resize-none"
            placeholder="/* Custom CSS overrides */"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-10 rounded-lg" style={{ backgroundColor: form.primaryColor }} />
          <div className="flex-1 h-10 rounded-lg" style={{ backgroundColor: form.secondaryColor }} />
          <div className="flex-1 h-10 rounded-lg" style={{ backgroundColor: form.accentColor }} />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

function AssetUploader({ label, url, onUrlChange, onAutoSave, api, uploadType }: { label: string; url: string; onUrlChange: (url: string) => void; onAutoSave?: () => Promise<void>; api: any; uploadType: string }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', uploadType);
      const { data } = await api.post('/media/upload-brand', formData);
      onUrlChange(data.url);
      await onAutoSave?.();
      toast.success(`${label} uploaded`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{label}</h3>
      <div className="flex items-start gap-4">
        <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
          {url ? (
            <img src={url} alt={label} className="w-full h-full object-contain p-2" />
          ) : (
            <span className="text-xs text-gray-400">No {label.toLowerCase()}</span>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
              if (inputRef.current) inputRef.current.value = '';
            }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {uploading ? 'Uploading...' : `Upload ${label}`}
            </button>
            {url && (
              <button
                type="button"
                onClick={() => onUrlChange('')}
                className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X size={16} /> Remove
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Or paste URL..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
