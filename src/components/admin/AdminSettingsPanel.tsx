import { useState } from "react";
import AdminSettingsSidebar from "./AdminSettingsSidebar";
import { AdminSidebar } from "./AdminSidebar";
import { BookingManagerSimple } from "./BookingManager.simple";
import { PricingSettings } from "./PricingSettings";
import { UserManager } from "./UserManager";
import { StatsDashboard } from "./StatsDashboard";
import AdminSettings from "./AdminSettings";
import GeneralSettings from "./GeneralSettings";
import BookingSettings from "./BookingSettings";
import PriceSettings from "./PriceSettings";
import UserSettings from "./UserSettings";
import NotificationSettings from "./NotificationSettings";
import MailNotifications from "./MailNotifications";
import SmsNotifications from "./SmsNotifications";
import Templates from "./Templates";
import SystemMessages from "./SystemMessages";
import StatsSettings from "./StatsSettings";
import SecuritySettings from "./SecuritySettings";
// Theme settings removed
import SystemSettings from "./SystemSettings";
import PasswordPolicy from "./security/PasswordPolicy";
import TwoFactorAuth from "./security/TwoFactorAuth";
import PrivacyPolicy from "./privacy/PrivacyPolicy";
import CookiePolicy from "./privacy/CookiePolicy";
import { ProcessTests } from "./ProcessTests";

// Dummy content per categorie en subcategorie
const categoryContent: Record<string, JSX.Element> = {
  general: (<GeneralSettings />),
  booking: (<BookingSettings />),
  price: (<PriceSettings />),
  users: (<UserSettings />),
  notifications: (<NotificationSettings />),
  stats: (<StatsSettings />),
  security: (<SecuritySettings />),
  system: (<SystemSettings />),
};

const settingsCategories = [
  { key: "general", label: "Algemeen" },
  { key: "booking", label: "Boekingsinstellingen" },
  { key: "users", label: "Gebruikersbeheer" },
  { key: "notifications", label: "Notificaties & Communicatie", subcategories: [
    { key: "email", label: "E-mail notificaties" },
    { key: "sms", label: "SMS notificaties" },
    { key: "templates", label: "Templates" },
    { key: "system", label: "Systeemmeldingen" },
  ] },
  { key: "stats", label: "Statistieken & Rapportage", subcategories: [
    { key: "overview", label: "Overzicht" },
    { key: "export", label: "Export" },
  ] },
  { key: "security", label: "Beveiliging & Privacy", subcategories: [
    { key: "password", label: "Wachtwoordbeleid" },
    { key: "2fa", label: "Two-factor authentication" },
    { key: "privacy", label: "Privacyverklaring" },
    { key: "cookies", label: "Cookiebeleid" },
  ] },
  
  { key: "system", label: "Systeem & Geavanceerd", subcategories: [
    { key: "backup", label: "Backups & herstel" },
    { key: "status", label: "Systeemstatus" },
    { key: "logging", label: "Logging & audit trail" },
  ] },
  
];

// ---
// AdminSettingsPanel structuur uitleg:
// 1. Linker sidebar: hoofdmenu (AdminMainSidebar)
// 2. Tweede sidebar: instellingen-categorieën (zichtbaar bij tab 'Instellingen')
// 3. Content: grid/cards per categorie
// ---
import { useBookings } from "@/hooks/useBookings";

export default function AdminSettingsPanel() {
  const [activeTab, setActiveTab] = useState("bookings");
  const [activeCategory, setActiveCategory] = useState("general");
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  // Haal boekingen op zoals in Admin.tsx
  const { bookings = [], isLoading: bookingsLoading } = useBookings();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === "settings" && (
        <>
          <div className="h-full border-r flex flex-col w-56 bg-muted">
            <nav className="flex-1 flex flex-col gap-2 mt-4">
              {settingsCategories.map(cat => (
                <button
                  key={cat.key}
                  className={`flex items-center gap-3 px-4 py-2 rounded transition text-left font-medium text-sm ${activeCategory === cat.key ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
                  onClick={() => { setActiveCategory(cat.key); setActiveSubcategory(null); }}
                  aria-label={cat.label}
                >
                  {cat.label}
                </button>
              ))}
            </nav>
          </div>
          {/* Derde sidebar voor subcategorieën (niet meer nodig voor gebruikersbeheer) */}
          {settingsCategories.find(cat => cat.key === activeCategory)?.subcategories && activeCategory !== "users" && (
            <div className="h-full border-r flex flex-col w-48 bg-muted">
              <nav className="flex-1 flex flex-col gap-2 mt-4">
                {settingsCategories.find(cat => cat.key === activeCategory)?.subcategories?.map(sub => (
                  <button
                    key={sub.key}
                    className={`flex items-center gap-3 px-4 py-2 rounded transition text-left font-medium text-sm ${activeSubcategory === sub.key ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
                    onClick={() => setActiveSubcategory(sub.key)}
                    aria-label={sub.label}
                  >
                    {sub.label}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </>
      )}
      <main className="flex-1 p-8">
        {activeTab === "bookings" && <BookingManagerSimple bookings={bookings} />}
        {activeTab === "pricing" && <PricingSettings />}
        {activeTab === "stats" && <StatsDashboard />}
        {activeTab === "process-tests" && <ProcessTests />}
        {activeTab === "settings" && (
          <>
            <h2 className="text-2xl font-bold mb-6">Instellingen</h2>
            {settingsCategories.find(cat => cat.key === activeCategory)?.subcategories && activeSubcategory ? (
              activeCategory === "notifications" && activeSubcategory === "email" ? <MailNotifications /> :
              activeCategory === "notifications" && activeSubcategory === "sms" ? <SmsNotifications /> :
              activeCategory === "notifications" && activeSubcategory === "templates" ? <Templates /> :
              activeCategory === "notifications" && activeSubcategory === "system" ? <SystemMessages /> :
              activeCategory === "security" && activeSubcategory === "password" ? <PasswordPolicy /> :
              activeCategory === "security" && activeSubcategory === "2fa" ? <TwoFactorAuth /> :
              activeCategory === "security" && activeSubcategory === "privacy" ? <PrivacyPolicy /> :
              activeCategory === "security" && activeSubcategory === "cookies" ? <CookiePolicy /> :
              activeCategory === "theme" ? <div className="border rounded p-6 bg-background">Thema & Uiterlijk is verwijderd.</div> :
              <div className="border rounded p-6 bg-background">Onbekende subcategorie: {activeSubcategory}</div>
            ) : (
              <div>{categoryContent[activeCategory]}</div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
