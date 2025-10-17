export default function SystemSettings() {
  return (
    <section className="p-4 rounded-lg bg-gray-50 shadow-sm">
      <h3 className="font-semibold text-lg mb-2">Systeem & Geavanceerd</h3>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Backups en herstel</label>
        <button className="btn-luxury">Backup maken</button>
        <button className="btn-luxury ml-2">Herstel uitvoeren</button>
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Systeemstatus/monitoring</label>
        <input type="text" className="input input-bordered w-full" placeholder="Status/monitoring..." />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Logging en audit trail</label>
        <input type="text" className="input input-bordered w-full" placeholder="Logging/audit trail..." />
      </div>
    </section>
  );
}