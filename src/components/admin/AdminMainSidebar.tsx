import { useState } from "react";
import { CalendarCheck, Euro, Mail, BarChart2, Settings } from "lucide-react";

const mainMenuItems = [
  { key: "bookings", icon: <CalendarCheck />, label: "Boekingen" },
  { key: "pricing", icon: <Euro />, label: "Prijzen" },
  { key: "users", icon: <Mail />, label: "Gebruikers" },
  { key: "stats", icon: <BarChart2 />, label: "Statistieken" },
  { key: "settings", icon: <Settings />, label: "Instellingen" },
];

export default function AdminMainSidebar({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) {
  const [collapsed, setCollapsed] = useState(false);

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
        {mainMenuItems.map(item => (
          <button
            key={item.key}
            className={`flex items-center gap-3 px-4 py-2 rounded transition text-left ${activeTab === item.key ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'} ${collapsed ? 'justify-center px-2' : ''}`}
            onClick={() => onTabChange(item.key)}
            aria-label={item.label}
          >
            {item.icon}
            {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
}
