import { StatsDashboard } from "./StatsDashboard";

export default function StatsSettings() {
  return (
    <section className="p-4 rounded-lg bg-gray-50 shadow-sm">
      <h3 className="font-semibold text-lg mb-2">Statistieken & Rapportage</h3>
      <div className="mb-6">
        <StatsDashboard />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Export van data</label>
        <button className="btn-luxury" disabled title="Export volgt later">Exporteren als CSV</button>
        <button className="btn-luxury ml-2" disabled title="Export volgt later">Exporteren als PDF</button>
        <span className="ml-3 text-xs text-muted-foreground">Exportfunctionaliteit wordt later toegevoegd</span>
      </div>
    </section>
  );
}