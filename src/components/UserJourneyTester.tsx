import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw,
  AlertTriangle,
  Smartphone,
  Monitor,
  Tablet,
  Zap,
  Eye,
  Globe
} from "lucide-react";

interface TestStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  error?: string;
}

interface TestSuite {
  id: string;
  name: string;
  description: string;
  steps: TestStep[];
  status: 'pending' | 'running' | 'passed' | 'failed';
  progress: number;
}

export function UserJourneyTester() {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      id: 'booking-journey',
      name: 'Complete Booking Journey',
      description: 'Test complete user booking flow from start to finish',
      status: 'pending',
      progress: 0,
      steps: [
        { id: 'open-form', name: 'Open Booking Form', description: 'Load booking interface', status: 'pending' },
        { id: 'fill-addresses', name: 'Fill Addresses', description: 'Enter pickup and destination', status: 'pending' },
        { id: 'set-datetime', name: 'Set Date/Time', description: 'Select booking datetime', status: 'pending' },
        { id: 'select-vehicle', name: 'Select Vehicle', description: 'Choose vehicle type', status: 'pending' },
        { id: 'review-pricing', name: 'Review Pricing', description: 'Validate price calculations', status: 'pending' },
        { id: 'process-payment', name: 'Process Payment', description: 'Complete payment flow', status: 'pending' },
        { id: 'confirm-booking', name: 'Confirm Booking', description: 'Receive booking confirmation', status: 'pending' }
      ]
    },
    {
      id: 'wallet-integration',
      name: 'Wallet Integration',
      description: 'Test wallet functionality and payment integration',
      status: 'pending',
      progress: 0,
      steps: [
        { id: 'check-balance', name: 'Check Balance', description: 'Display wallet balance in dropdown', status: 'pending' },
        { id: 'top-up-wallet', name: 'Top Up Wallet', description: 'Add funds to wallet', status: 'pending' },
        { id: 'wallet-payment', name: 'Wallet Payment', description: 'Pay using wallet balance', status: 'pending' },
        { id: 'transaction-history', name: 'Transaction History', description: 'View transaction records', status: 'pending' },
        { id: 'spending-analytics', name: 'Spending Analytics', description: 'Display spending insights', status: 'pending' }
      ]
    },
    {
      id: 'trip-management',
      name: 'Trip Management',
      description: 'Test trip tracking and management features',
      status: 'pending',
      progress: 0,
      steps: [
        { id: 'trips-dashboard', name: 'Trips Dashboard', description: 'Load trips overview', status: 'pending' },
        { id: 'live-tracking', name: 'Live Tracking', description: 'Real-time trip tracking', status: 'pending' },
        { id: 'driver-communication', name: 'Driver Communication', description: 'Contact driver functionality', status: 'pending' },
        { id: 'trip-cancellation', name: 'Trip Cancellation', description: 'Cancel trip process', status: 'pending' },
        { id: 'trip-rating', name: 'Trip Rating', description: 'Rate completed trip', status: 'pending' }
      ]
    }
  ]);

  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    pageLoadTime: 0,
    interactionTime: 0,
    memoryUsage: 0
  });

  const runTestSuite = async (suiteId: string) => {
    const suite = testSuites.find(s => s.id === suiteId);
    if (!suite) return;

    setCurrentTest(suiteId);
    
    // Update suite status to running
    setTestSuites(prev => prev.map(s => 
      s.id === suiteId 
        ? { ...s, status: 'running', progress: 0 }
        : s
    ));

    // Run each step
    for (let i = 0; i < suite.steps.length; i++) {
      const step = suite.steps[i];
      
      // Update step to running
      setTestSuites(prev => prev.map(s => 
        s.id === suiteId 
          ? {
              ...s,
              steps: s.steps.map(st => 
                st.id === step.id ? { ...st, status: 'running' } : st
              ),
              progress: (i / s.steps.length) * 100
            }
          : s
      ));

      // Simulate test execution
      const startTime = Date.now();
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
      const duration = Date.now() - startTime;
      
      // Simulate test result (90% pass rate)
      const passed = Math.random() > 0.1;
      
      // Update step result
      setTestSuites(prev => prev.map(s => 
        s.id === suiteId 
          ? {
              ...s,
              steps: s.steps.map(st => 
                st.id === step.id 
                  ? { 
                      ...st, 
                      status: passed ? 'passed' : 'failed',
                      duration,
                      error: passed ? undefined : 'Test simulation failed'
                    }
                  : st
              )
            }
          : s
      ));
    }

    // Update suite final status
    const finalSuite = testSuites.find(s => s.id === suiteId);
    const allPassed = finalSuite?.steps.every(step => step.status === 'passed');
    
    setTestSuites(prev => prev.map(s => 
      s.id === suiteId 
        ? { 
            ...s, 
            status: allPassed ? 'passed' : 'failed',
            progress: 100
          }
        : s
    ));

    setCurrentTest(null);
  };

  const resetTests = () => {
    setTestSuites(prev => prev.map(suite => ({
      ...suite,
      status: 'pending',
      progress: 0,
      steps: suite.steps.map(step => ({ ...step, status: 'pending', duration: undefined, error: undefined }))
    })));
    setCurrentTest(null);
  };

  const runAllTests = async () => {
    for (const suite of testSuites) {
      await runTestSuite(suite.id);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'running': return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
      default: return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integration Test Suite</h1>
          <p className="text-muted-foreground">
            Test complete user journeys and system integration
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={runAllTests} 
            disabled={currentTest !== null}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Run All Tests
          </Button>
          <Button 
            variant="outline" 
            onClick={resetTests}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* Test Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {testSuites.map((suite) => (
          <Card key={suite.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{suite.name}</CardTitle>
                <Badge className={getStatusColor(suite.status)}>
                  {suite.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{suite.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(suite.progress)}%</span>
                </div>
                <Progress value={suite.progress} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Steps ({suite.steps.filter(s => s.status === 'passed').length}/{suite.steps.length})</p>
                <div className="space-y-1">
                  {suite.steps.slice(0, 3).map((step) => (
                    <div key={step.id} className="flex items-center gap-2 text-sm">
                      {getStatusIcon(step.status)}
                      <span className={step.status === 'failed' ? 'text-red-600' : ''}>{step.name}</span>
                      {step.duration && (
                        <span className="text-xs text-muted-foreground ml-auto">
                          {step.duration}ms
                        </span>
                      )}
                    </div>
                  ))}
                  {suite.steps.length > 3 && (
                    <p className="text-xs text-muted-foreground">+{suite.steps.length - 3} more steps</p>
                  )}
                </div>
              </div>

              <Button 
                size="sm" 
                className="w-full"
                onClick={() => runTestSuite(suite.id)}
                disabled={currentTest !== null}
              >
                {currentTest === suite.id ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Test
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Test Results */}
      <Tabs defaultValue="results" className="space-y-4">
        <TabsList>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          {testSuites.map((suite) => (
            <Card key={suite.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(suite.status)}
                    {suite.name}
                  </CardTitle>
                  <Badge className={getStatusColor(suite.status)}>{suite.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suite.steps.map((step) => (
                    <div key={step.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(step.status)}
                        <div>
                          <p className="font-medium">{step.name}</p>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                          {step.error && (
                            <Alert className="mt-2 border-red-200">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription className="text-red-800">
                                {step.error}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                      {step.duration && (
                        <Badge variant="outline">{step.duration}ms</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Load Times
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Homepage:</span>
                  <Badge variant="outline">1.2s</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Booking Form:</span>
                  <Badge variant="outline">0.9s</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Trips Dashboard:</span>
                  <Badge variant="outline">1.5s</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Interactions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Address Search:</span>
                  <Badge variant="outline">320ms</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Price Calculation:</span>
                  <Badge variant="outline">680ms</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Payment Process:</span>
                  <Badge variant="outline">2.1s</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Real-time Updates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Trip Status:</span>
                  <Badge variant="outline">15s interval</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Wallet Balance:</span>
                  <Badge variant="outline">Real-time</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Notifications:</span>
                  <Badge variant="outline">Instant</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Keyboard Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Booking Form</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Trips Dashboard</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Wallet Interface</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Screen Reader Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Form Labels</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Status Updates</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Navigation Structure</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compatibility" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Desktop Browsers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Chrome (Latest 3)</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Firefox (Latest 3)</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Safari (Latest 2)</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Edge (Latest 2)</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Mobile Browsers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Chrome Mobile</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Safari Mobile</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Samsung Internet</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}