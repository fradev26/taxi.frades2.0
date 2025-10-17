import React, { useEffect, useState } from 'react';
import { saveAdminSetting, getAdminSetting } from '@/lib/adminSettingsApi';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'admin:theme:css';

export default function ThemeCSS() {
  const [css, setCss] = useState<string>('');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setCss(parsed.css || '');
        if (parsed.lastSaved) setLastSaved(parsed.lastSaved);
      }
    } catch (e) {}

    (async () => {
      try {
        const res = await getAdminSetting(STORAGE_KEY);
        if (res && res.data) {
          setCss(res.data.css || '');
          if (res.data.lastSaved) setLastSaved(res.data.lastSaved);
        }
      } catch (e) {}
    })();
  }, []);

  function applyCustomCSS() {
    let styleEl = document.getElementById('admin-custom-css') as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'admin-custom-css';
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = css;
  }

  function handleSave() {
    const savedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ css, lastSaved: savedAt }));
    saveAdminSetting(STORAGE_KEY, { css, lastSaved: savedAt }).then(() => {
      toast({ title: 'Custom CSS opgeslagen' });
      setLastSaved(savedAt);
      applyCustomCSS();
    }).catch(() => toast({ title: 'Opslaan backend mislukt', variant: 'destructive' }));
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Custom CSS</h2>
      <textarea className="textarea textarea-bordered w-full mb-4" rows={10} value={css} onChange={e => setCss(e.target.value)} placeholder="Voeg hier aangepaste CSS toe..." />
      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={handleSave}>Opslaan & toepassen</button>
        <button className="btn btn-ghost" onClick={() => { setCss(''); }}>Reset</button>
      </div>
      {lastSaved && <div className="mt-3 text-xs text-muted-foreground">Laatst opgeslagen: {new Date(lastSaved).toLocaleString()}</div>}
    </div>
  );
}
