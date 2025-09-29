import { PageLayout } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

export default function SalesTerms() {
  return (
    <PageLayout 
      title="Verkoopvoorwaarden" 
      description="Specifieke voorwaarden voor de verkoop van FRADES diensten"
    >
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Verkoopvoorwaarden
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <p className="text-muted-foreground mb-6">
              Laatst bijgewerkt: {new Date().toLocaleDateString('nl-NL')}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">1. Toepasselijkheid</h2>
              <p className="mb-4">
                Deze verkoopvoorwaarden zijn van toepassing op alle overeenkomsten tussen FRADES en haar klanten 
                betreffende de levering van chauffeursdiensten.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Aanbiedingen en prijzen</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Alle aanbiedingen zijn vrijblijvend tenzij anders vermeld</li>
                <li>Prijzen zijn inclusief BTW en exclusief eventuele toelagen</li>
                <li>Prijswijzigingen zijn mogelijk na kennisgeving</li>
                <li>Speciale tarieven gelden alleen voor de aangegeven periode</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. Totstandkoming overeenkomst</h2>
              <p className="mb-4">
                Een overeenkomst komt tot stand door:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Bevestiging van uw boeking door FRADES</li>
                <li>Ontvangst van een boekingsbevestiging</li>
                <li>Aanvang van de dienstverlening</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. Levering en uitvoering</h2>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Punctualiteit</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Wij streven naar punctualiteit bij alle ritten</li>
                  <li>Bij vertraging wordt u direct geïnformeerd</li>
                  <li>Wachttijd tot 15 minuten is gratis inbegrepen</li>
                </ul>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Voertuigen</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Alle voertuigen zijn schoon en goed onderhouden</li>
                  <li>Voertuigtype kan wijzigen bij gelijkwaardige vervanging</li>
                  <li>Speciale verzoeken worden waar mogelijk gehonoreerd</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">5. Betaling</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Betaling kan contant, per pin of creditcard</li>
                <li>Zakelijke klanten kunnen op rekening betalen</li>
                <li>Betalingstermijn voor facturen: 30 dagen</li>
                <li>Bij te late betaling kunnen rente en kosten in rekening worden gebracht</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. Herroepingsrecht</h2>
              <p className="mb-4">
                Voor particuliere klanten geldt een herroepingsrecht van 14 dagen, tenzij de dienst 
                al is uitgevoerd met uw uitdrukkelijke toestemming.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">7. Klachten</h2>
              <p className="mb-4">
                Klachten kunnen worden ingediend via:
              </p>
              <ul className="list-none mt-4 space-y-2">
                <li><strong>E-mail:</strong> klachten@frades.be</li>
                <li><strong>Telefoon:</strong> +32 2 123 45 67</li>
                <li><strong>Binnen:</strong> 7 dagen na de dienstverlening</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">8. Toepasselijk recht</h2>
              <p>
                Op deze verkoopvoorwaarden is het Belgische recht van toepassing. 
                Geschillen worden voorgelegd aan de bevoegde rechter in Brussel.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}