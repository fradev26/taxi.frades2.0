import { useState } from "react";

const defaultTemplates = [
  { key: "confirmation", label: "Bevestiging", value: "Beste {{naam}}, uw rit op {{datum}} is bevestigd.", version: 1 },
  { key: "cancellation", label: "Annulering", value: "Beste {{naam}}, uw rit op {{datum}} is geannuleerd.", version: 1 },
  { key: "reminder", label: "Herinnering", value: "Vergeet uw rit op {{datum}} niet, {{naam}}!", version: 1 }
];

export default function Templates() {
  const [templates, setTemplates] = useState(defaultTemplates);
  const [selected, setSelected] = useState(0);
  const [preview, setPreview] = useState("");
  const [log, setLog] = useState<string[]>([]);

  // Variabelen voor preview
  const variables = {
    naam: "Jan",
    datum: "12-10-2025"
  };

  // Preview template
  const handlePreview = () => {
    let content = templates[selected].value;
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replaceAll(`{{${key}}}`, value);
    });
    setPreview(content);
    setLog(l => [
      `Preview van template '${templates[selected].label}' op ${new Date().toLocaleString()}`,
      ...l
    ]);
  };

  // Versiebeheer: nieuwe versie opslaan
  const saveNewVersion = () => {
    setTemplates(ts => ts.map((t, i) => i === selected ? { ...t, version: t.version + 1 } : t));
    setLog(l => [
      `Nieuwe versie (${templates[selected].version + 1}) van '${templates[selected].label}' opgeslagen op ${new Date().toLocaleString()}`,
      ...l
    ]);
  };

  const handleTemplateChange = (key: string, value: string) => {
    setTemplates(t => t.map(temp => temp.key === key ? { ...temp, value } : temp));
  };

  return (
    <div className="mb-6 p-4 rounded-lg bg-white shadow border">
      <h4 className="font-semibold text-base mb-2">Templates</h4>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Selecteer template</label>
        <select className="input input-bordered w-full" value={selected} onChange={e => setSelected(Number(e.target.value))}>
          {templates.map((t, i) => <option key={t.key} value={i}>{t.label} (v{t.version})</option>)}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Bewerk template</label>
        <textarea className="textarea textarea-bordered w-full" value={templates[selected].value} onChange={e => handleTemplateChange(templates[selected].key, e.target.value)} />
        <div className="flex gap-2 mt-2">
          <button className="btn btn-sm btn-secondary" onClick={handlePreview}>Preview</button>
          <button className="btn btn-sm btn-primary" onClick={saveNewVersion}>Nieuwe versie opslaan</button>
        </div>
      </div>
      {preview && <div className="mb-4 p-2 bg-gray-100 rounded text-sm"><strong>Preview:</strong> {preview}</div>}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Log template acties</label>
        <div className="bg-gray-100 rounded p-2 text-xs max-h-32 overflow-auto">
          {log.length === 0 ? <span className="text-muted-foreground">Nog geen acties.</span> : log.map((entry, i) => <div key={i}>{entry}</div>)}
        </div>
      </div>
      <div className="mb-2 text-xs text-muted-foreground">Beschikbare variabelen: <code>{Object.keys(variables).join(", ")}</code></div>
    </div>
  );
}
