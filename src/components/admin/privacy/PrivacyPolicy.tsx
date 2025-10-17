import React, { useEffect, useState } from "react";
import { saveAdminSetting, getAdminSetting } from "@/lib/adminSettingsApi";

const defaultText = `Wij verzamelen alleen noodzakelijke gegevens voor het uitvoeren van taxidiensten. Gegevens worden niet gedeeld met derden zonder toestemming. Je hebt altijd recht op inzage, correctie en verwijdering van je gegevens.`;

export default function PrivacyPolicy() {
  const [text, setText] = useState(defaultText);
  const [preview, setPreview] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const STORAGE_KEY = "admin:privacyPolicy";
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.text) setText(parsed.text);
        if (parsed.log) setLog(parsed.log);
        if (parsed.lastSaved) setLastSaved(parsed.lastSaved);
      }
      (async () => {
        const res = await getAdminSetting(STORAGE_KEY);
        if (res && res.data) {
          setText(res.data.text ?? text);
          setLog(res.data.log ?? log);
          setLastSaved(res.data.lastSaved ?? lastSaved);
        }
      })();
    } catch (e) {}
  }, []);

  function handleSave() {
    const entry = `Privacyverklaring opgeslagen (${new Date().toLocaleString()})`;
    const newLog = [entry, ...log];
    setLog(newLog);
    const savedAt = new Date().toISOString();
    setLastSaved(savedAt);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ text, log: newLog, lastSaved: savedAt }));
    saveAdminSetting(STORAGE_KEY, { text, log: newLog, lastSaved: savedAt }).catch(() => {});
    alert("Privacyverklaring opgeslagen!");
  }

  function handlePreview() {
    setPreview(text);
    setLog(l => [
      `Preview bekeken (${new Date().toLocaleString()})`,
      ...l
    ]);
  }

  function exportText() {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `privacy-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importText(file: File | null) {
    if (!file) return;
    const txt = await file.text();
    setText(txt);
    setLog(l => [`Geïmporteerd privacytekst op ${new Date().toLocaleString()}`, ...l]);
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Privacyverklaring</h2>
      <p className="mb-4">Hier kun je de privacyverklaring bewerken, opslaan en een preview bekijken.</p>
      <textarea className="textarea textarea-bordered w-full mb-4" value={text} onChange={e => setText(e.target.value)} rows={8} />
      <div className="flex gap-2 mb-4">
        <button className="btn btn-secondary" onClick={handlePreview}>Preview</button>
        <button className="btn btn-primary" onClick={handleSave}>Privacyverklaring opslaan</button>
        <button className="btn btn-ghost" onClick={exportText}>Exporteren</button>
        <label className="btn btn-ghost">
          Importeren
          <input type="file" accept="text/*" className="hidden" onChange={e => importText(e.target.files?.[0] ?? null)} />
        </label>
      </div>
      {preview && (
        <div className="bg-gray-50 p-4 rounded mb-4">
          <strong>Preview:</strong>
          <pre className="mt-2 text-xs bg-white p-2 rounded border">{preview}</pre>
        </div>
      )}
      <div className="bg-gray-50 p-4 rounded mb-4">
        <strong>Log:</strong>
        <div className="text-xs mt-2 max-h-32 overflow-auto">
          {log.length === 0 ? <span className="text-muted-foreground">Nog geen acties.</span> : log.map((entry, i) => <div key={i}>{entry}</div>)}
        </div>
      </div>
      {lastSaved && <div className="text-xs text-muted-foreground">Laatst opgeslagen: {new Date(lastSaved).toLocaleString()}</div>}
    </div>
  );
}
