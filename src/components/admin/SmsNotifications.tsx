import { useState } from "react";

const defaultTemplates = {
  confirmation: "Uw rit is bevestigd.",
  cancellation: "Uw rit is geannuleerd.",
  reminder: "Vergeet uw rit niet!"
};

export default function SmsNotifications() {
  const [enabled, setEnabled] = useState(false);
  const [provider, setProvider] = useState("Twilio");
  const [apiKey, setApiKey] = useState("");
  const [sender, setSender] = useState("TaxiFrades");
  const [testNumbers, setTestNumbers] = useState(["+32470123456"]);
  const [selectedType, setSelectedType] = useState("confirmation");
  const [templates, setTemplates] = useState(defaultTemplates);
  const [preview, setPreview] = useState("");
  const [log, setLog] = useState<string[]>([]);

  // Preview template
  const handlePreview = () => {
    setPreview(templates[selectedType].replace("rit", "taxirit"));
  };

  // Simuleer test-SMS
  const sendTestSms = () => {
    setLog(l => [
      `Test SMS (${selectedType}) verstuurd naar ${testNumbers.join(", ")} op ${new Date().toLocaleString()}`,
      ...l
    ]);
    alert("Test SMS verstuurd!");
  };

  // Toggle SMS-types
  const types = ["confirmation", "cancellation", "reminder"];

  return (
    <div className="mb-6 p-4 rounded-lg bg-white shadow border">
      <h4 className="font-semibold text-base mb-2">SMS notificaties</h4>
      <label className="inline-flex items-center mb-2">
        <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} className="mr-2" />
        Inschakelen
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Provider</label>
          <select className="input input-bordered w-full mb-2" value={provider} onChange={e => setProvider(e.target.value)}>
            <option value="Twilio">Twilio</option>
            <option value="MessageBird">MessageBird</option>
            <option value="Other">Other</option>
          </select>
          <label className="block text-sm font-medium mb-1">API key</label>
          <input type="text" className="input input-bordered w-full mb-2" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="API key" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Afzender</label>
          <input type="text" className="input input-bordered w-full mb-2" value={sender} onChange={e => setSender(e.target.value)} placeholder="TaxiFrades" />
          <label className="block text-sm font-medium mb-1">Testnummers (komma gescheiden)</label>
          <input type="text" className="input input-bordered w-full mb-2" value={testNumbers.join(", ")} onChange={e => setTestNumbers(e.target.value.split(",").map(s => s.trim()))} placeholder="+32470123456, +32471234567" />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">SMS-type</label>
        <select className="input input-bordered w-full" value={selectedType} onChange={e => setSelectedType(e.target.value)}>
          {types.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Template</label>
        <textarea className="textarea textarea-bordered w-full" value={templates[selectedType]} onChange={e => setTemplates(t => ({ ...t, [selectedType]: e.target.value }))} />
        <button className="btn btn-sm btn-secondary mt-2 mr-2" onClick={handlePreview}>Preview</button>
        <button className="btn btn-sm btn-primary mt-2" onClick={sendTestSms}>Test SMS versturen</button>
      </div>
      {preview && <div className="mb-4 p-2 bg-gray-100 rounded text-sm"><strong>Preview:</strong> {preview}</div>}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Log verzonden SMS</label>
        <div className="bg-gray-100 rounded p-2 text-xs max-h-32 overflow-auto">
          {log.length === 0 ? <span className="text-muted-foreground">Nog geen SMS verzonden.</span> : log.map((entry, i) => <div key={i}>{entry}</div>)}
        </div>
      </div>
    </div>
  );
}
