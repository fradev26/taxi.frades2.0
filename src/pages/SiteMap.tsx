import { PageLayout } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Map, Chrome as Home, User, Wallet, Clock, Settings, Shield, FileText, Cookie, ShoppingCart, Scale } from "lucide-react";
import { ROUTES } from "@/constants";

export default function SiteMap() {
  const siteStructure = [
    {
      title: "Hoofdpagina's",
      icon: Home,
      links: [
        { name: "Homepage", path: ROUTES.HOME, description: "Welkomstpagina en boekingsformulier" },
        { name: "Inloggen", path: ROUTES.LOGIN, description: "Aanmelden of account aanmaken" },
      ]
    },
    {
      title: "Account & Diensten",
      icon: User,
      links: [
        { name: "Mijn Account", path: ROUTES.ACCOUNT, description: "Persoonlijke gegevens en instellingen" },
        { name: "Wallet", path: ROUTES.WALLET, description: "Betaalmethoden en krediet" },
        { name: "Activiteit", path: ROUTES.TRIPS, description: "Ritgeschiedenis en geplande ritten" },
      ]
    },
    {
      title: "Beheer",
      icon: Settings,
      links: [
        { name: "Admin Dashboard", path: ROUTES.ADMIN, description: "Administratie en beheer (alleen voor admins)" },
      ]
    },
    {
      title: "Juridisch & Privacy",
      icon: Shield,
      links: [
        { name: "Privacybeleid", path: ROUTES.PRIVACY_POLICY, description: "Hoe wij omgaan met uw gegevens" },
        { name: "Cookiebeleid", path: ROUTES.COOKIE_POLICY, description: "Gebruik van cookies op onze website" },
        { name: "Gebruiksvoorwaarden", path: ROUTES.TERMS_OF_SERVICE, description: "Algemene voorwaarden voor gebruik" },
        { name: "Verkoopvoorwaarden", path: ROUTES.SALES_TERMS, description: "Specifieke voorwaarden voor dienstverlening" },
        { name: "Juridische Informatie", path: ROUTES.LEGAL_INFO, description: "Bedrijfsgegevens en juridische details" },
        { name: "Site-overzicht", path: ROUTES.SITE_MAP, description: "Deze pagina - overzicht van alle pagina's" },
      ]
    }
  ];

  return (
    <PageLayout 
      title="Site-overzicht" 
      description="Overzicht van alle pagina's en functies op de FRADES website"
    >
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="w-5 h-5 text-primary" />
              Site-overzicht
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-8">
              Hieronder vindt u een volledig overzicht van alle pagina's en functies die beschikbaar zijn 
              op de FRADES website. Klik op een link om direct naar de gewenste pagina te gaan.
            </p>

            <div className="space-y-8">
              {siteStructure.map((section, index) => (
                <div key={index} className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <section.icon className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">{section.title}</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.links.map((link, linkIndex) => (
                      <Link
                        key={linkIndex}
                        to={link.path}
                        className="block p-4 border border-border rounded-lg hover:bg-card-hover hover:border-primary/50 transition-all duration-200"
                      >
                        <h3 className="font-medium text-foreground mb-1">{link.name}</h3>
                        <p className="text-sm text-muted-foreground">{link.description}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-muted/50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Hulp nodig?</h3>
              <p className="text-muted-foreground mb-4">
                Kunt u niet vinden wat u zoekt? Neem contact met ons op voor persoonlijke hulp.
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>E-mail:</strong> info@frades.be</p>
                <p><strong>Telefoon:</strong> +32 2 123 45 67</p>
                <p><strong>Openingstijden:</strong> Ma-Vr 8:00-18:00, Za-Zo 9:00-17:00</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}