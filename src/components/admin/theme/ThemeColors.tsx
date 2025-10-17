import React, { useEffect, useState } from 'react';
import { saveAdminSetting, getAdminSetting } from '@/lib/adminSettingsApi';
import { useToast } from '@/hooks/use-toast';

type ThemeConfig = {
  primary: string;
  secondary: string;
  accent: string;
  tertiary?: string;
  background: string;
  text: string;
};

const STORAGE_KEY = 'admin:theme:colors';
const THEMES_KEY = 'admin:theme:themes';
const SELECTED_KEY = 'admin:theme:selected';

type NamedTheme = { name: string; config: ThemeConfig; createdAt: string };
type NamedTheme = { name: string; description?: string; config: ThemeConfig; createdAt: string };

const defaultThemes: NamedTheme[] = [
  { name: 'Default', description: 'Het standaard licht thema', createdAt: new Date().toISOString(), config: { primary: '#0ea5a4', secondary: '#7c3aed', accent: '#f97316', tertiary: '#06b6d4', background: '#ffffff', text: '#0f172a' } },
  { name: 'Dark', description: 'Donker thema met hoge contrasten', createdAt: new Date().toISOString(), config: { primary: '#06b6d4', secondary: '#7c3aed', accent: '#fb923c', tertiary: '#f43f5e', background: '#0b1220', text: '#e6eef8' } },
];

function applyTheme(cfg: ThemeConfig) {
  const el = document.documentElement;
  el.style.setProperty('--c-primary', cfg.primary);
  el.style.setProperty('--c-secondary', cfg.secondary);
  el.style.setProperty('--c-accent', cfg.accent);
  if (cfg.tertiary) el.style.setProperty('--c-tertiary', cfg.tertiary);
  el.style.setProperty('--c-bg', cfg.background);
  el.style.setProperty('--c-text', cfg.text);
}

export default function ThemeColors() {
  const [config, setConfig] = useState<ThemeConfig>({
    primary: '#0ea5a4',
    secondary: '#7c3aed',
    accent: '#f97316',
    tertiary: '#06b6d4',
    background: '#ffffff',
    text: '#0f172a',
  });
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const { toast } = useToast();
  const [themes, setThemes] = useState<NamedTheme[]>([]);
  const [selectedThemeName, setSelectedThemeName] = useState<string>(defaultThemes[0].name);
  const [newThemeName, setNewThemeName] = useState<string>('');
  const [renameTarget, setRenameTarget] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>('');
  const [renameDesc, setRenameDesc] = useState<string>('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [newThemeDesc, setNewThemeDesc] = useState<string>('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.config) setConfig(p => ({ ...p, ...parsed.config }));
        if (parsed.lastSaved) setLastSaved(parsed.lastSaved);
        if (parsed.log) setLog(parsed.log);
      }
    } catch (e) {}

    (async () => {
      try {
        const res = await getAdminSetting(STORAGE_KEY);
        if (res && res.data) {
          setConfig(p => ({ ...p, ...(res.data.config || {}) }));
          if (res.data.lastSaved) setLastSaved(res.data.lastSaved);
          if (res.data.log) setLog(res.data.log);
        }
        // load themes list
        const tRes = await getAdminSetting(THEMES_KEY);
        if (tRes && tRes.data) {
          setThemes(Array.isArray(tRes.data) ? tRes.data : defaultThemes);
        } else {
          // try localStorage
          const rawThemes = localStorage.getItem(THEMES_KEY);
          if (rawThemes) {
            try { setThemes(JSON.parse(rawThemes)); } catch (e) { setThemes(defaultThemes); }
          } else setThemes(defaultThemes);
        }
        // load selected
        const sel = localStorage.getItem(SELECTED_KEY);
        if (sel) setSelectedThemeName(sel);
        else {
          const selRes = await getAdminSetting(SELECTED_KEY);
          if (selRes && selRes.data) setSelectedThemeName(selRes.data as string);
        }
      } catch (e) {}
    })();
  }, []);

  useEffect(() => {
    applyTheme(config);
  }, [config]);

  // compute swatches from actual computed CSS variables to reflect current app colors
  const [swatches, setSwatches] = useState<string[]>([]);

  useEffect(() => {
    function computeSwatches() {
      try {
        const cs = getComputedStyle(document.documentElement);
        const candidates = ['--c-primary', '--c-secondary', '--c-accent', '--c-tertiary', '--c-quaternary'];
        const vals: string[] = [];
        candidates.forEach(v => {
          const raw = cs.getPropertyValue(v).trim();
          if (raw) {
            // normalize rgb(...) to hex if needed? keep as-is for now
            vals.push(raw);
          }
        });
        // fallback: if none found, use current config
        if (vals.length === 0) {
          vals.push(config.primary, config.secondary, config.accent);
        }
        // dedupe and set
        const uniq = Array.from(new Set(vals));
        setSwatches(uniq);
      } catch (e) {
        setSwatches([config.primary, config.secondary, config.accent]);
      }
    }

    computeSwatches();
    // also recompute when config changes
  }, [config]);

  function handleChange<K extends keyof ThemeConfig>(k: K, v: string) {
    setConfig(c => ({ ...c, [k]: v }));
  }

  function handleSave() {
    const savedAt = new Date().toISOString();
    const entry = `Kleurenschema opgeslagen (${new Date().toLocaleString()})`;
    const newLog = [entry, ...log];
    setLog(newLog);
    setLastSaved(savedAt);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ config, lastSaved: savedAt, log: newLog }));
  saveAdminSetting(STORAGE_KEY, { config, lastSaved: savedAt, log: newLog })
      .then(() => toast({ title: 'Kleurenschema opgeslagen' }))
      .catch(() => toast({ title: 'Opslaan backend mislukt', variant: 'destructive' }));
  }

  // Theme list management
  function persistThemes(list: NamedTheme[]) {
    setThemes(list);
    localStorage.setItem(THEMES_KEY, JSON.stringify(list));
    saveAdminSetting(THEMES_KEY, list).catch(() => {});
  }

  function renameTheme(oldName: string, newName: string, newDesc?: string) {
    const name = newName.trim();
    if (!name) { toast({ title: 'Geef een naam op', variant: 'destructive' }); return; }
    if (name !== oldName && themes.find(t => t.name === name)) { toast({ title: 'Naam bestaat al', variant: 'destructive' }); return; }
    const updated = themes.map(t => t.name === oldName ? { ...t, name, description: newDesc ?? t.description } : t);
    persistThemes(updated);
    // update selected if needed
    if (selectedThemeName === oldName) {
      setSelectedThemeName(name);
      localStorage.setItem(SELECTED_KEY, name);
      saveAdminSetting(SELECTED_KEY, name).catch(() => {});
    }
    setRenameTarget(null);
    setRenameValue('');
    setRenameDesc('');
    toast({ title: `Thema hernoemd naar '${name}'` });
  }

  function saveCurrentAsTheme() {
    const name = newThemeName.trim();
    if (!name) { toast({ title: 'Geef een naam op' , variant: 'destructive'}); return; }
    if (themes.find(t => t.name === name)) { toast({ title: 'Naam bestaat al', variant: 'destructive' }); return; }
    const nt: NamedTheme = { name, description: newThemeDesc.trim() || undefined, config: { ...config }, createdAt: new Date().toISOString() };
    persistThemes([nt, ...themes]);
    setNewThemeName('');
    setNewThemeDesc('');
    toast({ title: 'Thema opgeslagen', description: `Thema '${name}' is aangemaakt.` });
  }

  function applyThemeByName(name: string) {
    const t = themes.find(x => x.name === name);
    if (!t) return;
    setConfig(t.config);
    setSelectedThemeName(name);
    localStorage.setItem(SELECTED_KEY, name);
    saveAdminSetting(SELECTED_KEY, name).catch(() => {});
    toast({ title: `Thema '${name}' toegepast` });
  }

  function deleteTheme(name: string) {
    if (name === 'Default' || name === 'Dark') { toast({ title: 'Kan standaardthema niet verwijderen', variant: 'destructive' }); return; }
    const filtered = themes.filter(t => t.name !== name);
    persistThemes(filtered);
    // if selected was deleted, fallback to Default
    if (selectedThemeName === name) {
      const fallback = filtered[0]?.name ?? defaultThemes[0].name;
      setSelectedThemeName(fallback);
      localStorage.setItem(SELECTED_KEY, fallback);
      saveAdminSetting(SELECTED_KEY, fallback).catch(() => {});
    }
    setConfirmDelete(null);
    toast({ title: `Thema '${name}' verwijderd` });
  }

  function exportConfig() {
    const blob = new Blob([JSON.stringify({ config }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme-colors-${new Date().toISOString()}.json`;
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
        setLog(l => [`Kleurenschema geïmporteerd (${new Date().toLocaleString()})`, ...l]);
        toast({ title: 'Import succesvol' });
      }
    } catch (e) {
      toast({ title: 'Ongeldig bestand', variant: 'destructive' });
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Kleurenschema</h2>
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm">Geselecteerd thema</label>
        <select className="select" value={selectedThemeName} onChange={e => applyThemeByName(e.target.value)}>
          {themes.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
        </select>
        <button className="btn btn-ghost" onClick={() => applyThemeByName(selectedThemeName)}>Toepassen</button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Primaire kleur</label>
          <input type="color" value={config.primary} onChange={e => handleChange('primary', e.target.value)} />

          <label className="block mt-3 mb-1">Secundaire kleur</label>
          <input type="color" value={config.secondary} onChange={e => handleChange('secondary', e.target.value)} />

          <label className="block mt-3 mb-1">Accent kleur</label>
          <input type="color" value={config.accent} onChange={e => handleChange('accent', e.target.value)} />

          <label className="block mt-3 mb-1">Tertiaire kleur</label>
          <input type="color" value={config.tertiary || '#06b6d4'} onChange={e => handleChange('tertiary', e.target.value)} />

          <label className="block mt-3 mb-1">Achtergrond</label>
          <input type="color" value={config.background} onChange={e => handleChange('background', e.target.value)} />

          <label className="block mt-3 mb-1">Tekst</label>
          <input type="color" value={config.text} onChange={e => handleChange('text', e.target.value)} />

          <div className="mt-4 flex gap-2">
            <button className="btn btn-primary" onClick={handleSave}>Opslaan</button>
            <button className="btn btn-ghost" onClick={exportConfig}>Exporteren</button>
            <label className="btn btn-ghost">
              Importeren
              <input type="file" accept="application/json" className="hidden" onChange={e => importConfig(e.target.files?.[0] ?? null)} />
            </label>
            <div className="ml-4 flex items-center gap-2">
              <input placeholder="Naam nieuw thema" value={newThemeName} onChange={e => setNewThemeName(e.target.value)} className="input input-sm" />
              <button className="btn btn-sm btn-outline" onClick={saveCurrentAsTheme}>Sla thema op</button>
            </div>
          </div>

          <div className="mt-3 text-xs text-muted-foreground">{lastSaved ? `Laatst opgeslagen: ${new Date(lastSaved).toLocaleString()}` : 'Nog niet opgeslagen'}</div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Preview</h4>
          <div className="border rounded p-3 bg-white" style={{ background: config.background, color: config.text }}>
            <div className="flex items-center justify-between mb-3">
              <div className="font-bold">Homepage</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {swatches.map((c, i) => (
                  <div key={i} style={{ width: 20, height: 20, background: c, borderRadius: 6, border: '1px solid rgba(0,0,0,0.08)' }} />
                ))}
              </div>
            </div>
            <div className="mb-2">Korte intro tekst om het kleurenschema te tonen.</div>
            <div className="flex gap-2">
              <button style={{ background: config.primary, color: config.text }} className="px-3 py-1 rounded">Actie</button>
              <button style={{ background: config.secondary, color: config.text }} className="px-3 py-1 rounded">Secondair</button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="font-semibold mb-2">Opgeslagen thema's</h4>
        <div className="space-y-2">
          {themes.map(t => (
            <div key={t.name} className="flex items-center justify-between p-2 border rounded" onClick={() => { setRenameTarget(t.name); setRenameValue(t.name); setRenameDesc(t.description ?? ''); }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded" style={{ background: t.config.primary, border: '1px solid rgba(0,0,0,0.06)' }} />
                <div>
                  <div className="font-medium">{t.name}</div>
                  {t.description && <div className="text-xs text-muted-foreground">{t.description}</div>}
                  <div className="text-xs text-muted-foreground">Aangemaakt: {new Date(t.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn btn-sm" onClick={e => { e.stopPropagation(); applyThemeByName(t.name); }}>Apply</button>
                <button className="btn btn-sm btn-outline" onClick={e => { e.stopPropagation(); setRenameTarget(t.name); setRenameValue(t.name); setRenameDesc(t.description ?? ''); }}>Edit</button>
                <button className="btn btn-sm btn-destructive" onClick={e => { e.stopPropagation(); setConfirmDelete(t.name); }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rename inline modal */}
      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white p-4 rounded w-96">
            <h4 className="font-semibold mb-2">Bewerk thema</h4>
            <label className="text-xs text-muted-foreground">Naam</label>
            <input className="input w-full mb-2" value={renameValue} onChange={e => setRenameValue(e.target.value)} />
            <label className="text-xs text-muted-foreground">Beschrijving (optioneel)</label>
            <input className="input w-full mb-3" value={renameDesc} onChange={e => setRenameDesc(e.target.value)} />
            <div className="flex justify-end gap-2">
              <button className="btn" onClick={() => { setRenameTarget(null); setRenameValue(''); setRenameDesc(''); }}>Annuleren</button>
              <button className="btn btn-primary" onClick={() => renameTheme(renameTarget, renameValue, renameDesc)}>Opslaan</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white p-4 rounded w-96">
            <h4 className="font-semibold mb-2">Bevestig verwijderen</h4>
            <p className="mb-4">Weet je zeker dat je het thema '{confirmDelete}' wilt verwijderen? Dit kan niet ongedaan gemaakt worden.</p>
            <div className="flex justify-end gap-2">
              <button className="btn" onClick={() => setConfirmDelete(null)}>Annuleren</button>
              <button className="btn btn-destructive" onClick={() => deleteTheme(confirmDelete)}>Verwijder</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
