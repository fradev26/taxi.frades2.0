import React, { useEffect, useState } from "react";
import { saveAdminSetting, getAdminSetting } from "@/lib/adminSettingsApi";
import { useToast } from '@/hooks/use-toast';

type ThemeConfig = {
  primary: string;
  secondary: string;
  accent: string;
  tertiary?: string;
  background: string;
  text: string;
};

const STORAGE_KEY = "admin:themeSettings";

function ThemePreview({ config, page }: { config: ThemeConfig; page: string }) {
  const style: React.CSSProperties = {
    ['--c-primary' as any]: config.primary,
    ['--c-secondary' as any]: config.secondary,
    ['--c-accent' as any]: config.accent,
    ['--c-tertiary' as any]: config.tertiary || '#06b6d4',
    ['--c-bg' as any]: config.background,
    ['--c-text' as any]: config.text,
    backgroundColor: 'var(--c-bg)',
    color: 'var(--c-text)',
    borderRadius: 8,
    padding: 16,
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: 'var(--c-primary)',
    color: 'var(--c-text)',
    border: 'none',
    padding: '8px 12px',
    borderRadius: 6,
  };

  return (
    <div style={style as any} className="border p-4 rounded">
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-bold">{page}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: 'var(--c-primary)', borderRadius: 6 }} />
          <div style={{ width: 28, height: 28, background: 'var(--c-secondary)', borderRadius: 6 }} />
          <div style={{ width: 28, height: 28, background: 'var(--c-accent)', borderRadius: 6 }} />
        </div>
      </div>

      {page === 'Homepage' && (
        <div>
          <div className="mb-4">
            <h3 className="text-xl font-semibold">Welkom bij onze demo</h3>
            <p className="text-sm">Een korte intro tekst met de gekozen kleuren toegepast.</p>
          </div>
          <div className="flex gap-2">
            <button style={buttonStyle as any}>Boek nu</button>
            <button style={{ ...buttonStyle, backgroundColor: 'var(--c-secondary)' } as any}>Bekijk tarieven</button>
          </div>
        </div>
      )}

      {page === 'Booking' && (
        <div>
          <div className="mb-3">
            <label className="block text-sm mb-1">Adres ophalen</label>
            <input className="input w-full" placeholder="Voer ophaallocatie in" />

            <label className="block mt-3 mb-1 font-medium">Tertiaire kleur</label>
            <input type="color" value={config.tertiary || '#06b6d4'} onChange={e => handleColorChange('tertiary', e.target.value)} className="w-16 h-8 border rounded" />
          </div>
          <div className="flex gap-2">
            <button style={buttonStyle as any}>Bereken prijs</button>
            <button style={{ backgroundColor: 'var(--c-accent)', color: 'var(--c-text)', padding: '8px 12px', borderRadius: 6 } as any}>Registreer</button>
          </div>
        </div>
      )}

      {page === 'Admin' && (
        <div>
          <div className="mb-3 text-sm">Overzicht instellingen</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-white/10 rounded">Algemeen</div>
            <div className="p-2 bg-white/10 rounded">Notificaties</div>
            <div className="p-2 bg-white/10 rounded">Thema</div>
            <div className="p-2 bg-white/10 rounded">Gebruikers</div>
          </div>
        </div>
      )}

      {page === 'Account' && (
        <div>
          <div className="mb-2">Profiel</div>
          <div className="p-3 bg-white/5 rounded">Naam: Demo Gebruiker</div>
        </div>
      )}
    </div>
  );
}

export default function ThemeSettings() {
  const [config, setConfig] = useState<ThemeConfig>({
    primary: '#0ea5a4',
    secondary: '#7c3aed',
    accent: '#f97316',
    tertiary: '#06b6d4',
    background: '#ffffff',
    text: '#0f172a',
  });
  const [logo, setLogo] = useState<File | null>(null);
  const [selectedPage, setSelectedPage] = useState('Homepage');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [useIframePreview, setUseIframePreview] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // load from localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setConfig(p => ({ ...p, ...(parsed.config || {}) }));
        if (parsed.lastSaved) setLastSaved(parsed.lastSaved);
        if (parsed.log) setLog(parsed.log);
      }
    } catch (e) {}

    // try backend
    (async () => {
      try {
        const res = await getAdminSetting(STORAGE_KEY);
        if (res && res.data) {
          setConfig(p => ({ ...p, ...(res.data.config || {}) }));
          if (res.data.lastSaved) setLastSaved(res.data.lastSaved);
          if (res.data.log) setLog(res.data.log);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  function handleColorChange(key: keyof ThemeConfig, value: string) {
    setConfig(c => ({ ...c, [key]: value }));
  }

  function handleSave() {
    const entry = `Thema opgeslagen (${new Date().toLocaleString()})`;
    const newLog = [entry, ...log];
    setLog(newLog);
    const savedAt = new Date().toISOString();
    setLastSaved(savedAt);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ config, lastSaved: savedAt, log: newLog }));
    saveAdminSetting(STORAGE_KEY, { config, lastSaved: savedAt, log: newLog })
      .then(() => {
        toast({ title: 'Thema opgeslagen', description: 'Thema is succesvol naar de backend weggeschreven.' });
      })
      .catch(() => {
        toast({ title: 'Opslaan gefaald', description: 'Kon thema niet naar de backend opslaan. Lokale opslag is bijgewerkt.', variant: 'destructive' });
      });

    toast({ title: 'Thema opgeslagen', description: 'Lokale opslag bijgewerkt.' });
  }

  function exportConfig() {
    const blob = new Blob([JSON.stringify({ config }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme-config-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importConfig(file: File | null) {
    if (!file) return;
    const txt = await file.text();
    try {
      const parsed = JSON.parse(txt);
      if (parsed.config) {
        setConfig(parsed.config);
        setLog(l => [`Thema geïmporteerd (${new Date().toLocaleString()})`, ...l]);
        toast({ title: 'Import succesvol', description: 'Thema is geïmporteerd.' });
      }
    } catch (e) {
      alert('Ongeldig config-bestand');
    }
  }

  function resetDefaults() {
    const defaults: ThemeConfig = {
      primary: '#0ea5a4',
      secondary: '#7c3aed',
      accent: '#f97316',
      background: '#ffffff',
      text: '#0f172a',
    };
    setConfig(defaults);
    setLog(l => [`Thema teruggezet naar standaard (${new Date().toLocaleString()})`, ...l]);
  }

  return (
    <section className="p-4 rounded-lg bg-gray-50 shadow-sm">
      <h3 className="font-semibold text-lg mb-2">Thema & Uiterlijk</h3>

      <div className="grid grid-cols-2 gap-4">
  <div>
          <label className="block mb-1 font-medium">Primaire kleur</label>
          <input type="color" value={config.primary} onChange={e => handleColorChange('primary', e.target.value)} className="w-16 h-8 border rounded" />

          <label className="block mt-3 mb-1 font-medium">Secundaire kleur</label>
          <input type="color" value={config.secondary} onChange={e => handleColorChange('secondary', e.target.value)} className="w-16 h-8 border rounded" />

          <label className="block mt-3 mb-1 font-medium">Accent kleur</label>
          <input type="color" value={config.accent} onChange={e => handleColorChange('accent', e.target.value)} className="w-16 h-8 border rounded" />

          <label className="block mt-3 mb-1 font-medium">Achtergrond</label>
          <input type="color" value={config.background} onChange={e => handleColorChange('background', e.target.value)} className="w-16 h-8 border rounded" />

          <label className="block mt-3 mb-1 font-medium">Tekstkleur</label>
          <input type="color" value={config.text} onChange={e => handleColorChange('text', e.target.value)} className="w-16 h-8 border rounded" />

          <div className="mt-4 flex gap-2">
            <button className="btn btn-primary" onClick={handleSave}>Opslaan</button>
            <button className="btn btn-ghost" onClick={exportConfig}>Exporteren</button>
            <label className="btn btn-ghost">
              Importeren
              <input type="file" accept="application/json" className="hidden" onChange={e => importConfig(e.target.files?.[0] ?? null)} />
            </label>
            <button className="btn btn-outline" onClick={resetDefaults}>Reset</button>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            {lastSaved ? `Laatst opgeslagen: ${new Date(lastSaved).toLocaleString()}` : 'Nog niet opgeslagen.'}
          </div>

          <div className="mt-4 bg-white p-3 rounded">
            <strong>Log</strong>
            <div className="text-xs mt-2 max-h-32 overflow-auto">
              {log.length === 0 ? <div className="text-muted-foreground">Nog geen acties.</div> : log.map((l, i) => <div key={i}>{l}</div>)}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block mb-1 font-medium">Preview pagina</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={useIframePreview} onChange={e => setUseIframePreview(e.target.checked)} /> Gebruik live route (iframe)</label>
          </div>
          <select className="select w-full mb-4" value={selectedPage} onChange={e => setSelectedPage(e.target.value)}>
            <option>Homepage</option>
            <option>Booking</option>
            <option>Admin</option>
            <option>Account</option>
          </select>

          <div className="border rounded p-3">
            {useIframePreview ? (
              <iframe title="preview-iframe" src={`/${selectedPage.toLowerCase()}`} style={{ width: '100%', height: 420, border: 'none' }} />
            ) : (
              <ThemePreview config={config} page={selectedPage} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}