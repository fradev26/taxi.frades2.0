import { useState } from "react";

type MessageType = "info" | "warning" | "success" | "error";

interface SystemMessage {
  id: number;
  type: MessageType;
  content: string;
  scheduled: boolean;
  scheduleDate?: string;
}

const initialMessages: SystemMessage[] = [
  { id: 1, type: "info", content: "Welkom bij TaxiFrades!", scheduled: false },
  { id: 2, type: "warning", content: "Let op: onderhoud op 15/10.", scheduled: true, scheduleDate: "2025-10-15" }
];

export default function SystemMessages() {
  const [messages, setMessages] = useState<SystemMessage[]>(initialMessages);
  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState<MessageType>("info");
  const [scheduled, setScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [log, setLog] = useState<string[]>([]);

  // Voeg nieuwe melding toe
  const addMessage = () => {
    if (!newContent.trim()) return;
    const newMsg: SystemMessage = {
      id: Date.now(),
      type: newType,
      content: newContent,
      scheduled,
      scheduleDate: scheduled ? scheduleDate : undefined
    };
    setMessages(msgs => [newMsg, ...msgs]);
    setLog(l => [
      `Melding toegevoegd (${newType}): '${newContent}'${scheduled ? ` gepland op ${scheduleDate}` : ""} (${new Date().toLocaleString()})`,
      ...l
    ]);
    setNewContent("");
    setScheduled(false);
    setScheduleDate("");
  };

  // Verwijder melding
  const removeMessage = (id: number) => {
    setMessages(msgs => msgs.filter(m => m.id !== id));
    setLog(l => [
      `Melding verwijderd (ID: ${id}) (${new Date().toLocaleString()})`,
      ...l
    ]);
  };

  return (
    <div className="mb-6 p-4 rounded-lg bg-white shadow border">
      <h4 className="font-semibold text-base mb-2">Systeemmeldingen</h4>
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select className="input input-bordered w-full mb-2" value={newType} onChange={e => setNewType(e.target.value as MessageType)}>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Melding</label>
          <input type="text" className="input input-bordered w-full mb-2" value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Systeemmelding..." />
          <label className="inline-flex items-center mt-2">
            <input type="checkbox" checked={scheduled} onChange={e => setScheduled(e.target.checked)} className="mr-2" />
            Gepland
          </label>
          {scheduled && (
            <input type="date" className="input input-bordered w-full mt-2" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
          )}
          <button className="btn btn-sm btn-primary mt-2" onClick={addMessage}>Toevoegen</button>
        </div>
      </div>
      <ul className="mb-4">
        {messages.map(msg => (
          <li key={msg.id} className="mb-2 flex items-center justify-between">
            <div>
              <span className={`font-semibold mr-2 ${msg.type === 'warning' ? 'text-yellow-600' : msg.type === 'error' ? 'text-red-600' : msg.type === 'success' ? 'text-green-600' : 'text-gray-700'}`}>{msg.type.toUpperCase()}:</span>
              {msg.content}
              {msg.scheduled && <span className="ml-2 text-xs text-muted-foreground">(Gepland: {msg.scheduleDate})</span>}
            </div>
            <button className="btn btn-xs btn-error ml-2" onClick={() => removeMessage(msg.id)}>Verwijder</button>
          </li>
        ))}
      </ul>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Log systeemmeldingen</label>
        <div className="bg-gray-100 rounded p-2 text-xs max-h-32 overflow-auto">
          {log.length === 0 ? <span className="text-muted-foreground">Nog geen acties.</span> : log.map((entry, i) => <div key={i}>{entry}</div>)}
        </div>
      </div>
    </div>
  );
}
