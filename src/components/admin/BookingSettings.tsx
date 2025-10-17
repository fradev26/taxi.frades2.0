import { useState } from "react";

export default function BookingSettings() {
  const [minBookingDuration, setMinBookingDuration] = useState(1);
  const [maxBookingDuration, setMaxBookingDuration] = useState(24);
  const [durationError, setDurationError] = useState("");
  const [cancellationPolicy, setCancellationPolicy] = useState("");
  const [autoConfirm, setAutoConfirm] = useState(false);
  const [bookingStatus, setBookingStatus] = useState("In behandeling");
  // Advanced options
  const [bookingWindowStart, setBookingWindowStart] = useState("06:00");
  const [bookingWindowEnd, setBookingWindowEnd] = useState("23:00");
  const [prepaymentRequired, setPrepaymentRequired] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [bookingBufferMinutes, setBookingBufferMinutes] = useState(15);
  const [defaultPickupLocation, setDefaultPickupLocation] = useState("");
  const [blockHolidays, setBlockHolidays] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Validation
  const validate = () => {
    let valid = true;
    setDurationError("");
    if (minBookingDuration < 1 || maxBookingDuration < 1 || minBookingDuration > maxBookingDuration) {
      setDurationError("Minimum moet kleiner zijn dan maximum en beide positief.");
      valid = false;
    }
    return valid;
  };

  // Simulate save
  const handleSave = () => {
    if (!validate()) {
      setSaveStatus(null);
      return;
    }
    setSaveStatus("Boekingsinstellingen opgeslagen!");
    setTimeout(() => setSaveStatus(null), 2500);
  };

  return (
    <section className="p-4 rounded-lg bg-gray-50 shadow-sm">
      <h3 className="font-semibold text-lg mb-2">Boekingsinstellingen</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-1 font-medium" htmlFor="minBooking">Minimum boekingsduur (uur)</label>
          <input id="minBooking" type="number" min={1} value={minBookingDuration} onChange={e => setMinBookingDuration(Number(e.target.value))} className={`input input-bordered w-full ${durationError ? 'border-red-500' : ''}`} />
        </div>
        <div>
          <label className="block mb-1 font-medium" htmlFor="maxBooking">Maximum boekingsduur (uur)</label>
          <input id="maxBooking" type="number" min={1} value={maxBookingDuration} onChange={e => setMaxBookingDuration(Number(e.target.value))} className={`input input-bordered w-full ${durationError ? 'border-red-500' : ''}`} />
        </div>
      </div>
      {durationError && <div className="text-red-500 text-sm mb-2">{durationError}</div>}
      <div className="mb-4">
        <label className="block mb-1 font-medium" htmlFor="cancellationPolicy">Annuleringsvoorwaarden</label>
        <textarea id="cancellationPolicy" value={cancellationPolicy} onChange={e => setCancellationPolicy(e.target.value)} className="textarea textarea-bordered w-full" placeholder="Annuleringsvoorwaarden" />
      </div>
      <div className="mb-4">
        <label className="inline-flex items-center">
          <input type="checkbox" checked={autoConfirm} onChange={e => setAutoConfirm(e.target.checked)} className="mr-2" /> Automatische bevestiging
        </label>
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium" htmlFor="bookingStatus">Standaard status bij nieuwe boeking</label>
        <select id="bookingStatus" className="input input-bordered w-full" value={bookingStatus} onChange={e => setBookingStatus(e.target.value)}>
          <option>In behandeling</option>
          <option>Bevestigd</option>
          <option>Geannuleerd</option>
        </select>
      </div>
      {/* Advanced options */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-1 font-medium" htmlFor="bookingWindowStart">Boekingsvenster start</label>
          <input id="bookingWindowStart" type="time" value={bookingWindowStart} onChange={e => setBookingWindowStart(e.target.value)} className="input input-bordered w-full" />
        </div>
        <div>
          <label className="block mb-1 font-medium" htmlFor="bookingWindowEnd">Boekingsvenster einde</label>
          <input id="bookingWindowEnd" type="time" value={bookingWindowEnd} onChange={e => setBookingWindowEnd(e.target.value)} className="input input-bordered w-full" />
        </div>
      </div>
      <div className="mb-4">
        <label className="inline-flex items-center mr-6"><input type="checkbox" checked={prepaymentRequired} onChange={e => setPrepaymentRequired(e.target.checked)} className="mr-2" /> Vooruitbetaling vereist</label>
        <label className="inline-flex items-center"><input type="checkbox" checked={reminderEnabled} onChange={e => setReminderEnabled(e.target.checked)} className="mr-2" /> Herinnering inschakelen</label>
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium" htmlFor="bookingBuffer">Buffer tussen boekingen (minuten)</label>
        <input id="bookingBuffer" type="number" min={0} value={bookingBufferMinutes} onChange={e => setBookingBufferMinutes(Number(e.target.value))} className="input input-bordered w-full" />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium" htmlFor="pickupLocation">Standaard ophaallocatie</label>
        <input id="pickupLocation" type="text" value={defaultPickupLocation} onChange={e => setDefaultPickupLocation(e.target.value)} className="input input-bordered w-full" placeholder="Ophaallocatie" />
      </div>
      <div className="mb-4">
        <label className="inline-flex items-center"><input type="checkbox" checked={blockHolidays} onChange={e => setBlockHolidays(e.target.checked)} className="mr-2" /> Boekingen blokkeren op feestdagen</label>
      </div>
      <button className="mt-2 px-6 py-2 bg-primary text-white rounded shadow" onClick={handleSave}>Instellingen opslaan</button>
      {saveStatus && <div className="text-green-600 mt-2">{saveStatus}</div>}
    </section>
  );
}