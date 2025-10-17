import { useState } from "react";

export default function ExtraSettings() {
  const [showFleetTab, setShowFleetTab] = useState(false);
  const [showDriversTab, setShowDriversTab] = useState(false);
  return (
    <section className="p-4 rounded-lg bg-gray-50 shadow-sm">
      <h3 className="font-semibold text-lg mb-2">Extra</h3>
      <div className="mb-4">
        <label className="inline-flex items-center"><input type="checkbox" checked={showFleetTab} onChange={e => setShowFleetTab(e.target.checked)} className="mr-2" /> Voertuigen Admin activeren</label>
        <label className="inline-flex items-center ml-4"><input type="checkbox" checked={showDriversTab} onChange={e => setShowDriversTab(e.target.checked)} className="mr-2" /> Chauffeurs Admin activeren</label>
      </div>
    </section>
  );
}