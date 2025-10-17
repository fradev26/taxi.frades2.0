import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function UserSettings() {
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  // Fetch users from Supabase 'profiles' table
  useEffect(() => {
    setLoading(true);
    setError(null);
    supabase
      .from('profiles')
      .select('*')
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
          setLoading(false);
        } else {
          // Map to expected UI format
          setUsers((data || []).map(u => ({
            id: u.id,
            name: u.display_name && u.display_name.trim() ? u.display_name : 'Onbekend',
            phone: u.phone || 'Onbekend',
            role: u.role || 'klant',
            blocked: typeof u.blocked === 'boolean' ? u.blocked : false,
            company_name: u.company_name || '',
            btw_number: u.btw_number || '',
            address: u.address || ''
          })));
          setLoading(false);
        }
      });
  }, []);

  // Filter users
  const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()));

  // Save all user changes
  const handleSaveAll = () => {
    setSaveStatus("Alle gebruikerswijzigingen opgeslagen!");
    setTimeout(() => setSaveStatus(null), 2500);
  };

  // Supabase actions
  const handleBlockUser = async (id: string) => {
    const { error } = await supabase.from('profiles').update({ blocked: true }).eq('id', id);
    if (!error) {
      setUsers(users => users.map(u => u.id === id ? { ...u, blocked: true } : u));
      setActionStatus(`Gebruiker ${id} geblokkeerd.`);
    } else {
      setActionStatus(`Fout bij blokkeren: ${error.message}`);
    }
    setTimeout(() => setActionStatus(null), 2000);
  };
  const handleUnblockUser = async (id: string) => {
    const { error } = await supabase.from('profiles').update({ blocked: false }).eq('id', id);
    if (!error) {
      setUsers(users => users.map(u => u.id === id ? { ...u, blocked: false } : u));
      setActionStatus(`Gebruiker ${id} gedeblokkeerd.`);
    } else {
      setActionStatus(`Fout bij deblokkeren: ${error.message}`);
    }
    setTimeout(() => setActionStatus(null), 2000);
  };
  const handleDeleteUser = async (id: string) => {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (!error) {
      setUsers(users => users.filter(u => u.id !== id));
      setActionStatus(`Gebruiker ${id} verwijderd.`);
    } else {
      setActionStatus(`Fout bij verwijderen: ${error.message}`);
    }
    setTimeout(() => setActionStatus(null), 2000);
  };
  const handleChangeRole = async (id: string, newRole: string) => {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', id);
    if (!error) {
      setUsers(users => users.map(u => u.id === id ? { ...u, role: newRole } : u));
      setActionStatus(`Rol van gebruiker ${id} gewijzigd naar ${newRole}.`);
    } else {
      setActionStatus(`Fout bij rol wijzigen: ${error.message}`);
    }
    setTimeout(() => setActionStatus(null), 2000);
  };

  return (
    <section className="p-4 rounded-lg bg-gray-50 shadow-sm">
      <h3 className="font-semibold text-lg mb-2">Gebruikersbeheer</h3>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Zoek en beheer gebruikers</label>
        <input type="text" className="input input-bordered w-full mb-4" placeholder="Zoek op naam of e-mail..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        {loading ? (
          <div className="text-muted-foreground">Gebruikers worden geladen...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <>
            <div className="space-y-2">
              {filteredUsers.length === 0 && <div className="text-muted-foreground">Geen gebruikers gevonden.</div>}
              {filteredUsers.map(u => (
                <div key={u.id} className={`flex flex-col md:flex-row md:items-center justify-between p-3 rounded border ${u.blocked ? 'bg-red-50' : 'bg-white'} transition-shadow shadow-sm hover:shadow-md`}> 
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <span className="font-medium">{u.name}</span>
                    <span className="text-xs text-muted-foreground">({u.email})</span>
                    <span className="ml-2 text-xs text-blue-600">{u.role}</span>
                    {u.blocked && <span className="ml-2 text-red-500 text-xs">Geblokkeerd</span>}
                  </div>
                  <div className="flex gap-2 mt-2 md:mt-0">
                    <select
                      className="input input-bordered text-xs py-1 px-2"
                      value={u.role}
                      onChange={e => handleChangeRole(u.id, e.target.value)}
                      disabled={u.blocked}
                    >
                      <option value="admin">Admin</option>
                      <option value="chauffeur">Chauffeur</option>
                      <option value="klant">Klant</option>
                    </select>
                    {!u.blocked ? (
                      <button className="px-2 py-1 text-xs bg-yellow-100 rounded" onClick={() => handleBlockUser(u.id)}>Blokkeren</button>
                    ) : (
                      <button className="px-2 py-1 text-xs bg-green-100 rounded" onClick={() => handleUnblockUser(u.id)}>Deblokkeren</button>
                    )}
                    <button className="px-2 py-1 text-xs bg-red-100 rounded" onClick={() => handleDeleteUser(u.id)}>Verwijderen</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {actionStatus && <div className="text-blue-600 mt-2">{actionStatus}</div>}
      </div>
      <button className="mt-4 px-6 py-2 bg-primary text-white rounded shadow" onClick={handleSaveAll}>Alle wijzigingen opslaan</button>
      {saveStatus && <div className="text-green-600 mt-2">{saveStatus}</div>}
    </section>
  );
}