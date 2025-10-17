
import { useState } from "react";
import GeneralSettings from "./GeneralSettings";
import BookingSettings from "./BookingSettings";
import PriceSettings from "./PriceSettings";
import UserSettings from "./UserSettings";
import NotificationSettings from "./NotificationSettings";
import StatsSettings from "./StatsSettings";
import SecuritySettings from "./SecuritySettings";
import ApiSettings from "./ApiSettings";
import SystemSettings from "./SystemSettings";
import ExtraSettings from "./ExtraSettings";
import PasswordPolicy from "./security/PasswordPolicy";
import TwoFactorAuth from "./security/TwoFactorAuth";
import PrivacyPolicy from "./privacy/PrivacyPolicy";
import CookiePolicy from "./privacy/CookiePolicy";
// Uitbreiding boekingsinstellingen
const defaultVehicleTypes = ["Sedan", "Bus", "SUV"];

import { useState } from "react";

const tabs = [
  { key: "general", label: "Algemeen", component: <GeneralSettings /> },
  { key: "booking", label: "Boekingen", component: <BookingSettings /> },
  { key: "pricing", label: "Prijzen", component: <PriceSettings /> },
  { key: "users", label: "Gebruikers", component: <UserSettings /> },
  { key: "notifications", label: "Notificaties", component: <NotificationSettings /> },
  { key: "stats", label: "Statistieken", component: <StatsSettings /> },
  {
    key: "security_privacy",
    label: "Beveiliging & Privacy",
    component: <SecurityPrivacyTabs />
  },
  { key: "api", label: "API", component: <ApiSettings /> },
  { key: "system", label: "Systeem", component: <SystemSettings /> },
  { key: "extra", label: "Extra", component: <ExtraSettings /> },
];

function SecurityPrivacyTabs() {
  const [subTab, setSubTab] = useState("password");
  const subTabs = [
    { key: "password", label: "Wachtwoordbeleid", component: <PasswordPolicy /> },
    { key: "2fa", label: "Two-factor authentication", component: <TwoFactorAuth /> },
    { key: "privacy", label: "Privacyverklaring", component: <PrivacyPolicy /> },
    { key: "cookie", label: "Cookiebeleid", component: <CookiePolicy /> },
  ];
  return (
    <div>
      <div className="flex gap-2 mb-6">
        {subTabs.map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 rounded border ${subTab === tab.key ? "bg-primary text-white" : "bg-gray-100 text-gray-700"}`}
            onClick={() => setSubTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="bg-white rounded shadow p-4">
        {subTabs.find(tab => tab.key === subTab)?.component}
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Admin Instellingen</h2>
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 rounded ${activeTab === tab.key ? "bg-primary text-white" : "bg-gray-100 text-gray-700"}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="bg-white rounded shadow p-4">
        {tabs.find(tab => tab.key === activeTab)?.component}
      </div>
      <button className="mt-6 px-6 py-2 bg-primary text-white rounded shadow">Instellingen opslaan</button>
    </div>
  );
}
