import { PageLayout } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale } from "lucide-react";

export default function LegalInfo() {
  return (
    <PageLayout 
      title="Juridische Informatie" 
      description="Bedrijfsinformatie en juridische details van FRADES"
    >
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              Juridische Informatie
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Bedrijfsgegevens</h2>
              <div className="bg-muted/50 p-6 rounded-lg">
                <ul className="list-none space-y-3">
                  <li><strong>Bedrijfsnaam:</strong> FRADES BVBA</li>
                  <li><strong>Adres:</strong> Brusselsestraat 123, 1000 Brussel, België</li>
                  <li><strong>BTW-nummer:</strong> BE 0123.456.789</li>
                  <li><strong>Ondernemingsnummer:</strong> 0123.456.789</li>
                  <li><strong>Telefoon:</strong> +32 2 123 45 67</li>
                  <li><strong>E-mail:</strong> info@frades.be</li>
                  <li><strong>Website:</strong> www.frades.be</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Vergunningen en Licenties</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Taxivergunning:</strong> Gemeente Brussel - Vergunning nr. TX-2024-001</li>
                <li><strong>Personenvervoer:</strong> Geregistreerd bij FOD Mobiliteit</li>
                <li><strong>Verzekering:</strong> Omniumverzekering via Ethias (Polis nr. 123456789)</li>
                <li><strong>Beroepsaansprakelijkheid:</strong> €2.500.000 dekking</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Toezichthoudende Autoriteiten</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">FOD Mobiliteit en Vervoer</h3>
                  <p className="text-sm text-muted-foreground">
                    Toezicht op personenvervoer en taxidiensten
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Gegevensbeschermingsautoriteit</h3>
                  <p className="text-sm text-muted-foreground">
                    Toezicht op privacy en gegevensbescherming (AVG/GDPR)
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">FOD Economie</h3>
                  <p className="text-sm text-muted-foreground">
                    Consumentenbescherming en markttoezicht
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Geschillenbeslechting</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Bemiddeling</h3>
                  <p className="mb-2">
                    Voor geschillen kunt u zich wenden tot:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Ombudsdienst Vervoer:</strong> www.ombudsman.be</li>
                    <li><strong>Europees ODR-platform:</strong> ec.europa.eu/consumers/odr</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Rechtbank</h3>
                  <p>
                    Bij juridische geschillen is de rechtbank van Brussel bevoegd, 
                    tenzij de wet anders bepaalt.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Intellectueel Eigendom</h2>
              <p className="mb-4">
                Alle inhoud op deze website, inclusief teksten, afbeeldingen, logo's en software, 
                is eigendom van FRADES of haar licentiegevers en wordt beschermd door het auteursrecht 
                en andere intellectuele eigendomsrechten.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Toepasselijk Recht</h2>
              <p>
                Op alle overeenkomsten en deze website is het Belgische recht van toepassing. 
                Voor internationale klanten kunnen aanvullende bepalingen gelden.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Contact</h2>
              <p>
                Voor juridische vragen of opmerkingen kunt u contact opnemen via:
              </p>
              <ul className="list-none mt-4 space-y-2">
                <li><strong>E-mail:</strong> legal@frades.be</li>
                <li><strong>Telefoon:</strong> +32 2 123 45 67</li>
                <li><strong>Post:</strong> FRADES BVBA, Brusselsestraat 123, 1000 Brussel</li>
              </ul>
            </section>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}