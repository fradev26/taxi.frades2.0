import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Chauffeur {
  id: string;
  display_name: string;
  email: string;
  phone?: string;
  company_name?: string;
  btw_number?: string;
  address?: string;
}

export default function SimpleChauffeursList() {
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [form, setForm] = useState({
    display_name: "",
    email: "",
    phone: "",
    company_name: "",
    btw_number: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchChauffeurs();
  }, []);

  async function fetchChauffeurs() {
    setLoading(true);
    setError("");
    const { data, error } = await supabase.from("chauffeurs").select("*");
    if (error) setError(error.message);
    setChauffeurs(data || []);
    setLoading(false);
  }

  async function addChauffeur(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { display_name, email, phone, company_name, btw_number, address } = form;
    const { error } = await supabase.from("chauffeurs").insert([
      { display_name, email, phone, company_name, btw_number, address }
    ]);
    if (error) setError(error.message);
    else {
      setForm({ display_name: "", email: "", phone: "", company_name: "", btw_number: "", address: "" });
      fetchChauffeurs();
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <h2>Chauffeurslijst</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <form onSubmit={addChauffeur} style={{ marginBottom: 20 }}>
        <input
          placeholder="Naam"
          value={form.display_name}
          onChange={e => setForm({ ...form, display_name: e.target.value })}
          required
        />
        <input
          placeholder="E-mail"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          placeholder="Telefoon"
          value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
        />
        <input
          placeholder="Bedrijf"
          value={form.company_name}
          onChange={e => setForm({ ...form, company_name: e.target.value })}
        />
        <input
          placeholder="BTW nummer"
          value={form.btw_number}
          onChange={e => setForm({ ...form, btw_number: e.target.value })}
        />
        <input
          placeholder="Adres"
          value={form.address}
          onChange={e => setForm({ ...form, address: e.target.value })}
        />
        <button type="submit" disabled={loading}>Toevoegen</button>
      </form>
      {loading ? <div>Laden...</div> : null}
      <ul>
        {chauffeurs.map(ch => (
          <li key={ch.id}>
            <b>{ch.display_name}</b> ({ch.email})<br />
            {ch.phone && <>Tel: {ch.phone}<br /></>}
            {ch.company_name && <>Bedrijf: {ch.company_name}<br /></>}
            {ch.btw_number && <>BTW: {ch.btw_number}<br /></>}
            {ch.address && <>Adres: {ch.address}<br /></>}
          </li>
        ))}
      </ul>
    </div>
  );
}
