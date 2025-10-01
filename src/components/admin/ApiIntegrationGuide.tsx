/**
 * API Integration Guide Component
 * 
 * Step-by-step guide for setting up each API integration
 * with instructions, code examples, and verification steps.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ChevronRight, 
  ExternalLink, 
  Copy, 
  Check,
  AlertTriangle,
  Code,
  Settings,
  Key,
  Database,
  CreditCard,
  Map,
  MessageSquare,
  BarChart3,
  Cloud
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IntegrationStep {
  id: string;
  title: string;
  description: string;
  code?: string;
  link?: string;
  warning?: string;
}

interface ApiIntegration {
  id: string;
  name: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  priority: 'critical' | 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  timeEstimate: string;
  description: string;
  steps: IntegrationStep[];
  testing: IntegrationStep[];
  troubleshooting: IntegrationStep[];
}

const INTEGRATIONS: ApiIntegration[] = [
  {
    id: 'supabase',
    name: 'Supabase Database & Auth',
    category: 'database',
    icon: Database,
    priority: 'critical',
    difficulty: 'easy',
    timeEstimate: '15 minutes',
    description: 'Set up your backend database, authentication, and real-time subscriptions',
    steps: [
      {
        id: 'create-project',
        title: 'Create Supabase Project',
        description: 'Sign up at Supabase and create a new project',
        link: 'https://supabase.com/dashboard/new',
      },
      {
        id: 'get-keys',
        title: 'Get API Keys',
        description: 'Navigate to Settings > API to find your project URL and anon key',
        code: `VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here`,
      },
      {
        id: 'run-migrations',
        title: 'Run Database Migrations',
        description: 'Execute the migration files to set up your database schema',
        code: `cd supabase
npx supabase db push`,
      },
      {
        id: 'configure-auth',
        title: 'Configure Authentication',
        description: 'Set up email/password auth and configure redirect URLs',
        warning: 'Make sure to add your domain to the allowed origins in Supabase Auth settings',
      },
    ],
    testing: [
      {
        id: 'test-connection',
        title: 'Test Database Connection',
        description: 'Run the test script to verify database connectivity',
        code: `npm run test:db`,
      },
    ],
    troubleshooting: [
      {
        id: 'cors-issues',
        title: 'CORS Issues',
        description: 'Add your domain to allowed origins in Supabase dashboard',
      },
    ],
  },
  {
    id: 'stripe',
    name: 'Stripe Payments',
    category: 'payment',
    icon: CreditCard,
    priority: 'critical',
    difficulty: 'medium',
    timeEstimate: '30 minutes',
    description: 'Accept credit card payments and manage subscriptions',
    steps: [
      {
        id: 'create-account',
        title: 'Create Stripe Account',
        description: 'Sign up for a Stripe account and complete business verification',
        link: 'https://dashboard.stripe.com/register',
      },
      {
        id: 'get-api-keys',
        title: 'Get API Keys',
        description: 'Find your publishable and secret keys in the Stripe dashboard',
        code: `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here`,
        warning: 'Use test keys for development, live keys for production',
      },
      {
        id: 'setup-webhooks',
        title: 'Configure Webhooks',
        description: 'Set up webhook endpoints for payment notifications',
        code: `Webhook URL: https://your-domain.com/api/webhooks/stripe
Events to send:
- payment_intent.succeeded
- payment_intent.payment_failed
- customer.subscription.created
- customer.subscription.updated`,
      },
      {
        id: 'test-payments',
        title: 'Test Payment Flow',
        description: 'Use Stripe test cards to verify payment processing',
        code: `Test Card Numbers:
4242 4242 4242 4242 (Visa - Success)
4000 0000 0000 0002 (Visa - Declined)
4000 0025 0000 3155 (Visa - 3D Secure)`,
      },
    ],
    testing: [
      {
        id: 'test-integration',
        title: 'Test Payment Integration',
        description: 'Process a test payment to verify the integration',
      },
    ],
    troubleshooting: [
      {
        id: 'webhook-errors',
        title: 'Webhook Signature Verification',
        description: 'Ensure webhook secret is correctly configured',
      },
    ],
  },
  {
    id: 'google-maps',
    name: 'Google Maps Platform',
    category: 'mapping',
    icon: Map,
    priority: 'high',
    difficulty: 'medium',
    timeEstimate: '20 minutes',
    description: 'Maps, geocoding, directions, and places autocomplete',
    steps: [
      {
        id: 'enable-apis',
        title: 'Enable Required APIs',
        description: 'Enable Maps JavaScript API, Places API, and Directions API',
        link: 'https://console.cloud.google.com/apis/library',
        code: `Required APIs:
- Maps JavaScript API
- Places API
- Directions API
- Geocoding API
- Distance Matrix API`,
      },
      {
        id: 'create-api-key',
        title: 'Create API Key',
        description: 'Generate an API key with proper restrictions',
        code: `VITE_GOOGLE_MAPS_API_KEY=AIzaYourApiKeyHere`,
        warning: 'Restrict API key to your domain for security',
      },
      {
        id: 'set-restrictions',
        title: 'Configure API Key Restrictions',
        description: 'Set HTTP referrer restrictions for security',
        code: `Allowed domains:
- localhost:8080/*
- your-domain.com/*
- *.your-domain.com/*`,
      },
    ],
    testing: [
      {
        id: 'test-maps',
        title: 'Test Map Loading',
        description: 'Verify that maps load correctly in your application',
      },
    ],
    troubleshooting: [
      {
        id: 'api-quota',
        title: 'API Quota Exceeded',
        description: 'Monitor usage and increase quotas if needed',
      },
    ],
  },
  {
    id: 'twilio',
    name: 'Twilio SMS',
    category: 'communication',
    icon: MessageSquare,
    priority: 'medium',
    difficulty: 'easy',
    timeEstimate: '15 minutes',
    description: 'Send SMS notifications and booking confirmations',
    steps: [
      {
        id: 'create-account',
        title: 'Create Twilio Account',
        description: 'Sign up for Twilio and verify your phone number',
        link: 'https://www.twilio.com/try-twilio',
      },
      {
        id: 'get-credentials',
        title: 'Get Account Credentials',
        description: 'Find your Account SID and Auth Token in the console',
        code: `TWILIO_ACCOUNT_SID=ACyour_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890`,
      },
      {
        id: 'buy-phone-number',
        title: 'Purchase Phone Number',
        description: 'Buy a phone number for sending SMS messages',
        warning: 'Choose a number appropriate for your target market',
      },
    ],
    testing: [
      {
        id: 'send-test-sms',
        title: 'Send Test SMS',
        description: 'Send a test message to verify the integration',
      },
    ],
    troubleshooting: [
      {
        id: 'delivery-issues',
        title: 'Message Delivery Issues',
        description: 'Check Twilio logs for delivery status and errors',
      },
    ],
  },
];

export function ApiIntegrationGuide() {
  const [activeIntegration, setActiveIntegration] = useState<string>('supabase');
  const [activeTab, setActiveTab] = useState('steps');
  const [copiedCode, setCopiedCode] = useState<string>('');
  const { toast } = useToast();

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      toast({
        title: 'Copied to clipboard',
        description: 'Code has been copied to your clipboard',
      });
      setTimeout(() => setCopiedCode(''), 2000);
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the code manually',
        variant: 'destructive',
      });
    }
  };

  const currentIntegration = INTEGRATIONS.find(i => i.id === activeIntegration) || INTEGRATIONS[0];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderSteps = (steps: IntegrationStep[]) => (
    <div className="space-y-6">
      {steps.map((step, index) => (
        <Card key={step.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm">
                {index + 1}
              </div>
              {step.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{step.description}</p>
            
            {step.warning && (
              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{step.warning}</AlertDescription>
              </Alert>
            )}
            
            {step.code && (
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{step.code}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(step.code!, step.id)}
                >
                  {copiedCode === step.id ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}
            
            {step.link && (
              <Button asChild variant="outline" className="mt-4">
                <a href={step.link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in Browser
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Integration List */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {INTEGRATIONS.map((integration) => {
                const IconComponent = integration.icon;
                return (
                  <button
                    key={integration.id}
                    onClick={() => setActiveIntegration(integration.id)}
                    className={`w-full text-left p-3 hover:bg-muted transition-colors ${
                      activeIntegration === integration.id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-5 h-5" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{integration.name}</div>
                        <div className="text-xs text-muted-foreground">{integration.timeEstimate}</div>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration Details */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <currentIntegration.icon className="w-6 h-6" />
                <div>
                  <CardTitle>{currentIntegration.name}</CardTitle>
                  <p className="text-muted-foreground">{currentIntegration.description}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge className={getPriorityColor(currentIntegration.priority)}>
                  {currentIntegration.priority}
                </Badge>
                <Badge variant="outline" className={getDifficultyColor(currentIntegration.difficulty)}>
                  {currentIntegration.difficulty}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="steps">Setup Steps</TabsTrigger>
                <TabsTrigger value="testing">Testing</TabsTrigger>
                <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
              </TabsList>

              <TabsContent value="steps" className="mt-6">
                {renderSteps(currentIntegration.steps)}
              </TabsContent>

              <TabsContent value="testing" className="mt-6">
                {renderSteps(currentIntegration.testing)}
              </TabsContent>

              <TabsContent value="troubleshooting" className="mt-6">
                {renderSteps(currentIntegration.troubleshooting)}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}