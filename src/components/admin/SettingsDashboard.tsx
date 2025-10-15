import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function SettingsDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card className="shadow border border-border">
        <CardHeader>
          <CardTitle>API Key beheer</CardTitle>
          <CardDescription>Beheer je API keys voor externe koppelingen</CardDescription>
        </CardHeader>
        <CardContent>
          <label className="block mb-2 text-sm font-medium text-muted-foreground">
            API Key
          </label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 mb-4"
            value="sk_live_xxx..."
            readOnly
          />
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded">
            API Key vernieuwen
          </button>
        </CardContent>
      </Card>
      <Card className="shadow border border-border">
        <CardHeader>
          <CardTitle>Notificatie instellingen</CardTitle>
          <CardDescription>Stel e-mail en sms notificaties in</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              <span>E-mail notificaties</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              <span>SMS notificaties</span>
            </label>
          </div>
        </CardContent>
      </Card>
      <Card className="shadow border border-border md:col-span-2">
        <CardHeader>
          <CardTitle>Systeeminstellingen</CardTitle>
          <CardDescription>Beheer algemene systeeminstellingen</CardDescription>
        </CardHeader>
        <CardContent>
          <label className="block mb-2 text-sm font-medium text-muted-foreground">
            Tijdzone
          </label>
          <select className="w-full border rounded px-3 py-2">
            <option>Europe/Brussels</option>
            <option>Europe/Amsterdam</option>
            <option>Europe/Paris</option>
          </select>
        </CardContent>
      </Card>
    </div>
  );
}
