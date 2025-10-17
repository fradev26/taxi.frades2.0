import { useState } from "react";

export default function SecuritySettings() {
  const [passwordPolicy, setPasswordPolicy] = useState("Minimaal 8 karakters, 1 hoofdletter, 1 cijfer");
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [privacyStatement, setPrivacyStatement] = useState("");
  return (
    <section className="p-4 rounded-lg bg-gray-50 shadow-sm">
      <h3 className="font-semibold text-lg mb-2">Beveiliging & Privacy</h3>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Wachtwoordbeleid</label>
        <input type="text" value={passwordPolicy} onChange={e => setPasswordPolicy(e.target.value)} className="input input-bordered w-full" placeholder="Wachtwoordbeleid" />
      </div>
      <div className="mb-4">
        <label className="inline-flex items-center"><input type="checkbox" checked={twoFactorAuth} onChange={e => setTwoFactorAuth(e.target.checked)} className="mr-2" /> Two-factor authentication</label>
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Privacyverklaring</label>
        <textarea value={privacyStatement} onChange={e => setPrivacyStatement(e.target.value)} className="textarea textarea-bordered w-full" placeholder="Privacyverklaring..." />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Cookiebeleid</label>
        <textarea className="textarea textarea-bordered w-full" placeholder="Cookiebeleid..." />
      </div>
    </section>
  );
}