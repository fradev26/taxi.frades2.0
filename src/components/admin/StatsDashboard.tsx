import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatsDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Omzet (maand)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">€ 12.340</div>
          <div className="text-muted-foreground mt-2">+8% t.o.v. vorige maand</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Ritten (maand)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">324</div>
          <div className="text-muted-foreground mt-2">Gemiddeld 10,8 per dag</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Actieve gebruikers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">57</div>
          <div className="text-muted-foreground mt-2">Laatste 30 dagen</div>
        </CardContent>
      </Card>
    </div>
  );
}
