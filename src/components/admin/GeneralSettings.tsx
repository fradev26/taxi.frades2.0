import { useState } from "react";

export default function GeneralSettings() {
  const [companyName, setCompanyName] = useState("");
  const [companyNameError, setCompanyNameError] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactEmailError, setContactEmailError] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [language, setLanguage] = useState("Nederlands");
  const [timezone, setTimezone] = useState("Europe/Amsterdam");
  const [currency, setCurrency] = useState("EUR");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Handle logo preview
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogo(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setLogoPreview(null);
    }
  };

  // Simple validation
  const validate = () => {
    let valid = true;
    setCompanyNameError("");
    setContactEmailError("");
    if (!companyName.trim()) {
      setCompanyNameError("Bedrijfsnaam is verplicht.");
      valid = false;
    }
    if (!contactEmail.match(/^\S+@\S+\.\S+$/)) {
      setContactEmailError("Voer een geldig e-mailadres in.");
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
    setSaveStatus("Instellingen opgeslagen!");
    setTimeout(() => setSaveStatus(null), 2500);
  };

  return (
    <section className="p-4 rounded-lg bg-gray-50 shadow-sm">
      <h3 className="font-semibold text-lg mb-2">Algemeen</h3>
      <div className="mb-4">
        <label className="block mb-1 font-medium" htmlFor="companyName">Bedrijfsnaam</label>
        <input id="companyName" type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className={`input input-bordered w-full ${companyNameError ? 'border-red-500' : ''}`} placeholder="Bedrijfsnaam" />
        {companyNameError && <div className="text-red-500 text-sm mt-1">{companyNameError}</div>}
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium" htmlFor="contactEmail">Contact e-mail</label>
        <input id="contactEmail" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className={`input input-bordered w-full ${contactEmailError ? 'border-red-500' : ''}`} placeholder="Contact e-mail" />
        {contactEmailError && <div className="text-red-500 text-sm mt-1">{contactEmailError}</div>}
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium" htmlFor="logoUpload">Logo uploaden</label>
        <input id="logoUpload" type="file" accept="image/*" onChange={handleLogoChange} className="input w-full" />
        {logoPreview && (<div className="mt-2"><img src={logoPreview} alt="Logo preview" className="h-16 rounded shadow" /></div>)}
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium" htmlFor="language">Taal</label>
        <select id="language" className="input input-bordered w-full" value={language} onChange={e => setLanguage(e.target.value)}>
          <option>Nederlands</option>
          <option>Engels</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium" htmlFor="timezone">Tijdzone</label>
        <select id="timezone" className="input input-bordered w-full" value={timezone} onChange={e => setTimezone(e.target.value)}>
          <option>Europe/Brussels</option>
          <option>Europe/Amsterdam</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium" htmlFor="currency">Valuta</label>
        <select id="currency" className="input input-bordered w-full" value={currency} onChange={e => setCurrency(e.target.value)}>
          <option>EUR</option>
          <option>USD</option>
        </select>
      </div>
      <button className="mt-2 px-6 py-2 bg-primary text-white rounded shadow" onClick={handleSave}>Instellingen opslaan</button>
      {saveStatus && <div className="text-green-600 mt-2">{saveStatus}</div>}
    </section>
  );
}