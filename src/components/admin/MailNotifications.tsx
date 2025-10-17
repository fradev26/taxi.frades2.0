import { useState } from "react";

const defaultTemplates = {
  confirmation: "Beste klant, uw rit is bevestigd.",
  cancellation: "Uw rit is geannuleerd.",
  reminder: "Vergeet uw rit niet!"
};

export default function MailNotifications() {
  const [enabled, setEnabled] = useState(true);
  const [smtpServer, setSmtpServer] = useState("");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [fromAddress, setFromAddress] = useState("noreply@frades.be");
  const [replyTo, setReplyTo] = useState("");
  const [recipients, setRecipients] = useState(["test@frades.be"]);
  const [selectedType, setSelectedType] = useState("confirmation");
  const [templates, setTemplates] = useState(defaultTemplates);
  const [preview, setPreview] = useState("");
  const [log, setLog] = useState<string[]>([]);

  // Preview template
  const handlePreview = () => {
    setPreview(templates[selectedType].replace("klant", "Jan Jansen"));
  };

  // Simuleer testmail
  const sendTestMail = () => {
    setLog(l => [
      `Testmail (${selectedType}) verstuurd naar ${recipients.join(", ")} op ${new Date().toLocaleString()}`,
      ...l
    ]);
    alert("Testmail verstuurd!");
  };

  // Toggle e-mailtypes
  const types = ["confirmation", "cancellation", "reminder"];

  return (
    <div className="mb-6 p-4 rounded-lg bg-white shadow border">
      <h4 className="font-semibold text-base mb-2">E-mail notificaties</h4>
      <label className="inline-flex items-center mb-2">
        <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} className="mr-2" />
        Inschakelen
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">SMTP server</label>
          <input type="text" className="input input-bordered w-full mb-2" value={smtpServer} onChange={e => setSmtpServer(e.target.value)} placeholder="smtp.sendgrid.net" />
          <label className="block text-sm font-medium mb-1">SMTP gebruiker</label>
          <input type="text" className="input input-bordered w-full mb-2" value={smtpUser} onChange={e => setSmtpUser(e.target.value)} placeholder="apikey" />
          <label className="block text-sm font-medium mb-1">SMTP wachtwoord/API key</label>
          <input type="password" className="input input-bordered w-full mb-2" value={smtpPass} onChange={e => setSmtpPass(e.target.value)} placeholder="API key" />
          <label className="block text-sm font-medium mb-1">API key (optioneel)</label>
          <input type="text" className="input input-bordered w-full mb-2" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="SendGrid API key" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Van adres</label>
          <input type="email" className="input input-bordered w-full mb-2" value={fromAddress} onChange={e => setFromAddress(e.target.value)} placeholder="noreply@frades.be" />
          <label className="block text-sm font-medium mb-1">Reply-to adres</label>
          <input type="email" className="input input-bordered w-full mb-2" value={replyTo} onChange={e => setReplyTo(e.target.value)} placeholder="support@frades.be" />
          <label className="block text-sm font-medium mb-1">Ontvangers (komma gescheiden)</label>
          <input type="text" className="input input-bordered w-full mb-2" value={recipients.join(", ")} onChange={e => setRecipients(e.target.value.split(",").map(s => s.trim()))} placeholder="test@frades.be, admin@frades.be" />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">E-mailtype</label>
        <select className="input input-bordered w-full" value={selectedType} onChange={e => setSelectedType(e.target.value)}>
          {types.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Template</label>
        <textarea className="textarea textarea-bordered w-full" value={templates[selectedType]} onChange={e => setTemplates(t => ({ ...t, [selectedType]: e.target.value }))} />
        <button className="btn btn-sm btn-secondary mt-2 mr-2" onClick={handlePreview}>Preview</button>
        <button className="btn btn-sm btn-primary mt-2" onClick={sendTestMail}>Testmail versturen</button>
      </div>
      {preview && <div className="mb-4 p-2 bg-gray-100 rounded text-sm"><strong>Preview:</strong> {preview}</div>}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Log verzonden e-mails</label>
        <div className="bg-gray-100 rounded p-2 text-xs max-h-32 overflow-auto">
          {log.length === 0 ? <span className="text-muted-foreground">Nog geen e-mails verzonden.</span> : log.map((entry, i) => <div key={i}>{entry}</div>)}
        </div>
      </div>
    </div>
  );
}
