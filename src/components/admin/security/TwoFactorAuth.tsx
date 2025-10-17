import React, { useEffect, useState } from "react";
import { saveAdminSetting, getAdminSetting } from "@/lib/adminSettingsApi";

export default function TwoFactorAuth() {
  const [enabled, setEnabled] = useState(false);
  const [method, setMethod] = useState("app");
  const [log, setLog] = useState<string[]>([]);
  const STORAGE_KEY = "admin:twoFactor";
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.enabled !== undefined) setEnabled(parsed.enabled);
        if (parsed.method) setMethod(parsed.method);
        if (parsed.log) setLog(parsed.log);
        if (parsed.lastSaved) setLastSaved(parsed.lastSaved);
      }
      (async () => {
        const res = await getAdminSetting(STORAGE_KEY);
        if (res && res.data) {
          setEnabled(res.data.enabled ?? enabled);
          setMethod(res.data.method ?? method);
          setLog(res.data.log ?? log);
          setLastSaved(res.data.lastSaved ?? lastSaved);
        }
      })();
    } catch (e) {}
  }, []);

  function handleToggle() {
    setEnabled(e => {
      setLog(l => [
        `2FA ${!e ? "geactiveerd" : "uitgeschakeld"} (${method}) op ${new Date().toLocaleString()}`,
        ...l
      ]);
      const savedAt = new Date().toISOString();
      const stored = { enabled: !e, method, log: [ `2FA ${!e ? "geactiveerd" : "uitgeschakeld"} (${method}) op ${new Date().toLocaleString()}`, ...log ], lastSaved: savedAt };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      setLastSaved(savedAt);
      saveAdminSetting(STORAGE_KEY, stored).catch(() => {});
      return !e;
    });
  }

  function handleMethodChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setMethod(e.target.value);
    setLog(l => [
      `2FA methode gewijzigd naar ${e.target.value} (${new Date().toLocaleString()})`,
      ...l
    ]);
    const stored = { enabled, method: e.target.value, log: [`2FA methode gewijzigd naar ${e.target.value} (${new Date().toLocaleString()})`, ...log], lastSaved: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    saveAdminSetting(STORAGE_KEY, stored).catch(() => {});
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Two-factor authentication</h2>
      <p className="mb-4">Activeer two-factor authenticatie (2FA) voor extra bescherming van accounts. Kies een methode en bekijk de status.</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Verificatie via SMS of Authenticator-app</li>
        <li>Verplicht voor admins</li>
        <li>Optioneel voor gebruikers</li>
      </ul>
      <div className="mb-4">
        <label className="block font-medium mb-1">Methode</label>
        <select className="input input-bordered w-full mb-2" value={method} onChange={handleMethodChange}>
          <option value="app">Authenticator-app</option>
          <option value="sms">SMS</option>
        </select>
        <span className={`inline-block px-3 py-1 rounded ${enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          Status: {enabled ? `Geactiveerd (${method})` : "Uitgeschakeld"}
        </span>
      </div>
      <button className="btn btn-primary mb-4" onClick={handleToggle}>
        {enabled ? "Uitschakelen" : "Activeren"} 2FA
      </button>
      <div className="flex gap-2 mb-4">
        <button className="btn btn-secondary" onClick={() => { navigator.clipboard?.writeText(JSON.stringify({ enabled, method })); alert('2FA instellingen gekopieerd naar clipboard'); }}>Kopieer instellingen</button>
        <button className="btn btn-ghost" onClick={() => { setLog([]); localStorage.removeItem(STORAGE_KEY); alert('2FA instellingen gereset'); }}>Reset</button>
      </div>
      {lastSaved && <div className="text-xs text-muted-foreground mb-4">Laatst gewijzigd: {new Date(lastSaved).toLocaleString()}</div>}
      <div className="bg-gray-50 p-4 rounded mb-4">
        <strong>Log:</strong>
        <div className="text-xs mt-2 max-h-32 overflow-auto">
          {log.length === 0 ? <span className="text-muted-foreground">Nog geen acties.</span> : log.map((entry, i) => <div key={i}>{entry}</div>)}
        </div>
      </div>
    </div>
  );
}
