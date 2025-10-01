/**
 * API Key Validator Component
 * 
 * Provides a comprehensive interface for validating, testing, and managing
 * all API keys and external service configurations.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Check, 
  X, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink, 
  Key,
  Database,
  CreditCard,
  Map,
  MessageSquare,
  BarChart3,
  Cloud,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  API_REGISTRY, 
  SERVICE_CONFIGS, 
  getConfigurationStatus, 
  validateApiKey,
  type ApiConfig 
} from '@/config/api-config';

interface ValidationResult {
  key: string;
  name: string;
  status: 'valid' | 'invalid' | 'missing' | 'testing';
  message?: string;
  category: string;
  required: boolean;
  securityLevel: string;
}

interface ServiceStatus {
  name: string;
  enabled: boolean;
  status: 'healthy' | 'unhealthy' | 'unknown' | 'testing';
  message?: string;
  lastTested?: Date;
}

const CATEGORY_ICONS = {
  database: Database,
  payment: CreditCard,
  mapping: Map,
  communication: MessageSquare,
  analytics: BarChart3,
  storage: Cloud,
  monitoring: Shield,
} as const;

const SECURITY_COLORS = {
  critical: 'bg-red-500 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-black',
  low: 'bg-green-500 text-white',
} as const;

export function ApiKeyValidator() {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [serviceStatuses, setServiceStatuses] = useState<ServiceStatus[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Initialize validation results
  useEffect(() => {
    const results: ValidationResult[] = Object.entries(API_REGISTRY).map(([key, config]) => {
      const envKey = `VITE_${key}`;
      const value = import.meta.env[envKey] || import.meta.env[key] || '';
      
      let status: ValidationResult['status'] = 'missing';
      let message = '';

      if (value) {
        const isValid = validateApiKey(key, value);
        status = isValid ? 'valid' : 'invalid';
        message = isValid ? 'Key format is valid' : 'Invalid key format';
      } else if (config.required) {
        message = 'Required key is missing';
      } else {
        message = 'Optional key not configured';
        status = 'missing';
      }

      return {
        key,
        name: config.name,
        status,
        message,
        category: config.category,
        required: config.required,
        securityLevel: config.securityLevel,
      };
    });

    setValidationResults(results);
    
    // Initialize service statuses
    const services: ServiceStatus[] = Object.entries(SERVICE_CONFIGS).map(([name, config]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      enabled: config.enabled,
      status: config.enabled ? 'unknown' : 'unhealthy',
      message: config.enabled ? 'Service configured' : 'Service not configured',
    }));
    
    setServiceStatuses(services);
  }, []);

  // Test individual API key
  const testApiKey = async (keyName: string) => {
    setValidationResults(prev => prev.map(result => 
      result.key === keyName 
        ? { ...result, status: 'testing' }
        : result
    ));

    // Simulate API testing (replace with actual API calls)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock test result - replace with actual API testing logic
    const success = Math.random() > 0.3; // 70% success rate for demo
    
    setValidationResults(prev => prev.map(result => 
      result.key === keyName 
        ? { 
            ...result, 
            status: success ? 'valid' : 'invalid',
            message: success ? 'API connection successful' : 'API connection failed'
          }
        : result
    ));
  };

  // Test all services
  const testAllServices = async () => {
    setIsValidating(true);
    
    // Test each service sequentially
    for (const service of serviceStatuses) {
      if (service.enabled) {
        setServiceStatuses(prev => prev.map(s => 
          s.name === service.name 
            ? { ...s, status: 'testing' }
            : s
        ));

        // Simulate service testing
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const success = Math.random() > 0.2; // 80% success rate for demo
        
        setServiceStatuses(prev => prev.map(s => 
          s.name === service.name 
            ? { 
                ...s, 
                status: success ? 'healthy' : 'unhealthy',
                message: success ? 'Service is operational' : 'Service connection failed',
                lastTested: new Date()
              }
            : s
        ));
      }
    }
    
    setIsValidating(false);
  };

  const configStatus = getConfigurationStatus();
  
  const getStatusIcon = (status: ValidationResult['status']) => {
    switch (status) {
      case 'valid':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'invalid':
        return <X className="w-4 h-4 text-red-500" />;
      case 'missing':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'testing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getServiceStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'unhealthy':
        return <X className="w-4 h-4 text-red-500" />;
      case 'testing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const categoryResults = validationResults.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, ValidationResult[]>);

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Configuration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Configuration Progress</span>
              <Badge variant={configStatus.percentage === 100 ? 'default' : 'secondary'}>
                {configStatus.configured}/{configStatus.total} configured
              </Badge>
            </div>
            <Progress value={configStatus.percentage} className="w-full" />
            
            {configStatus.missing > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {configStatus.missing} required API keys are missing. 
                  Check the documentation for setup instructions.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={testAllServices} 
                disabled={isValidating}
                className="gap-2"
              >
                {isValidating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Test All Services
              </Button>
              <Button variant="outline" asChild>
                <a href="/docs/api-keys.md" target="_blank" className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Documentation
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {validationResults.map((result) => (
              <Card key={result.key}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <div className="font-medium">{result.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {result.message}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={SECURITY_COLORS[result.securityLevel as keyof typeof SECURITY_COLORS]}
                      >
                        {result.securityLevel}
                      </Badge>
                      {result.required && (
                        <Badge variant="outline">Required</Badge>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testApiKey(result.key)}
                        disabled={result.status === 'testing' || result.status === 'missing'}
                      >
                        Test
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          {Object.entries(categoryResults).map(([category, results]) => {
            const IconComponent = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];
            const validCount = results.filter(r => r.status === 'valid').length;
            
            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconComponent className="w-5 h-5" />
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                    <Badge variant="outline">
                      {validCount}/{results.length} configured
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {results.map((result) => (
                      <div key={result.key} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result.status)}
                          <span className={cn(
                            result.required && result.status === 'missing' && 'font-medium text-red-600'
                          )}>
                            {result.name}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => testApiKey(result.key)}
                          disabled={result.status === 'testing' || result.status === 'missing'}
                        >
                          Test
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="grid gap-4">
            {serviceStatuses.map((service) => (
              <Card key={service.name}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getServiceStatusIcon(service.status)}
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {service.message}
                          {service.lastTested && (
                            <span className="ml-2">
                              (Last tested: {service.lastTested.toLocaleTimeString()})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={service.enabled ? 'default' : 'secondary'}>
                        {service.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}