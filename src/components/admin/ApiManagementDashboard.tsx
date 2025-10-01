/**
 * API Management Dashboard
 * 
 * Comprehensive dashboard for managing all API configurations,
 * monitoring service health, and accessing documentation.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Key, 
  BookOpen, 
  Activity, 
  AlertTriangle,
  ExternalLink,
  Download
} from 'lucide-react';
import { ApiKeyValidator } from './ApiKeyValidator';
import { ApiIntegrationGuide } from './ApiIntegrationGuide';
import { getConfigurationStatus, SERVICE_CONFIGS } from '@/config/api-config';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  variant: 'default' | 'outline' | 'secondary';
}

export function ApiManagementDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const configStatus = getConfigurationStatus();

  const downloadEnvTemplate = () => {
    const envContent = `# FRADES Taxi API Configuration
# Copy this template and fill in your actual API keys

# =================================================================
# CORE SERVICES (Required)
# =================================================================
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# =================================================================
# OPTIONAL SERVICES
# =================================================================
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here

SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id_here

VITE_GA_MEASUREMENT_ID=your_ga_measurement_id_here
VITE_SENTRY_DSN=your_sentry_dsn_here

# =================================================================
# ENVIRONMENT SETTINGS
# =================================================================
NODE_ENV=development
VITE_APP_ENV=development
VITE_API_BASE_URL=http://localhost:8080
`;

    const blob = new Blob([envContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.env.template';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const quickActions: QuickAction[] = [
    {
      title: 'Download .env Template',
      description: 'Get a pre-configured environment file template',
      icon: Download,
      action: downloadEnvTemplate,
      variant: 'default',
    },
    {
      title: 'View Documentation',
      description: 'Access comprehensive API setup guides',
      icon: BookOpen,
      action: () => window.open('/docs/api-keys.md', '_blank'),
      variant: 'outline',
    },
    {
      title: 'Test All Services',
      description: 'Run connectivity tests for all configured APIs',
      icon: Activity,
      action: () => setActiveTab('validator'),
      variant: 'outline',
    },
  ];

  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const enabledServices = Object.entries(SERVICE_CONFIGS).filter(([_, config]) => config.enabled);
  const totalServices = Object.keys(SERVICE_CONFIGS).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Management</h1>
          <p className="text-muted-foreground">
            Configure and monitor all external API integrations
          </p>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Required APIs</p>
                <p className={`text-2xl font-bold ${getStatusColor(configStatus.percentage)}`}>
                  {configStatus.configured}/{configStatus.total}
                </p>
              </div>
              <Key className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Services Enabled</p>
                <p className="text-2xl font-bold text-blue-600">
                  {enabledServices.length}/{totalServices}
                </p>
              </div>
              <Settings className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Configuration</p>
                <p className={`text-2xl font-bold ${getStatusColor(configStatus.percentage)}`}>
                  {configStatus.percentage}%
                </p>
              </div>
              <Activity className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Issues</p>
                <p className={`text-2xl font-bold ${configStatus.missing > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {configStatus.missing}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.title}
                variant={action.variant}
                onClick={action.action}
                className="h-auto flex-col gap-2 p-4"
              >
                <action.icon className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(SERVICE_CONFIGS).map(([serviceName, config]) => (
              <div
                key={serviceName}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      config.enabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                  <span className="font-medium capitalize">{serviceName}</span>
                </div>
                <Badge variant={config.enabled ? 'default' : 'secondary'}>
                  {config.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="validator">API Validator</TabsTrigger>
          <TabsTrigger value="guide">Setup Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {configStatus.missing > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="w-5 h-5" />
                  Configuration Incomplete
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-yellow-700 mb-4">
                  You have {configStatus.missing} required API keys missing. 
                  Your application may not function properly until these are configured.
                </p>
                <div className="space-y-2">
                  {configStatus.missingKeys.map((key) => (
                    <Badge key={key} variant="outline" className="mr-2">
                      {key}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm">
                    1
                  </div>
                  <div>
                    <div className="font-medium">Download Environment Template</div>
                    <div className="text-sm text-muted-foreground">
                      Get a pre-configured .env file with all required variables
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm">
                    2
                  </div>
                  <div>
                    <div className="font-medium">Follow Setup Guides</div>
                    <div className="text-sm text-muted-foreground">
                      Use the integration guide to set up each service step-by-step
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm">
                    3
                  </div>
                  <div>
                    <div className="font-medium">Validate Configuration</div>
                    <div className="text-sm text-muted-foreground">
                      Test all APIs to ensure they're working correctly
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validator">
          <ApiKeyValidator />
        </TabsContent>

        <TabsContent value="guide">
          <ApiIntegrationGuide />
        </TabsContent>
      </Tabs>
    </div>
  );
}