import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { UserJourneyTester } from "@/components/UserJourneyTester";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { 
  Code, 
  TestTube, 
  Activity, 
  Settings, 
  FileText, 
  GitBranch,
  Database,
  Shield,
  Globe,
  Smartphone,
  Monitor,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  TrendingUp
} from "lucide-react";

export default function DevelopmentDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // System status data
  const systemStatus = {
    build: { status: 'success', time: '2.3s', lastRun: '5 min ago' },
    tests: { status: 'passing', coverage: '87%', lastRun: '3 min ago' },
    deployment: { status: 'deployed', version: 'v1.2.1', environment: 'production' },
    performance: { status: 'excellent', score: 95, lastCheck: '1 min ago' }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
      case 'passing':
      case 'deployed':
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'warning':
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'error':
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'passing':
      case 'deployed':
      case 'excellent':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
      case 'degraded':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'failed':
      case 'error':
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const projectStats = {
    components: 45,
    pages: 12,
    hooks: 18,
    services: 8,
    totalLines: 12500,
    lastCommit: '2 hours ago'
  };

  const recentActivity = [
    { type: 'commit', message: 'Implement trip management system', time: '2 hours ago', user: 'Developer' },
    { type: 'deploy', message: 'Deploy to production v1.2.1', time: '4 hours ago', user: 'CI/CD' },
    { type: 'test', message: 'All integration tests passing', time: '1 hour ago', user: 'Test Runner' },
    { type: 'performance', message: 'Performance score improved to 95', time: '30 min ago', user: 'Monitor' }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'commit': return <GitBranch className="w-4 h-4 text-blue-600" />;
      case 'deploy': return <Globe className="w-4 h-4 text-green-600" />;
      case 'test': return <TestTube className="w-4 h-4 text-purple-600" />;
      case 'performance': return <TrendingUp className="w-4 h-4 text-orange-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Development Dashboard</h1>
            <p className="text-muted-foreground">
              Taxi.Frades 2.0 - Development Tools & Monitoring
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            System Healthy
          </Badge>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              Testing
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="deployment" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Deployment
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* System Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(systemStatus.build.status)}
                      <span className="font-medium">Build</span>
                    </div>
                    <Badge className={getStatusColor(systemStatus.build.status)}>
                      {systemStatus.build.status}
                    </Badge>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Time: {systemStatus.build.time}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {systemStatus.build.lastRun}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(systemStatus.tests.status)}
                      <span className="font-medium">Tests</span>
                    </div>
                    <Badge className={getStatusColor(systemStatus.tests.status)}>
                      {systemStatus.tests.coverage}
                    </Badge>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Coverage: {systemStatus.tests.coverage}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {systemStatus.tests.lastRun}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(systemStatus.deployment.status)}
                      <span className="font-medium">Deployment</span>
                    </div>
                    <Badge className={getStatusColor(systemStatus.deployment.status)}>
                      {systemStatus.deployment.version}
                    </Badge>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Environment: {systemStatus.deployment.environment}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Live
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(systemStatus.performance.status)}
                      <span className="font-medium">Performance</span>
                    </div>
                    <Badge className={getStatusColor(systemStatus.performance.status)}>
                      {systemStatus.performance.score}/100
                    </Badge>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Lighthouse Score
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {systemStatus.performance.lastCheck}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Project Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Project Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold">{projectStats.components}</p>
                      <p className="text-sm text-muted-foreground">Components</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold">{projectStats.pages}</p>
                      <p className="text-sm text-muted-foreground">Pages</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold">{projectStats.hooks}</p>
                      <p className="text-sm text-muted-foreground">Hooks</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold">{projectStats.services}</p>
                      <p className="text-sm text-muted-foreground">Services</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between">
                      <span>Total Lines of Code:</span>
                      <span className="font-medium">{projectStats.totalLines.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Last Commit:</span>
                      <span className="font-medium">{projectStats.lastCommit}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded-lg">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{activity.message}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{activity.user}</span>
                            <span>•</span>
                            <span>{activity.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="outline" className="flex items-center gap-2">
                    <TestTube className="w-4 h-4" />
                    Run Tests
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Build Project
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Deploy Staging
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Performance Audit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Testing Tab */}
          <TabsContent value="testing">
            <UserJourneyTester />
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <PerformanceMonitor />
          </TabsContent>

          {/* Deployment Tab */}  
          <TabsContent value="deployment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Deployment Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Development</span>
                      <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Branch: copilot/vscode1759441614399</p>
                    <p className="text-sm text-muted-foreground">URL: localhost:8081</p>
                    <p className="text-xs text-muted-foreground mt-2">Last deploy: Now</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Staging</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Branch: main</p>
                    <p className="text-sm text-muted-foreground">URL: staging.taxi-frades.com</p>
                    <p className="text-xs text-muted-foreground mt-2">Last deploy: 2 hours ago</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Production</span>
                      <Badge className="bg-green-100 text-green-800">Live</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Branch: main</p>
                    <p className="text-sm text-muted-foreground">URL: taxi-frades.com</p>
                    <p className="text-xs text-muted-foreground mt-2">Last deploy: 1 day ago</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button>Deploy to Staging</Button>
                  <Button variant="outline">Deploy to Production</Button>
                  <Button variant="outline">Rollback</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <Users className="w-8 h-8 text-blue-600" />
                    <div className="text-right">
                      <p className="text-2xl font-bold">1,234</p>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <Globe className="w-8 h-8 text-green-600" />
                    <div className="text-right">
                      <p className="text-2xl font-bold">5,678</p>
                      <p className="text-sm text-muted-foreground">Page Views</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <TestTube className="w-8 h-8 text-purple-600" />
                    <div className="text-right">
                      <p className="text-2xl font-bold">342</p>
                      <p className="text-sm text-muted-foreground">Bookings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <TrendingUp className="w-8 h-8 text-orange-600" />
                    <div className="text-right">
                      <p className="text-2xl font-bold">98.5%</p>
                      <p className="text-sm text-muted-foreground">Uptime</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Feature Usage Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Booking Form Usage</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <span className="text-sm">85%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Trip Management</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                      </div>
                      <span className="text-sm">72%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Wallet Usage</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                      </div>
                      <span className="text-sm">68%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Real-time Tracking</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-600 h-2 rounded-full" style={{ width: '91%' }}></div>
                      </div>
                      <span className="text-sm">91%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}