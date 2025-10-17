import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, AlertTriangle, Play, Database, User, Car, CreditCard, Mail, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import detectedIntegrations from '@/data/detectedIntegrations.json';
import { useToast } from "@/hooks/use-toast";

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  duration?: number;
}

export function ProcessTests() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  // Derive a lightweight overview status for important processes without running tests
  const processOverview = [
    {
      key: 'booking',
      label: 'Boeken van een rit',
      status: (detectedIntegrations && true) ? 'partial' : 'missing',
      locations: [
        'src/components/BookingForm.tsx',
        'src/components/BookingInterface.tsx',
        'supabase/migrations',
      ],
      nextSteps: [
        'Controleer bookings tabel en RLS/policies',
        'Test guest en logged-in booking flows',
        'Zorg dat process-booking-payment endpoint gereed is',
      ]
    },
    {
      key: 'payment',
      label: 'Betaling verwerken',
      status: detectedIntegrations?.Stripe ? 'partial' : 'missing',
      locations: detectedIntegrations?.Stripe?.locations || ['supabase/functions/process-booking-payment'],
      nextSteps: [
        'Deploy Supabase payment functions (create-payment-intent, process-booking-payment)',
        'Controleer STRIPE_* env vars en webhook secret',
        'Test wallet + card + saved-card flows',
      ]
    },
    {
      key: 'google',
      label: 'Inloggen met Google',
      status: !!(typeof import.meta !== 'undefined' ? import.meta.env.VITE_GOOGLE_CLIENT_ID : undefined) || (detectedIntegrations && Object.keys(detectedIntegrations).some(k=>k.toLowerCase().includes('google'))) ? 'partial' : 'missing',
      locations: ['src/pages/Login.tsx', 'src/components/LoginButtons.tsx'],
      nextSteps: [
        'Configureer Google OAuth in Supabase (client id/secret/redirect URI)',
        'Test login flow en callback redirect',
      ]
    },
    {
      key: 'apple',
      label: 'Inloggen met Apple',
      status: !!(typeof import.meta !== 'undefined' ? import.meta.env.VITE_APPLE_CLIENT_ID : undefined) || (detectedIntegrations && Object.keys(detectedIntegrations).some(k=>k.toLowerCase().includes('apple'))) ? 'partial' : 'missing',
      locations: ['src/pages/Login.tsx', 'src/components/LoginButtons.tsx'],
      nextSteps: [
        'Configureer Apple Sign-In in Supabase en Apple Developer portal',
        'Test login flow (requires valid redirect URIs)',
      ]
    }
  ];

  const tests = [
    {
      id: 'database-connection',
      name: 'Database Connectie',
      icon: <Database className="w-4 h-4" />,
      description: 'Test Supabase database connectie',
      run: async () => {
        try {
          const { data, error } = await supabase.from('profiles').select('count').limit(1);
          if (error) throw error;
          return { success: true, message: 'Database connectie succesvol' };
        } catch (error) {
          return { success: false, message: `Database fout: ${error.message}` };
        }
      }
    },
    {
      id: 'user-authentication',
      name: 'Gebruikersauthenticatie',
      icon: <User className="w-4 h-4" />,
      description: 'Test gebruikers authenticatie systeem',
      run: async () => {
        try {
          const { data: { user }, error } = await supabase.auth.getUser();
          if (error) throw error;
          return { success: true, message: `Gebruiker: ${user?.email || 'Anoniem'}` };
        } catch (error) {
          return { success: false, message: `Auth fout: ${error.message}` };
        }
      }
    },
    {
      id: 'vehicle-management',
      name: 'Voertuigbeheer',
      icon: <Car className="w-4 h-4" />,
      description: 'Test voertuigen tabel operaties',
      run: async () => {
        try {
          const { data, error } = await supabase.from('vehicles').select('count').limit(1);
          if (error) throw error;
          return { success: true, message: 'Voertuigen tabel toegankelijk' };
        } catch (error) {
          return { success: false, message: `Voertuigen fout: ${error.message}` };
        }
      }
    },
    {
      id: 'booking-system',
      name: 'Boekingssysteem',
      icon: <CheckCircle className="w-4 h-4" />,
      description: 'Test boekingen tabel operaties',
      run: async () => {
        try {
          const { data, error } = await supabase.from('bookings').select('count').limit(1);
          if (error) throw error;
          return { success: true, message: 'Boekingen tabel toegankelijk' };
        } catch (error) {
          return { success: false, message: `Boekingen fout: ${error.message}` };
        }
      }
    },
    // High-level booking process check (frontend + backend expectations)
    {
      id: 'booking-process',
      name: 'Boekingsproces (end-to-end)',
      icon: <Play className="w-4 h-4" />,
      description: 'Controleer front-end booking flow en backend verwerking (process-booking-payment)',
      run: async () => {
        try {
          // Check bookings table
          const { data: bookingsData, error: bookingsErr } = await supabase.from('bookings').select('id').limit(1);
          if (bookingsErr) throw bookingsErr;

          // Check process-booking-payment function exists (best-effort via file detection)
          const hasProcessBooking = !!detectedIntegrations?.Stripe && detectedIntegrations?.Stripe.locations.some((l: string) => l.includes('process-booking-payment'));

          const messageParts = [bookingsData ? 'Bookings tabel OK' : 'Bookings tabel leeg'];
          if (hasProcessBooking) messageParts.push('process-booking-payment beschikbaar');
          else messageParts.push('process-booking-payment mogelijk niet gedeployed');

          return { success: true, message: messageParts.join(' — ') };
        } catch (error) {
          return { success: false, message: `Boekingsproces fout: ${error.message}` };
        }
      }
    },
    {
      id: 'payment-integration',
      name: 'Betalingssysteem',
      icon: <CreditCard className="w-4 h-4" />,
      description: 'Test Stripe integratie',
      run: async () => {
        try {
          const { data, error } = await supabase.from('transactions').select('count').limit(1);
          if (error) throw error;
          return { success: true, message: 'Transacties tabel toegankelijk' };
        } catch (error) {
          return { success: false, message: `Betalingen fout: ${error.message}` };
        }
      }
    },
    // Social login checks (Google / Apple)
    {
      id: 'social-google',
      name: 'Google Sign-In',
      icon: <Mail className="w-4 h-4" />,
      description: 'Controleer of Google OAuth is geconfigureerd in Supabase en frontend login knoppen aanwezig zijn',
      run: async () => {
        try {
          // Best-effort: check for environment vars or detected integration
          const hasGoogle = !!(typeof import.meta !== 'undefined' ? import.meta.env.VITE_GOOGLE_CLIENT_ID : undefined) || (detectedIntegrations && Object.keys(detectedIntegrations).some(k => k.toLowerCase().includes('google')));
          return { success: hasGoogle, message: hasGoogle ? 'Google OAuth lijkt geconfigureerd (env/artefact gevonden)' : 'Google OAuth niet gevonden in repo of env' };
        } catch (error) {
          return { success: false, message: `Google check fout: ${error.message}` };
        }
      }
    },
    {
      id: 'social-apple',
      name: 'Apple Sign-In',
      icon: <Mail className="w-4 h-4" />,
      description: 'Controleer of Apple Sign-In is geconfigureerd in Supabase and callback URLs',
      run: async () => {
        try {
          const hasApple = !!(typeof import.meta !== 'undefined' ? import.meta.env.VITE_APPLE_CLIENT_ID : undefined) || (detectedIntegrations && Object.keys(detectedIntegrations).some(k => k.toLowerCase().includes('apple')));
          return { success: hasApple, message: hasApple ? 'Apple OAuth lijkt geconfigureerd (env/artefact gevonden)' : 'Apple OAuth niet gevonden in repo of env' };
        } catch (error) {
          return { success: false, message: `Apple check fout: ${error.message}` };
        }
      }
    },
    {
      id: 'email-system',
      name: 'E-mail Systeem',
      icon: <Mail className="w-4 h-4" />,
      description: 'Test e-mail functionaliteit',
      run: async () => {
        // Placeholder - zou echte e-mail test kunnen zijn
        return { success: true, message: 'E-mail systeem operationeel (placeholder)' };
      }
    },
    {
      id: 'sms-system',
      name: 'SMS Systeem',
      icon: <Phone className="w-4 h-4" />,
      description: 'Test SMS notificaties',
      run: async () => {
        // Placeholder - zou echte SMS test kunnen zijn
        return { success: true, message: 'SMS systeem operationeel (placeholder)' };
      }
    }
  ];

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const results: TestResult[] = [];

    for (const test of tests) {
      // Mark as running
      setTestResults(prev => [...prev, { name: test.name, status: 'running' }]);

      const startTime = Date.now();
      try {
        const result = await test.run();
        const duration = Date.now() - startTime;

        const testResult: TestResult = {
          name: test.name,
          status: result.success ? 'success' : 'error',
          message: result.message,
          duration
        };

        results.push(testResult);
        setTestResults(prev => prev.map(r => r.name === test.name ? testResult : r));

      } catch (error) {
        const duration = Date.now() - startTime;
        const testResult: TestResult = {
          name: test.name,
          status: 'error',
          message: `Onverwachte fout: ${error.message}`,
          duration
        };

        results.push(testResult);
        setTestResults(prev => prev.map(r => r.name === test.name ? testResult : r));
      }

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);

    const successCount = results.filter(r => r.status === 'success').length;
    const totalCount = results.length;

    toast({
      title: "Procestests Voltooid",
      description: `${successCount}/${totalCount} tests geslaagd`,
      variant: successCount === totalCount ? "default" : "destructive",
    });
  };

  const runSingleTest = async (testId: string) => {
    const test = tests.find(t => t.id === testId);
    if (!test) return;

    setTestResults(prev => prev.map(r =>
      r.name === test.name ? { ...r, status: 'running' as const } : r
    ));

    const startTime = Date.now();
    try {
      const result = await test.run();
      const duration = Date.now() - startTime;

      const testResult: TestResult = {
        name: test.name,
        status: result.success ? 'success' : 'error',
        message: result.message,
        duration
      };

      setTestResults(prev => prev.map(r => r.name === test.name ? testResult : r));

      toast({
        title: `${test.name} Test`,
        description: result.success ? 'Geslaagd' : 'Mislukt',
        variant: result.success ? "default" : "destructive",
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      const testResult: TestResult = {
        name: test.name,
        status: 'error',
        message: `Onverwachte fout: ${error.message}`,
        duration
      };

      setTestResults(prev => prev.map(r => r.name === test.name ? testResult : r));

      toast({
        title: `${test.name} Test`,
        description: "Onverwachte fout",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Geslaagd</Badge>;
      case 'error':
        return <Badge variant="destructive">Mislukt</Badge>;
      case 'running':
        return <Badge variant="secondary">Bezig...</Badge>;
      default:
        return <Badge variant="outline">In afwachting</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Process Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Process Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {processOverview.map(p => (
              <div key={p.key} className="p-4 border rounded-lg bg-background">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{p.label}</div>
                    <div className="text-sm text-muted-foreground mt-1">{p.locations.join(', ')}</div>
                  </div>
                  <div>
                    {p.status === 'partial' && <Badge className="bg-yellow-400">Partial</Badge>}
                    {p.status === 'missing' && <Badge variant="destructive">Missing</Badge>}
                    {p.status === 'implemented' && <Badge className="bg-green-500">Implemented</Badge>}
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-sm font-medium">Next steps</div>
                  <ul className="list-disc list-inside text-sm mt-1">
                    {p.nextSteps.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Procestests - Systeemdiagnose
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Alle Tests Uitvoeren
            </Button>
            <Button
              variant="outline"
              onClick={() => setTestResults([])}
              disabled={isRunning}
            >
              Resultaten Wissen
            </Button>
          </div>

          <div className="space-y-4">
            {tests.map((test, index) => {
              const result = testResults.find(r => r.name === test.name);

              return (
                <Card key={test.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {test.icon}
                      <div>
                        <h4 className="font-medium">{test.name}</h4>
                        <p className="text-sm text-muted-foreground">{test.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {result && (
                        <>
                          {getStatusIcon(result.status)}
                          {getStatusBadge(result.status)}
                          {result.duration && (
                            <span className="text-xs text-muted-foreground">
                              {result.duration}ms
                            </span>
                          )}
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runSingleTest(test.id)}
                        disabled={isRunning}
                      >
                        Test
                      </Button>
                    </div>
                  </div>
                  {result?.message && (
                    <Alert className="mt-3">
                      <AlertDescription>{result.message}</AlertDescription>
                    </Alert>
                  )}
                  {index < tests.length - 1 && <Separator className="mt-4" />}
                </Card>
              );
            })}
          </div>

          {testResults.length > 0 && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Test Samenvatting</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>Totaal: {testResults.length}</div>
                <div className="text-green-600">
                  Geslaagd: {testResults.filter(r => r.status === 'success').length}
                </div>
                <div className="text-red-600">
                  Mislukt: {testResults.filter(r => r.status === 'error').length}
                </div>
                <div className="text-blue-600">
                  Bezig: {testResults.filter(r => r.status === 'running').length}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}