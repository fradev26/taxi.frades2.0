import React, { useEffect, useState } from 'react';
import { saveAdminSetting, getAdminSetting } from '@/lib/adminSettingsApi';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'admin:theme:logo';
const BUCKET = 'theme-assets';

export default function ThemeLogo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setLogoUrl(parsed.logoUrl || null);
        setFaviconUrl(parsed.faviconUrl || null);
      }
    } catch (e) {}

    (async () => {
      try {
        const res = await getAdminSetting(STORAGE_KEY);
        if (res && res.data) {
          setLogoUrl(res.data.logoUrl || null);
          setFaviconUrl(res.data.faviconUrl || null);
        }
      } catch (e) {}
    })();
  }, []);

  async function uploadToSupabase(file: File, path: string) {
    // upload file to Supabase storage and return public URL
    const filePath = `${path}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filePath, file, { cacheControl: '3600', upsert: true });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    return data?.publicUrl || null;
  }

  async function handleUpload(file: File | null, kind: 'logo' | 'favicon') {
    if (!file) return;
    try {
      const url = await uploadToSupabase(file, kind === 'logo' ? 'logos' : 'favicons');
      if (!url) throw new Error('Geen URL ontvangen');
      if (kind === 'logo') setLogoUrl(url); else setFaviconUrl(url);
      const payload = { logoUrl: logoUrl || url, faviconUrl: faviconUrl || url };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      await saveAdminSetting(STORAGE_KEY, payload);
      toast({ title: 'Afbeelding opgeslagen', description: 'Upload naar opslag gelukt.' });
    } catch (e: any) {
      console.error('Upload fout', e?.message || e);
      toast({ title: 'Upload mislukt', description: e?.message || 'Er is iets misgegaan', variant: 'destructive' });
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Logo & favicon</h2>
      <div className="mb-4">
        <label className="block mb-1">Logo</label>
        <input type="file" accept="image/*" onChange={e => handleUpload(e.target.files?.[0] ?? null, 'logo')} />
        {logoUrl && <img src={logoUrl} alt="Logo" style={{ height: 48, marginTop: 8 }} />}
      </div>
      <div className="mb-4">
        <label className="block mb-1">Favicon</label>
        <input type="file" accept="image/x-icon,image/png" onChange={e => handleUpload(e.target.files?.[0] ?? null, 'favicon')} />
        {faviconUrl && <img src={faviconUrl} alt="favicon" style={{ height: 24, marginTop: 8 }} />}
      </div>
    </div>
  );
}
