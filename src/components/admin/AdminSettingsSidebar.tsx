import { useState } from "react";
import { Settings, Euro, Car, Users, Mail, BarChart2, CalendarCheck, Shield, Palette, Code2 } from "lucide-react";

const categories = [
  { key: "general", icon: <Settings />, label: "Algemeen" },
  { key: "bookings", icon: <CalendarCheck />, label: "Boekingen" },
  { key: "pricing", icon: <Euro />, label: "Prijzen" },
  { key: "fleet", icon: <Car />, label: "Voertuigen" },
  { key: "drivers", icon: <Users />, label: "Chauffeurs" },
  { key: "users", icon: <Mail />, label: "Gebruikers" },
  { key: "notifications", icon: <BarChart2 />, label: "Notificaties" },
  { key: "security", icon: <Shield />, label: "Beveiliging" },
  { key: "appearance", icon: <Palette />, label: "Thema" },
  { key: "advanced", icon: <Code2 />, label: "Geavanceerd" },
];

export default function AdminSettingsSidebar({ activeCategory, onCategoryChange }: { activeCategory: string, onCategoryChange: (cat: string) => void }) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <aside className={`h-full bg-muted border-r flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`}>
      <button
        className="p-2 m-2 rounded hover:bg-muted transition"
        onClick={() => setCollapsed(c => !c)}
        aria-label={collapsed ? "Sidebar uitklappen" : "Sidebar inklappen"}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="7" width="10" height="2" rx="1" fill="currentColor" />
          <rect x="5" y="15" width="16" height="2" rx="1" fill="currentColor" />
        </svg>
      </button>
      <nav className="flex-1 flex flex-col gap-2 mt-4">
        {categories.map(cat => (
          <button
            key={cat.key}
            className={`flex items-center gap-3 px-4 py-2 rounded transition text-left ${activeCategory === cat.key ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'} ${collapsed ? 'justify-center px-2' : ''}`}
            onClick={() => onCategoryChange(cat.key)}
            aria-label={cat.label}
          >
            {cat.icon}
            {!collapsed && <span className="font-medium text-sm">{cat.label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
}
