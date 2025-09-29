import { PageLayout } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function TermsOfService() {
  return (
    <PageLayout 
      title="Gebruiksvoorwaarden" 
      description="Algemene voorwaarden voor het gebruik van FRADES diensten"
    >
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Gebruiksvoorwaarden
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <p className="text-muted-foreground mb-6">
              Laatst bijgewerkt: {new Date().toLocaleDateString('nl-NL')}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">1. Algemeen</h2>
              <p className="mb-4">
                Deze gebruiksvoorwaarden zijn van toepassing op alle diensten die worden aangeboden door 
                FRADES ("wij", "ons", "onze"). Door gebruik te maken van onze diensten, gaat u akkoord 
                met deze voorwaarden.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Onze diensten</h2>
              <p className="mb-4">
                FRADES biedt premium chauffeursdiensten aan, waaronder:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Persoonlijk vervoer met professionele chauffeurs</li>
                <li>Zakelijk vervoer en evenementen</li>
                <li>Luchthaven transfers</li>
                <li>Uurverhuur van voertuigen met chauffeur</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. Boekingen en annuleringen</h2>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Boekingen</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Boekingen kunnen online of telefonisch worden gemaakt</li>
                  <li>Alle boekingen zijn onderhevig aan beschikbaarheid</li>
                  <li>Wij behouden ons het recht voor om boekingen te weigeren</li>
                </ul>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Annuleringen</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Gratis annulering tot 2 uur voor de geplande rit</li>
                  <li>Annuleringen binnen 2 uur: 50% van het tarief</li>
                  <li>No-show: 100% van het tarief</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. Tarieven en betaling</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Alle prijzen zijn inclusief BTW</li>
                <li>Betaling kan contant, per kaart of via factuur</li>
                <li>Voor zakelijke klanten zijn betalingstermijnen van toepassing</li>
                <li>Wij behouden ons het recht voor om tarieven aan te passen</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">5. Aansprakelijkheid</h2>
              <p className="mb-4">
                FRADES is verzekerd voor alle ritten. Onze aansprakelijkheid is beperkt tot het bedrag 
                dat door onze verzekering wordt gedekt. Wij zijn niet aansprakelijk voor indirecte schade 
                of gevolgschade.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. Gedragscode</h2>
              <p className="mb-4">
                Klanten worden verwacht zich respectvol te gedragen tegenover onze chauffeurs en andere klanten. 
                Wij behouden ons het recht voor om dienstverlening te weigeren bij ongepast gedrag.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">7. Contact</h2>
              <p>
                Voor vragen over deze voorwaarden kunt u contact met ons opnemen:
              </p>
              <ul className="list-none mt-4 space-y-2">
                <li><strong>E-mail:</strong> info@frades.be</li>
                <li><strong>Telefoon:</strong> +32 2 123 45 67</li>
                <li><strong>Adres:</strong> FRADES, Brusselsestraat 123, 1000 Brussel</li>
              </ul>
            </section>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}