import { useState } from "react";

export default function PriceSettings() {
  const [pricePerKm, setPricePerKm] = useState(2.5);
  const [pricePerHour, setPricePerHour] = useState(40);
  return (
    <section className="p-4 rounded-lg bg-gray-50 shadow-sm">
      <h3 className="font-semibold text-lg mb-2">Prijzen</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-1 font-medium">Prijs per km</label>
          <input type="number" min={0} value={pricePerKm} onChange={e => setPricePerKm(Number(e.target.value))} className="input input-bordered w-full" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Prijs per uur</label>
          <input type="number" min={0} value={pricePerHour} onChange={e => setPricePerHour(Number(e.target.value))} className="input input-bordered w-full" />
        </div>
      </div>
    </section>
  );
}