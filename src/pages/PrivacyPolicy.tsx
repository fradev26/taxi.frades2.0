import { PageLayout } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <PageLayout 
      title="Privacybeleid" 
      description="Hoe FRADES omgaat met uw persoonlijke gegevens"
    >
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Privacybeleid
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <p className="text-muted-foreground mb-6">
              Laatst bijgewerkt: {new Date().toLocaleDateString('nl-NL')}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">1. Inleiding</h2>
              <p className="mb-4">
                FRADES respecteert uw privacy en is toegewijd aan het beschermen van uw persoonlijke gegevens. 
                Dit privacybeleid legt uit hoe wij uw persoonlijke informatie verzamelen, gebruiken en beschermen 
                wanneer u onze chauffeursdiensten gebruikt.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Welke gegevens verzamelen wij?</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Contactgegevens (naam, e-mailadres, telefoonnummer)</li>
                <li>Locatiegegevens voor ophaal- en bestemmingsadressen</li>
                <li>Betalingsinformatie</li>
                <li>Ritgeschiedenis en voorkeuren</li>
                <li>Apparaat- en gebruiksinformatie</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. Hoe gebruiken wij uw gegevens?</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Het leveren van onze chauffeursdiensten</li>
                <li>Verwerking van betalingen</li>
                <li>Communicatie over uw ritten</li>
                <li>Verbetering van onze dienstverlening</li>
                <li>Naleving van wettelijke verplichtingen</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. Uw rechten</h2>
              <p className="mb-4">
                Onder de AVG heeft u verschillende rechten betreffende uw persoonlijke gegevens:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Recht op inzage</li>
                <li>Recht op rectificatie</li>
                <li>Recht op verwijdering</li>
                <li>Recht op beperking van verwerking</li>
                <li>Recht op gegevensoverdraagbaarheid</li>
                <li>Recht van bezwaar</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">5. Contact</h2>
              <p>
                Voor vragen over dit privacybeleid kunt u contact met ons opnemen via:
              </p>
              <ul className="list-none mt-4 space-y-2">
                <li><strong>E-mail:</strong> privacy@frades.be</li>
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