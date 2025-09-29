import { Link } from "react-router-dom";
import { APP_CONFIG, ROUTES } from "@/constants";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border py-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            Copyright © {currentYear} {APP_CONFIG.name}. Alle rechten voorbehouden.
          </p>
          
          {/* Links */}
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-muted-foreground">
            <Link 
              to={ROUTES.PRIVACY_POLICY} 
              className="hover:text-foreground transition-colors"
            >
              Privacybeleid
            </Link>
            <span>|</span>
            <Link 
              to={ROUTES.COOKIE_POLICY} 
              className="hover:text-foreground transition-colors"
            >
              Gebruik van cookies
            </Link>
            <span>|</span>
            <Link 
              to={ROUTES.TERMS_OF_SERVICE} 
              className="hover:text-foreground transition-colors"
            >
              Gebruiksvoorwaarden
            </Link>
            <span>|</span>
            <Link 
              to={ROUTES.SALES_TERMS} 
              className="hover:text-foreground transition-colors"
            >
              Verkoopvoorwaarden
            </Link>
            <span>|</span>
            <Link 
              to={ROUTES.LEGAL_INFO} 
              className="hover:text-foreground transition-colors"
            >
              Juridische informatie
            </Link>
            <span>|</span>
            <Link 
              to={ROUTES.SITE_MAP} 
              className="hover:text-foreground transition-colors"
            >
              Site-overzicht
            </Link>
          </div>
          
          {/* Country */}
          <div className="text-right">
            <span className="text-sm text-muted-foreground">België</span>
          </div>
        </div>
      </div>
    </footer>
  );
}