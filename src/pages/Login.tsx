import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PhoneInput } from "@/components/ui/phone-input";
import { Car, Mail, Phone, User, Eye, EyeOff, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { signUp, signIn, signInWithGoogle, signInWithApple } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { validateEmail, validatePassword } from "@/utils/validation";
import { ROUTES, APP_CONFIG } from "@/constants";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accountType, setAccountType] = useState<'personal' | 'business'>('personal');
  const [companyName, setCompanyName] = useState("");
  const [btwNumber, setBtwNumber] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (user && !authLoading) {
      navigate(ROUTES.HOME);
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validation
    if (!validateEmail(email)) {
      toast({
        title: "Ongeldig e-mailadres",
        description: "Voer een geldig e-mailadres in.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      toast({
        title: "Wachtwoord te kort",
        description: "Wachtwoord moet minimaal 8 karakters bevatten.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      toast({
        title: "Wachtwoorden komen niet overeen",
        description: "Controleer je wachtwoord en probeer opnieuw.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const metadata = {
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          ...(accountType === 'business' && {
            company_name: companyName,
            btw_number: btwNumber
          })
        };

        const { error } = await signUp(email, password, metadata);
        if (error) {
          toast({
            title: "Registratie mislukt",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Account aangemaakt!",
            description: "Je bent succesvol geregistreerd en ingelogd.",
          });
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Inloggen mislukt",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Succesvol ingelogd!",
            description: "Welkom terug!",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Er is een fout opgetreden",
        description: "Probeer het later opnieuw.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast({
          title: "Google login mislukt",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Er is een fout opgetreden",
        description: "Probeer het later opnieuw.",
        variant: "destructive",
      });
    }
  };

  const handleAppleLogin = async () => {
    try {
      const { error } = await signInWithApple();
      if (error) {
        toast({
          title: "Apple login mislukt",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Er is een fout opgetreden",
        description: "Probeer het later opnieuw.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="text-3xl font-bold text-primary mb-4 hover:text-primary/80 transition-colors cursor-pointer"
          >
            {APP_CONFIG.name}
          </button>
          <p className="text-muted-foreground mt-2">
            {APP_CONFIG.description}
          </p>
        </div>

        <Card className="border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold">
              {isSignUp ? "Account aanmaken" : "Inloggen"}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Social Login Buttons */}
            <div className="space-y-3">
              {/* Google Login */}
              <Button
                variant="outline"
                className="w-full h-12 border-2 border-gray-300 rounded-xl hover:bg-gray-50"
                onClick={handleGoogleLogin}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Doorgaan met Google
              </Button>

              {/* Apple Login */}
              <Button
                variant="outline"
                className="w-full h-12 border-2 bg-black hover:bg-gray-900 text-white hover:text-white border-black rounded-xl"
                onClick={handleAppleLogin}
              >
                <svg className="w-5 h-5 mr-2 fill-white" viewBox="0 0 24 24">
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.037-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                </svg>
                Doorgaan met Apple
              </Button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Of {isSignUp ? "maak account aan" : "log in"} met
                </span>
              </div>
            </div>

            {/* Login Form */}
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">E-mail</TabsTrigger>
                <TabsTrigger value="phone">Telefoon</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <TabsContent value="email" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mailadres</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="uw.email@voorbeeld.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="phone" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefoonnummer</Label>
                    <PhoneInput
                      id="phone"
                      value={phone}
                      onChange={setPhone}
                      placeholder="123 456 789"
                      defaultCountry="BE"
                    />
                  </div>
                </TabsContent>

                {isSignUp && (
                  <>
                    {/* Account Type Selection */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Account type</Label>
                      <RadioGroup
                        value={accountType}
                        onValueChange={(value: 'personal' | 'business') => setAccountType(value)}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="personal" id="personal" />
                          <Label htmlFor="personal" className="flex items-center gap-2 cursor-pointer">
                            <User className="w-4 h-4" />
                            Persoonlijk account
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="business" id="business" />
                          <Label htmlFor="business" className="flex items-center gap-2 cursor-pointer">
                            <Building className="w-4 h-4" />
                            Zakelijk account
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Voornaam</Label>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="Jan"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Achternaam</Label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="de Vries"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="h-12"
                        />
                      </div>
                    </div>

                    {/* Business Fields */}
                    {accountType === 'business' && (
                      <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                        <h4 className="font-medium flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          Zakelijke gegevens
                        </h4>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="companyName">Bedrijfsnaam</Label>
                            <Input
                              id="companyName"
                              type="text"
                              placeholder="Uw bedrijfsnaam"
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              className="h-12"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="btwNumber">BTW-nummer</Label>
                            <Input
                              id="btwNumber"
                              type="text"
                              placeholder="BE0123456789"
                              value={btwNumber}
                              onChange={(e) => setBtwNumber(e.target.value)}
                              className="h-12"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Wachtwoord</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Je wachtwoord"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-10 w-10"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Bevestig wachtwoord</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Bevestig je wachtwoord"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-12"
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-lg font-semibold bg-black text-white hover:bg-gray-900 border-2 border-black rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <User className="w-5 h-5 mr-2" />
                  )}
                  {isLoading ? "Bezig..." : (isSignUp ? "Account aanmaken" : "Inloggen")}
                </Button>
              </form>
            </Tabs>

            <div className="text-center">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? "Al een account? Log hier in" : "Nog geen account? Maak er een aan"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}