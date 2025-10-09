import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Activity, 
  Zap, 
  Clock, 
  Database, 
  Wifi,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Monitor,
  Smartphone
} from "lucide-react";

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface LoadTimeMetric {
  page: string;
  loadTime: number;
  target: number;
  components: {
    dns: number;
    connect: number;
    download: number;
    render: number;
  };
}

export function PerformanceMonitor() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  const [coreMetrics, setCoreMetrics] = useState<PerformanceMetric[]>([
    {
      name: 'First Contentful Paint',
      value: 1200,
      unit: 'ms',
      threshold: 1500,
      status: 'good',
      trend: 'stable',
      description: 'Time until first content appears'
    },
    {
      name: 'Largest Contentful Paint',
      value: 2100,
      unit: 'ms',
      threshold: 2500,
      status: 'good',
      trend: 'down',
      description: 'Time until largest content element loads'
    },
    {
      name: 'Time to Interactive',
      value: 3200,
      unit: 'ms',
      threshold: 3800,
      status: 'good',
      trend: 'up',
      description: 'Time until page becomes fully interactive'
    },
    {
      name: 'Cumulative Layout Shift',
      value: 0.08,
      unit: '',
      threshold: 0.1,
      status: 'good',
      trend: 'stable',
      description: 'Visual stability score'
    }
  ]);

  const [loadTimes, setLoadTimes] = useState<LoadTimeMetric[]>([
    {
      page: 'Homepage',
      loadTime: 1200,
      target: 2000,
      components: { dns: 50, connect: 150, download: 800, render: 200 }
    },
    {
      page: 'Booking Form',
      loadTime: 950,
      target: 1500,
      components: { dns: 20, connect: 80, download: 650, render: 200 }
    },
    {
      page: 'Trips Dashboard',
      loadTime: 1800,
      target: 2000,
      components: { dns: 30, connect: 120, download: 1200, render: 450 }
    },
    {
      page: 'Wallet Page',
      loadTime: 1100,
      target: 1500,
      components: { dns: 25, connect: 100, download: 700, render: 275 }
    }
  ]);

  const [resourceMetrics, setResourceMetrics] = useState({
    bundleSize: 2.4, // MB
    gzippedSize: 0.8, // MB
    imageOptimization: 85, // %
    cacheHitRate: 92, // %
    cdnUsage: 78 // %
  });

  const [realTimeMetrics, setRealTimeMetrics] = useState({
    activeUsers: 1,
    memoryUsage: 45, // MB
    networkLatency: 120, // ms
    errorRate: 0.02, // %
    apiResponseTime: 380 // ms
  });

  // Simulate real-time monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      // Update metrics with small random variations
      setCoreMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + (Math.random() - 0.5) * (metric.value * 0.1),
        trend: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'up' : 'down') : 'stable',
        status: metric.value < metric.threshold * 0.8 ? 'good' : 
                metric.value < metric.threshold ? 'warning' : 'critical'
      })));

      setRealTimeMetrics(prev => ({
        ...prev,
        memoryUsage: Math.max(20, Math.min(80, prev.memoryUsage + (Math.random() - 0.5) * 10)),
        networkLatency: Math.max(50, Math.min(300, prev.networkLatency + (Math.random() - 0.5) * 40)),
        apiResponseTime: Math.max(200, Math.min(800, prev.apiResponseTime + (Math.random() - 0.5) * 100))
      }));

      setLastUpdate(new Date());
    }, 2000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-red-500" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-green-500" />;
      default: return <div className="w-3 h-3 rounded-full bg-gray-400" />;
    }
  };

  const runPerformanceAudit = async () => {
    setIsMonitoring(true);
    
    // Simulate performance audit
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update metrics after audit
    setCoreMetrics(prev => prev.map(metric => ({
      ...metric,
      status: 'good',
      trend: 'stable'
    })));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Monitor</h1>
          <p className="text-muted-foreground">
            Real-time performance metrics and optimization insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            {isMonitoring ? 'Live' : 'Stopped'}
          </Badge>
          <Button 
            onClick={() => setIsMonitoring(!isMonitoring)}
            variant={isMonitoring ? 'destructive' : 'default'}
          >
            {isMonitoring ? 'Stop' : 'Start'} Monitoring
          </Button>
          <Button variant="outline" onClick={runPerformanceAudit}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Run Audit
          </Button>
        </div>
      </div>

      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {coreMetrics.map((metric) => (
          <Card key={metric.name}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge className={`text-xs ${getStatusColor(metric.status)}`}>
                  {metric.status.toUpperCase()}
                </Badge>
                {getTrendIcon(metric.trend)}
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {typeof metric.value === 'number' ? metric.value.toFixed(metric.unit === '' ? 2 : 0) : metric.value}
                  <span className="text-sm text-muted-foreground ml-1">{metric.unit}</span>
                </p>
                <p className="text-sm font-medium">{metric.name}</p>
                <p className="text-xs text-muted-foreground">{metric.description}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Target: {metric.threshold}{metric.unit}</span>
                    <span>{((metric.value / metric.threshold) * 100).toFixed(0)}%</span>
                  </div>
                  <Progress 
                    value={Math.min(100, (metric.value / metric.threshold) * 100)} 
                    className="h-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Page Load Times */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Page Load Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loadTimes.map((page) => (
              <div key={page.page} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{page.page}</span>
                    <Badge 
                      variant={page.loadTime <= page.target ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {page.loadTime}ms
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Target: {page.target}ms
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 h-2 bg-gray-200 rounded">
                  <div 
                    className="bg-blue-500 rounded-l" 
                    style={{ width: `${(page.components.dns / page.loadTime) * 100}%` }}
                    title={`DNS: ${page.components.dns}ms`}
                  />
                  <div 
                    className="bg-green-500" 
                    style={{ width: `${(page.components.connect / page.loadTime) * 100}%` }}
                    title={`Connect: ${page.components.connect}ms`}
                  />
                  <div 
                    className="bg-yellow-500" 
                    style={{ width: `${(page.components.download / page.loadTime) * 100}%` }}
                    title={`Download: ${page.components.download}ms`}
                  />
                  <div 
                    className="bg-purple-500 rounded-r" 
                    style={{ width: `${(page.components.render / page.loadTime) * 100}%` }}
                    title={`Render: ${page.components.render}ms`}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>DNS: {page.components.dns}ms</span>
                  <span>Connect: {page.components.connect}ms</span>
                  <span>Download: {page.components.download}ms</span>
                  <span>Render: {page.components.render}ms</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              System Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Memory Usage</span>
                <span>{realTimeMetrics.memoryUsage.toFixed(1)} MB</span>
              </div>
              <Progress value={realTimeMetrics.memoryUsage} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Network Latency</span>
                <span>{realTimeMetrics.networkLatency.toFixed(0)} ms</span>
              </div>
              <Progress value={Math.min(100, realTimeMetrics.networkLatency / 3)} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>API Response Time</span>
                <span>{realTimeMetrics.apiResponseTime.toFixed(0)} ms</span>
              </div>
              <Progress value={Math.min(100, realTimeMetrics.apiResponseTime / 8)} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Resource Optimization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Bundle Size</span>
              <Badge variant="outline">{resourceMetrics.bundleSize} MB</Badge>
            </div>
            <div className="flex justify-between">
              <span>Gzipped Size</span>
              <Badge variant="outline">{resourceMetrics.gzippedSize} MB</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Image Optimization</span>
                <span>{resourceMetrics.imageOptimization}%</span>
              </div>
              <Progress value={resourceMetrics.imageOptimization} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Cache Hit Rate</span>
                <span>{resourceMetrics.cacheHitRate}%</span>
              </div>
              <Progress value={resourceMetrics.cacheHitRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              User Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Active Users</span>
              <Badge variant="outline">{realTimeMetrics.activeUsers}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Error Rate</span>
              <Badge 
                variant={realTimeMetrics.errorRate < 0.1 ? 'default' : 'destructive'}
              >
                {(realTimeMetrics.errorRate * 100).toFixed(2)}%
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>CDN Usage</span>
                <span>{resourceMetrics.cdnUsage}%</span>
              </div>
              <Progress value={resourceMetrics.cdnUsage} className="h-2" />
            </div>
            <div className="text-sm text-muted-foreground">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Optimization Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Good:</strong> Core Web Vitals are within target ranges. Your app provides excellent user experience.
              </AlertDescription>
            </Alert>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Suggestion:</strong> Consider implementing code splitting for the trips dashboard to reduce initial bundle size.
              </AlertDescription>
            </Alert>
            
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Good:</strong> Image optimization is at 85%. Consider using WebP format for further improvements.
              </AlertDescription>
            </Alert>
            
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Excellent:</strong> Cache hit rate of 92% indicates efficient caching strategy.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Device Performance Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Desktop Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Performance Score</span>
              <Badge className="bg-green-100 text-green-800">95/100</Badge>
            </div>
            <div className="flex justify-between">
              <span>First Paint</span>
              <span>1.1s</span>
            </div>
            <div className="flex justify-between">
              <span>Time to Interactive</span>
              <span>2.8s</span>
            </div>
            <div className="flex justify-between">
              <span>Speed Index</span>
              <span>1.9s</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Mobile Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Performance Score</span>
              <Badge className="bg-yellow-100 text-yellow-800">87/100</Badge>
            </div>
            <div className="flex justify-between">
              <span>First Paint</span>
              <span>1.8s</span>
            </div>
            <div className="flex justify-between">
              <span>Time to Interactive</span>
              <span>4.2s</span>
            </div>
            <div className="flex justify-between">
              <span>Speed Index</span>
              <span>3.1s</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}