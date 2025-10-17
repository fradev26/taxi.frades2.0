import { useEffect, useState } from 'react';
import detected from '@/data/detectedIntegrations.json';
import { saveAdminSetting, getAdminSetting } from '@/lib/adminSettingsApi';

type AppRecord = { id: string; name: string; description?: string; apiKey?: string; webhook?: string; createdAt: string };

const STORAGE_KEY = 'admin:integrations:apps';

export default function ApiSettings() {
  const [apps, setApps] = useState<AppRecord[]>([]);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [key, setKey] = useState('');
  const [webhook, setWebhook] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setApps(JSON.parse(raw));
    } catch (e) {}
    (async () => {
      try {
        const res = await getAdminSetting(STORAGE_KEY);
        if (res && res.data) setApps(res.data as AppRecord[]);
      } catch (e) {}
    })();
  }, []);

  function persist(list: AppRecord[]) {
    setApps(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    saveAdminSetting(STORAGE_KEY, list)
      .then(() => {
        // On successful backend persist, clear stored API keys for security
        try {
          const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as AppRecord[];
          const cleared = stored.map(s => ({ ...s, apiKey: undefined }));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cleared));
        } catch (e) {}
      })
      .catch(() => {});
  }

  function addApp() {
    setError(null);
    if (!name.trim()) { setError('Naam is vereist'); return; }
    if (webhook && !/^https?:\/\//i.test(webhook)) { setError('Webhook moet een geldige URL zijn'); return; }
    const rec: AppRecord = { id: String(Date.now()), name: name.trim(), description: desc.trim() || undefined, apiKey: key || undefined, webhook: webhook || undefined, createdAt: new Date().toISOString() };
    persist([rec, ...apps]);
    setName(''); setDesc(''); setKey(''); setWebhook('');
  }

  function deleteApp(id: string) {
    persist(apps.filter(a => a.id !== id));
    setConfirmDeleteId(null);
  }

  function cancelDelete() {
    setConfirmDeleteId(null);
  }

  return (
    <section className="p-4 rounded-lg bg-gray-50 shadow-sm">
      <h3 className="font-semibold text-lg mb-2">API & Integraties</h3>

      <div className="mb-6">
        <h4 className="font-medium mb-2">Gevonden integraties</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.keys(detected).map(k => (
            <div key={k} className="p-3 border rounded bg-white">
              <div className="font-semibold">{k}</div>
              <div className="text-sm text-muted-foreground">{(detected as any)[k].notes ?? (detected as any)[k].type}</div>
              <div className="text-xs text-muted-foreground mt-2">Locations: {((detected as any)[k].locations || []).slice(0,3).join(', ')}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-medium mb-2">Applicaties beheren</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 border rounded bg-white">
            <label className="block text-sm mb-1">Naam</label>
            <input className="input input-bordered w-full mb-2" value={name} onChange={e => setName(e.target.value)} />
            <label className="block text-sm mb-1">Beschrijving</label>
            <input className="input input-bordered w-full mb-2" value={desc} onChange={e => setDesc(e.target.value)} />
            <label className="block text-sm mb-1">API Key</label>
            <input className="input input-bordered w-full mb-2" value={key} onChange={e => setKey(e.target.value)} />
            <label className="block text-sm mb-1">Webhook URL</label>
            <input className="input input-bordered w-full mb-2" value={webhook} onChange={e => setWebhook(e.target.value)} />
            <div className="flex justify-end">
              <button className="btn btn-primary" onClick={addApp}>Toevoegen</button>
            </div>
          </div>

          <div className="p-3 border rounded bg-white">
            <div className="space-y-3">
              {apps.length === 0 && <div className="text-sm text-muted-foreground">Geen applicaties toegevoegd.</div>}
              {apps.map(a => (
                <div key={a.id} className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{a.name}</div>
                    {a.description && <div className="text-xs text-muted-foreground">{a.description}</div>}
                    <div className="text-xs text-muted-foreground mt-1">API: {a.apiKey ? '✓' : '—'}  •  Webhook: {a.webhook ? a.webhook : '—'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="btn btn-sm" onClick={() => { setName(a.name); setDesc(a.description ?? ''); setKey(a.apiKey ?? ''); setWebhook(a.webhook ?? ''); }}>Edit</button>
                    <button className="btn btn-sm btn-destructive" onClick={() => setConfirmDeleteId(a.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
