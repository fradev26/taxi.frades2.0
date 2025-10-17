import React, { useEffect, useState } from "react";
import { saveAdminSetting, getAdminSetting } from "@/lib/adminSettingsApi";

const defaultPolicy = {
  minLength: 12,
  requireUpper: true,
  requireLower: true,
  requireNumber: true,
  requireSpecial: true,
  expireDays: 180,
  noReuse: true
};

export default function PasswordPolicy() {
  const [policy, setPolicy] = useState(defaultPolicy);
  const [testPassword, setTestPassword] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const STORAGE_KEY = "admin:passwordPolicy";

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.policy) setPolicy(parsed.policy);
        if (parsed.log) setLog(parsed.log);
        if (parsed.lastSaved) setLastSaved(parsed.lastSaved);
      }
      // try backend
      (async () => {
        const res = await getAdminSetting(STORAGE_KEY);
        if (res && res.data) {
          setPolicy(res.data.policy ?? policy);
          setLog(res.data.log ?? log);
          setLastSaved(res.data.lastSaved ?? lastSaved);
        }
      })();
    } catch (e) {
      // ignore
    }
  }, []);

  function validatePassword(pw: string) {
    const errors = [];
    if (pw.length < policy.minLength) errors.push(`Minimaal ${policy.minLength} tekens.`);
    if (policy.requireUpper && !/[A-Z]/.test(pw)) errors.push("Minstens één hoofdletter.");
    if (policy.requireLower && !/[a-z]/.test(pw)) errors.push("Minstens één kleine letter.");
    if (policy.requireNumber && !/[0-9]/.test(pw)) errors.push("Minstens één cijfer.");
    if (policy.requireSpecial && !/[!@#$%^&*]/.test(pw)) errors.push("Minstens één speciaal teken (!@#$%^&*)");
    return errors;
  }

  const errors = validatePassword(testPassword);

  function handleSave() {
    const entry = `Wachtwoordbeleid opgeslagen (${new Date().toLocaleString()})`;
    const newLog = [entry, ...log];
    setLog(newLog);
    const savedAt = new Date().toISOString();
    setLastSaved(savedAt);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ policy, log: newLog, lastSaved: savedAt }));
    // save to backend (best-effort)
    saveAdminSetting(STORAGE_KEY, { policy, log: newLog, lastSaved: savedAt }).catch(() => {});
    alert("Wachtwoordbeleid opgeslagen!");
  }

  // Ctrl+S to save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [policy, log]);

  function exportPolicy() {
    const blob = new Blob([JSON.stringify({ policy, lastSaved }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `password-policy-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importPolicy(file: File | null) {
    if (!file) return;
    const txt = await file.text();
    try {
      const parsed = JSON.parse(txt);
      if (parsed.policy) {
        setPolicy(parsed.policy);
        setLog(l => [`Geïmporteerd beleid op ${new Date().toLocaleString()}`, ...l]);
      }
    } catch (e) {
      alert("Ongeldig bestand");
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Wachtwoordbeleid</h2>
      <p className="mb-4">Stel hier het wachtwoordbeleid in voor alle gebruikers. Pas eisen aan en test direct een voorbeeldwachtwoord.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block font-medium mb-1">Minimale lengte</label>
          <input type="number" min={8} max={32} value={policy.minLength} onChange={e => setPolicy(p => ({ ...p, minLength: Number(e.target.value) }))} className="input input-bordered w-full mb-2" />
          <label className="inline-flex items-center mb-2">
            <input type="checkbox" checked={policy.requireUpper} onChange={e => setPolicy(p => ({ ...p, requireUpper: e.target.checked }))} className="mr-2" /> Hoofdletter verplicht
          </label>
          <label className="inline-flex items-center mb-2">
            <input type="checkbox" checked={policy.requireLower} onChange={e => setPolicy(p => ({ ...p, requireLower: e.target.checked }))} className="mr-2" /> Kleine letter verplicht
          </label>
          <label className="inline-flex items-center mb-2">
            <input type="checkbox" checked={policy.requireNumber} onChange={e => setPolicy(p => ({ ...p, requireNumber: e.target.checked }))} className="mr-2" /> Cijfer verplicht
          </label>
          <label className="inline-flex items-center mb-2">
            <input type="checkbox" checked={policy.requireSpecial} onChange={e => setPolicy(p => ({ ...p, requireSpecial: e.target.checked }))} className="mr-2" /> Speciaal teken verplicht
          </label>
          <label className="inline-flex items-center mb-2">
            <input type="checkbox" checked={policy.noReuse} onChange={e => setPolicy(p => ({ ...p, noReuse: e.target.checked }))} className="mr-2" /> Geen hergebruik
          </label>
          <label className="block font-medium mb-1 mt-2">Vervaldatum wachtwoord (dagen)</label>
          <input type="number" min={30} max={365} value={policy.expireDays} onChange={e => setPolicy(p => ({ ...p, expireDays: Number(e.target.value) }))} className="input input-bordered w-full mb-2" />
        </div>
        <div>
          <label className="block font-medium mb-1">Test wachtwoord</label>
          <input type="text" value={testPassword} onChange={e => setTestPassword(e.target.value)} className="input input-bordered w-full mb-2" placeholder="Voer een wachtwoord in..." />
          <ul className="list-disc pl-6 text-sm mb-2">
            {testPassword && errors.length === 0 ? (
              <li className="text-green-700">Wachtwoord voldoet aan alle eisen</li>
            ) : errors.map((err, i) => <li key={i} className="text-red-700">{err}</li>)}
          </ul>
        </div>
      </div>
      <button className="btn btn-primary mb-4" onClick={handleSave}>Wachtwoordbeleid opslaan</button>
      <div className="flex gap-2 mb-4">
        <button className="btn btn-secondary" onClick={exportPolicy}>Exporteren (JSON)</button>
        <label className="btn btn-ghost">
          Importeren
          <input type="file" accept="application/json" className="hidden" onChange={e => importPolicy(e.target.files?.[0] ?? null)} />
        </label>
      </div>
      {lastSaved && <div className="text-xs text-muted-foreground mb-4">Laatst opgeslagen: {new Date(lastSaved).toLocaleString()}</div>}
      <div className="bg-gray-50 p-4 rounded mb-4">
        <strong>Log:</strong>
        <div className="text-xs mt-2 max-h-32 overflow-auto">
          {log.length === 0 ? <span className="text-muted-foreground">Nog geen acties.</span> : log.map((entry, i) => <div key={i}>{entry}</div>)}
        </div>
      </div>
    </div>
  );
}
