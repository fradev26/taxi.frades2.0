import { PageLayout } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cookie } from "lucide-react";

export default function CookiePolicy() {
  return (
    <PageLayout 
      title="Cookiebeleid" 
      description="Hoe FRADES cookies gebruikt op onze website"
    >
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cookie className="w-5 h-5 text-primary" />
              Gebruik van Cookies
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <p className="text-muted-foreground mb-6">
              Laatst bijgewerkt: {new Date().toLocaleDateString('nl-NL')}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">1. Wat zijn cookies?</h2>
              <p className="mb-4">
                Cookies zijn kleine tekstbestanden die op uw apparaat worden opgeslagen wanneer u onze website bezoekt. 
                Ze helpen ons de website te laten functioneren, uw ervaring te verbeteren en inzicht te krijgen in 
                hoe onze website wordt gebruikt.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Welke cookies gebruiken wij?</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Noodzakelijke cookies</h3>
                <p className="mb-2">
                  Deze cookies zijn essentieel voor het functioneren van onze website:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Sessie-identificatie</li>
                  <li>Beveiligingstokens</li>
                  <li>Inlogstatus</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Functionele cookies</h3>
                <p className="mb-2">
                  Deze cookies verbeteren uw gebruikservaring:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Taalvoorkeuren</li>
                  <li>Locatie-instellingen</li>
                  <li>Gebruikersvoorkeuren</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Analytische cookies</h3>
                <p className="mb-2">
                  Deze cookies helpen ons begrijpen hoe bezoekers onze website gebruiken:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Google Analytics</li>
                  <li>Gebruiksstatistieken</li>
                  <li>Prestatiemetingen</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. Cookies beheren</h2>
              <p className="mb-4">
                U kunt cookies beheren via uw browserinstellingen. Houd er rekening mee dat het uitschakelen 
                van bepaalde cookies de functionaliteit van onze website kan beïnvloeden.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Chrome:</strong> Instellingen → Privacy en beveiliging → Cookies</li>
                <li><strong>Firefox:</strong> Instellingen → Privacy en beveiliging</li>
                <li><strong>Safari:</strong> Voorkeuren → Privacy</li>
                <li><strong>Edge:</strong> Instellingen → Cookies en sitegegevens</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. Contact</h2>
              <p>
                Voor vragen over ons cookiebeleid kunt u contact met ons opnemen via:
              </p>
              <ul className="list-none mt-4 space-y-2">
                <li><strong>E-mail:</strong> info@frades.be</li>
                <li><strong>Telefoon:</strong> +32 2 123 45 67</li>
              </ul>
            </section>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}