import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "./admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Activity, Users, Eye, Clock, AlertTriangle, Zap, Server, Cpu,
  HardDrive, Wifi, Globe, ArrowUp, ArrowDown, Minus, RefreshCw,
  Monitor, Smartphone, BarChart3, TrendingUp, Shield, Search,
  Layers, Database, CheckCircle, XCircle, AlertCircle, Lightbulb
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#14b8a6'];

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; icon: any }> = {
    healthy: { color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle },
    warning: { color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: AlertCircle },
    degraded: { color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: AlertCircle },
    critical: { color: "bg-red-500/10 text-red-500 border-red-500/20", icon: XCircle },
    down: { color: "bg-red-500/10 text-red-500 border-red-500/20", icon: XCircle },
  };
  const c = config[status] || config.healthy;
  const Icon = c.icon;
  return (
    <Badge variant="outline" className={`${c.color} text-xs`}>
      <Icon className="w-3 h-3 mr-1" />
      {status === 'healthy' ? 'Gesund' : status === 'warning' ? 'Warnung' : status === 'degraded' ? 'Beeintr.' : status === 'critical' ? 'Kritisch' : 'Offline'}
    </Badge>
  );
}

function KPICard({ title, value, subtitle, icon: Icon, trend, color = "text-purple-500" }: {
  title: string; value: string | number; subtitle?: string; icon: any; trend?: string; color?: string;
}) {
  return (
    <Card className="bg-slate-900 border-slate-700/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
            {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-2 rounded-lg bg-slate-800 ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        {trend && (
          <div className="mt-2 flex items-center text-xs">
            {trend.startsWith('+') ? <ArrowUp className="w-3 h-3 text-emerald-400 mr-1" /> :
             trend.startsWith('-') ? <ArrowDown className="w-3 h-3 text-red-400 mr-1" /> :
             <Minus className="w-3 h-3 text-slate-400 mr-1" />}
            <span className={trend.startsWith('+') ? 'text-emerald-400' : trend.startsWith('-') ? 'text-red-400' : 'text-slate-400'}>{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function GaugeChart({ value, max = 100, label }: { value: number; max?: number; label: string }) {
  const pct = Math.min((value / max) * 100, 100);
  const gaugeColor = pct > 80 ? '#ef4444' : pct > 60 ? '#f59e0b' : '#10b981';
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="8" />
          <circle cx="50" cy="50" r="42" fill="none" stroke={gaugeColor} strokeWidth="8"
            strokeDasharray={`${pct * 2.64} ${264 - pct * 2.64}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-white">{value}%</span>
        </div>
      </div>
      <span className="text-xs text-slate-400 mt-2">{label}</span>
    </div>
  );
}

export default function AdminAPM() {
  const [timeRange, setTimeRange] = useState("24");
  const [activeTab, setActiveTab] = useState("overview");
  const [logFilter, setLogFilter] = useState({ method: "", status: "", path: "" });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => setRefreshKey(k => k + 1), 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const overview = useQuery({
    queryKey: ["/api/admin/apm/overview", timeRange, refreshKey],
    queryFn: async () => {
      const res = await fetch(`/api/admin/apm/overview?range=${timeRange}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: autoRefresh ? 30000 : false,
  });

  const traffic = useQuery({
    queryKey: ["/api/admin/apm/traffic", timeRange, refreshKey],
    queryFn: async () => {
      const res = await fetch(`/api/admin/apm/traffic?range=${timeRange}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: activeTab === "traffic" || activeTab === "overview",
  });

  const performance = useQuery({
    queryKey: ["/api/admin/apm/performance", timeRange, refreshKey],
    queryFn: async () => {
      const res = await fetch(`/api/admin/apm/performance?range=${timeRange}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: activeTab === "performance",
  });

  const resources = useQuery({
    queryKey: ["/api/admin/apm/resources", refreshKey],
    queryFn: async () => {
      const res = await fetch("/api/admin/apm/resources");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: activeTab === "infrastructure" || activeTab === "overview",
    refetchInterval: autoRefresh ? 15000 : false,
  });

  const sessions = useQuery({
    queryKey: ["/api/admin/apm/sessions", refreshKey],
    queryFn: async () => {
      const res = await fetch("/api/admin/apm/sessions");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: activeTab === "sessions",
  });

  const logs = useQuery({
    queryKey: ["/api/admin/apm/logs", logFilter, refreshKey],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "200" });
      if (logFilter.method) params.set("method", logFilter.method);
      if (logFilter.status) params.set("status", logFilter.status);
      if (logFilter.path) params.set("path", logFilter.path);
      const res = await fetch(`/api/admin/apm/logs?${params}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: activeTab === "logs",
  });

  const topology = useQuery({
    queryKey: ["/api/admin/apm/topology", refreshKey],
    queryFn: async () => {
      const res = await fetch("/api/admin/apm/topology");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: activeTab === "overview" || activeTab === "infrastructure",
  });

  const anomalies = useQuery({
    queryKey: ["/api/admin/apm/anomalies", refreshKey],
    queryFn: async () => {
      const res = await fetch("/api/admin/apm/anomalies?resolved=true");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: activeTab === "overview",
  });

  const insights = useQuery({
    queryKey: ["/api/admin/apm/insights", timeRange, refreshKey],
    queryFn: async () => {
      const res = await fetch(`/api/admin/apm/insights?range=${timeRange}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: activeTab === "overview",
  });

  const metricsHistory = useQuery({
    queryKey: ["/api/admin/apm/metrics-history", refreshKey],
    queryFn: async () => {
      const res = await fetch("/api/admin/apm/metrics-history?limit=30");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: activeTab === "infrastructure",
  });

  const services = useQuery({
    queryKey: ["/api/admin/apm/services", timeRange, refreshKey],
    queryFn: async () => {
      const res = await fetch(`/api/admin/apm/services?range=${timeRange}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: activeTab === "performance",
  });

  const o = overview.data;
  const t = traffic.data;
  const p = performance.data;
  const r = resources.data;

  const tooltipStyle = { background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-950 text-white -m-6 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
          <div className="flex items-center gap-3">
            <Activity className="w-7 h-7 text-purple-500" />
            <div>
              <h1 className="text-2xl font-bold">APM & Observability</h1>
              <p className="text-sm text-slate-400">Full-Stack Application Performance Monitoring</p>
            </div>
            {o && <StatusBadge status={o.healthStatus} />}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? "bg-purple-600 hover:bg-purple-700" : "border-slate-600 text-slate-300"}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} style={autoRefresh ? { animationDuration: '3s' } : {}} />
              {autoRefresh ? "Live" : "Pausiert"}
            </Button>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-36 bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Letzte Stunde</SelectItem>
                <SelectItem value="6">Letzte 6h</SelectItem>
                <SelectItem value="24">Letzte 24h</SelectItem>
                <SelectItem value="168">Letzte 7 Tage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800/50 border border-slate-700/50 mb-6 flex-wrap h-auto">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-400">
              <BarChart3 className="w-4 h-4 mr-1.5" />Übersicht
            </TabsTrigger>
            <TabsTrigger value="traffic" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-400">
              <Globe className="w-4 h-4 mr-1.5" />Traffic
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-400">
              <Zap className="w-4 h-4 mr-1.5" />Performance
            </TabsTrigger>
            <TabsTrigger value="infrastructure" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-400">
              <Server className="w-4 h-4 mr-1.5" />Infrastruktur
            </TabsTrigger>
            <TabsTrigger value="sessions" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-400">
              <Users className="w-4 h-4 mr-1.5" />Sessions
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-400">
              <Layers className="w-4 h-4 mr-1.5" />Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {o && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <KPICard title="Besucher" value={o.uniqueVisitors} icon={Users} color="text-blue-400" subtitle={`${o.activeSessions} aktiv`} />
                  <KPICard title="Seitenaufrufe" value={o.pageViews} icon={Eye} color="text-emerald-400" />
                  <KPICard title="API Requests" value={o.totalRequests} icon={Activity} color="text-purple-400" />
                  <KPICard title="Antwortzeit" value={`${o.avgResponseTime}ms`} icon={Clock} color="text-amber-400" />
                  <KPICard title="Fehlerrate" value={`${o.errorRate}%`} icon={AlertTriangle} color={o.errorRate > 5 ? "text-red-400" : "text-emerald-400"} subtitle={`${o.errors} Fehler`} />
                  <KPICard title="Uptime" value={o.uptime} icon={Shield} color="text-emerald-400" />
                </div>

                <Card className="bg-slate-900 border-slate-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-300">Requests & Besucher</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={o.hourlyData}>
                        <defs>
                          <linearGradient id="gReq" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gVis" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend />
                        <Area type="monotone" dataKey="requests" name="Requests" stroke="#8b5cf6" fill="url(#gReq)" strokeWidth={2} />
                        <Area type="monotone" dataKey="visitors" name="Besucher" stroke="#3b82f6" fill="url(#gVis)" strokeWidth={2} />
                        <Line type="monotone" dataKey="errors" name="Fehler" stroke="#ef4444" strokeWidth={1.5} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-slate-900 border-slate-700/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <Database className="w-4 h-4" /> Service Topology
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {topology.data?.components?.map((comp: any) => (
                        <div key={comp.id} className="flex items-center justify-between py-2.5 border-b border-slate-800 last:border-0">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${comp.status === 'healthy' ? 'bg-emerald-500' : comp.status === 'degraded' ? 'bg-amber-500' : 'bg-red-500'}`} />
                            <div>
                              <p className="text-sm font-medium text-slate-200">{comp.name}</p>
                              <p className="text-xs text-slate-500">{comp.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span>{comp.responseTime}ms</span>
                            <span>{comp.throughput} req</span>
                            <StatusBadge status={comp.status} />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-slate-700/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" /> Insights & Empfehlungen
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {insights.data?.insights?.length === 0 && (
                        <p className="text-sm text-slate-500">Noch keine Insights – mehr Daten werden gesammelt.</p>
                      )}
                      {insights.data?.insights?.map((insight: any, i: number) => (
                        <div key={i} className={`p-3 rounded-lg border ${
                          insight.type === 'success' ? 'border-emerald-800 bg-emerald-950/30' :
                          insight.type === 'warning' ? 'border-amber-800 bg-amber-950/30' :
                          insight.type === 'optimization' ? 'border-blue-800 bg-blue-950/30' :
                          'border-slate-700 bg-slate-800/30'
                        }`}>
                          <div className="flex items-start gap-2">
                            {insight.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" /> :
                             insight.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" /> :
                             <Lightbulb className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />}
                            <div>
                              <p className="text-sm font-medium text-slate-200">{insight.title}</p>
                              <p className="text-xs text-slate-400 mt-1">{insight.description}</p>
                              <p className="text-xs text-slate-500 mt-1 italic">{insight.action}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {anomalies.data?.stats?.active > 0 && (
                        <div className="p-3 rounded-lg border border-red-800 bg-red-950/30">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-400" />
                            <p className="text-sm font-medium text-red-300">{anomalies.data.stats.active} aktive Anomalien</p>
                          </div>
                          {anomalies.data.anomalies?.filter((a: any) => !a.resolved).slice(0, 3).map((a: any) => (
                            <p key={a.id} className="text-xs text-red-400/70 mt-1 ml-6">- {a.title}</p>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
            {overview.isLoading && <LoadingSpinner />}
          </TabsContent>

          <TabsContent value="traffic" className="space-y-6">
            {t && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-slate-900 border-slate-700/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-300">Traffic-Quellen</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={t.trafficSources} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis type="number" stroke="#64748b" fontSize={11} />
                          <YAxis type="category" dataKey="source" stroke="#64748b" fontSize={11} width={100} />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Bar dataKey="count" name="Requests" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-slate-700/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-300">Geräte & Browser</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500 mb-3 text-center">Geräte</p>
                          <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                              <Pie data={t.devices} dataKey="count" nameKey="device" cx="50%" cy="50%" outerRadius={65} label={({ device, percent }: any) => `${device} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                {t.devices.map((_: any, i: number) => <Cell key={i} fill={COLORS[i]} />)}
                              </Pie>
                              <Tooltip contentStyle={tooltipStyle} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-3 text-center">Browser</p>
                          <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                              <Pie data={t.browsers} dataKey="count" nameKey="browser" cx="50%" cy="50%" outerRadius={65} label={({ browser, percent }: any) => `${browser} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                {t.browsers.map((_: any, i: number) => <Cell key={i} fill={COLORS[i + 3]} />)}
                              </Pie>
                              <Tooltip contentStyle={tooltipStyle} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-slate-900 border-slate-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-300">Top Seiten</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="text-left py-2 text-slate-400 font-medium">Seite</th>
                            <th className="text-right py-2 text-slate-400 font-medium">Aufrufe</th>
                            <th className="text-right py-2 text-slate-400 font-medium">Besucher</th>
                          </tr>
                        </thead>
                        <tbody>
                          {t.topPages?.slice(0, 15).map((page: any) => (
                            <tr key={page.path} className="border-b border-slate-800">
                              <td className="py-2 text-slate-200 font-mono text-xs">{page.path}</td>
                              <td className="py-2 text-right text-slate-300">{page.views}</td>
                              <td className="py-2 text-right text-slate-300">{page.uniqueVisitors}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
            {traffic.isLoading && <LoadingSpinner />}
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {p && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <KPICard title="API Aufrufe" value={p.totalApiCalls} icon={Activity} color="text-purple-400" />
                  <KPICard title="Antwortzeit" value={`${p.avgResponseTime}ms`} icon={Clock} color="text-blue-400" />
                  <KPICard title="Endpoints" value={p.endpoints?.length || 0} icon={Layers} color="text-emerald-400" />
                  <KPICard title="4xx / 5xx" value={`${p.statusDistribution?.find((s: any) => s.status === '4xx')?.count || 0} / ${p.statusDistribution?.find((s: any) => s.status === '5xx')?.count || 0}`} icon={AlertTriangle} color="text-red-400" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-slate-900 border-slate-700/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-300">Antwortzeit-Verteilung</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={p.responseTimeBuckets}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                          <YAxis stroke="#64748b" fontSize={11} />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Bar dataKey="count" name="Requests" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-slate-700/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-300">Status Code Verteilung</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie data={p.statusDistribution} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80}
                            label={({ status, percent }: any) => `${status} (${(percent * 100).toFixed(0)}%)`}>
                            {p.statusDistribution?.map((_: any, i: number) => (
                              <Cell key={i} fill={['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6366f1'][i] || COLORS[i]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={tooltipStyle} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-slate-900 border-slate-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-300">Langsamste Endpoints</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="text-left py-2 text-slate-400 font-medium">Endpoint</th>
                            <th className="text-right py-2 text-slate-400 font-medium">Avg</th>
                            <th className="text-right py-2 text-slate-400 font-medium">P95</th>
                            <th className="text-right py-2 text-slate-400 font-medium">Calls</th>
                            <th className="text-right py-2 text-slate-400 font-medium">Errors</th>
                          </tr>
                        </thead>
                        <tbody>
                          {p.endpoints?.slice(0, 12).map((ep: any) => (
                            <tr key={ep.endpoint} className="border-b border-slate-800">
                              <td className="py-2 text-slate-200 font-mono text-xs">{ep.endpoint}</td>
                              <td className={`py-2 text-right ${ep.avgResponseTime > 500 ? 'text-red-400' : ep.avgResponseTime > 200 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {ep.avgResponseTime}ms
                              </td>
                              <td className="py-2 text-right text-slate-300">{ep.p95ResponseTime}ms</td>
                              <td className="py-2 text-right text-slate-300">{ep.requestCount}</td>
                              <td className="py-2 text-right">{ep.errorCount > 0 ? <span className="text-red-400">{ep.errorCount}</span> : <span className="text-slate-500">0</span>}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {services.data?.layerStats && (
                  <Card className="bg-slate-900 border-slate-700/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-300">Layer-Aufschlüsselung</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {services.data.layerStats.map((layer: any) => (
                          <div key={layer.layer} className="p-3 bg-slate-800/50 rounded-lg">
                            <p className="text-xs text-slate-500 uppercase">{layer.layer}</p>
                            <p className="text-lg font-bold text-white">{layer.count}</p>
                            <p className="text-xs text-slate-400">{layer.avgTime}ms avg · {layer.errors} err</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
            {performance.isLoading && <LoadingSpinner />}
          </TabsContent>

          <TabsContent value="infrastructure" className="space-y-6">
            {r && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <KPICard title="Node.js" value={r.nodeVersion} icon={Server} color="text-emerald-400" subtitle={r.platform} />
                  <KPICard title="Uptime" value={formatDuration(r.uptime)} icon={Shield} color="text-blue-400" />
                  <KPICard title="Req/Min" value={r.requestsPerMinute} icon={Activity} color="text-purple-400" />
                  <KPICard title="Verbindungen" value={r.activeConnections} icon={Wifi} color="text-amber-400" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-slate-900 border-slate-700/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-300">Auslastung</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-around">
                        <GaugeChart value={r.cpu.percent} label="CPU" />
                        <GaugeChart value={r.memory.percentUsed} label="Memory" />
                        <GaugeChart value={r.disk.percentUsed} label="Disk" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-slate-700/50 md:col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-300">Speicher & System</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          {[
                            ['Heap Used', `${r.memory.heapUsed} MB`],
                            ['Heap Total', `${r.memory.heapTotal} MB`],
                            ['RSS', `${r.memory.rss} MB`],
                            ['External', `${r.memory.external} MB`],
                          ].map(([k, v]) => (
                            <div key={k} className="flex justify-between text-sm">
                              <span className="text-slate-400">{k}</span>
                              <span className="text-white font-medium">{v}</span>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-3">
                          {[
                            ['CPU Cores', r.cpu.cores],
                            ['Disk Used', `${r.disk.used}%`],
                            ['APM Logs', r.apmDataSize.requests],
                            ['Sessions', r.apmDataSize.sessions],
                          ].map(([k, v]) => (
                            <div key={k as string} className="flex justify-between text-sm">
                              <span className="text-slate-400">{k}</span>
                              <span className="text-white font-medium">{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-slate-900 border-slate-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-300">Speicherverlauf</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={r.memoryHistory}>
                        <defs>
                          <linearGradient id="gMem" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} unit=" MB" />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Area type="monotone" dataKey="used" name="Heap Used" stroke="#8b5cf6" fill="url(#gMem)" strokeWidth={2} />
                        <Line type="monotone" dataKey="total" name="Heap Total" stroke="#64748b" strokeDasharray="3 3" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {metricsHistory.data && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-slate-900 border-slate-700/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-300">CPU-Verlauf</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={180}>
                          <LineChart data={metricsHistory.data.cpu}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                            <YAxis stroke="#64748b" fontSize={10} unit="%" domain={[0, 100]} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Line type="monotone" dataKey="value" name="CPU %" stroke="#10b981" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-900 border-slate-700/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-300">Throughput (Req/Min)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={180}>
                          <BarChart data={metricsHistory.data.throughput}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                            <YAxis stroke="#64748b" fontSize={10} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Bar dataKey="value" name="Requests" fill="#6366f1" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {topology.data?.components && (
                  <Card className="bg-slate-900 border-slate-700/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-300">Komponenten-Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {topology.data.components.map((comp: any) => (
                          <div key={comp.id} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-white">{comp.name}</span>
                              <StatusBadge status={comp.status} />
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
                              <div><span className="block text-slate-500">Latenz</span>{comp.responseTime}ms</div>
                              <div><span className="block text-slate-500">Fehler</span>{comp.errorRate.toFixed(1)}%</div>
                              <div><span className="block text-slate-500">Req</span>{comp.throughput}</div>
                            </div>
                            {comp.metadata && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {Object.entries(comp.metadata).map(([k, v]) => (
                                  <span key={k} className="text-[10px] px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">{k}: {String(v)}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
            {resources.isLoading && <LoadingSpinner />}
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            {sessions.data && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <KPICard title="Gesamt Sessions" value={sessions.data.totalSessions} icon={Users} color="text-blue-400" />
                  <KPICard title="Aktive Sessions" value={sessions.data.activeSessions} icon={Monitor} color="text-emerald-400" />
                  <KPICard title="Bounce Rate" value={`${sessions.data.sessions.length > 0 ? ((sessions.data.sessions.filter((s: any) => s.pagesVisited <= 1).length / sessions.data.sessions.length) * 100).toFixed(0) : 0}%`} icon={TrendingUp} color="text-amber-400" />
                </div>

                <Card className="bg-slate-900 border-slate-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-300">Live Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="text-left py-2 text-slate-400 font-medium w-8"></th>
                            <th className="text-left py-2 text-slate-400 font-medium">ID</th>
                            <th className="text-left py-2 text-slate-400 font-medium">Quelle</th>
                            <th className="text-left py-2 text-slate-400 font-medium">Gerät</th>
                            <th className="text-left py-2 text-slate-400 font-medium">Browser</th>
                            <th className="text-right py-2 text-slate-400 font-medium">Dauer</th>
                            <th className="text-right py-2 text-slate-400 font-medium">Seiten</th>
                            <th className="text-left py-2 text-slate-400 font-medium">Pfad</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sessions.data.sessions.map((s: any) => (
                            <tr key={s.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                              <td className="py-2">
                                <div className={`w-2.5 h-2.5 rounded-full ${s.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                              </td>
                              <td className="py-2 text-slate-300 font-mono text-xs">{s.id}</td>
                              <td className="py-2">
                                <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">{s.source}</Badge>
                              </td>
                              <td className="py-2 text-slate-300 text-xs">
                                {s.device === 'Mobile' ? <Smartphone className="w-3.5 h-3.5 inline mr-1" /> : <Monitor className="w-3.5 h-3.5 inline mr-1" />}
                                {s.device}
                              </td>
                              <td className="py-2 text-slate-300 text-xs">{s.browser}</td>
                              <td className="py-2 text-right text-slate-300 text-xs">{formatDuration(s.duration)}</td>
                              <td className="py-2 text-right text-slate-300">{s.pagesVisited}</td>
                              <td className="py-2 text-slate-400 text-xs font-mono truncate max-w-[200px]">{s.pages.slice(-3).join(' > ')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
            {sessions.isLoading && <LoadingSpinner />}
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card className="bg-slate-900 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-300 flex items-center justify-between">
                  <span>Request Logs</span>
                  {logs.data && <span className="text-xs text-slate-500">{logs.data.total} total</span>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 mb-4">
                  <Select value={logFilter.method || "all"} onValueChange={(v) => setLogFilter(f => ({ ...f, method: v === "all" ? "" : v }))}>
                    <SelectTrigger className="w-28 bg-slate-800 border-slate-700 text-white text-xs">
                      <SelectValue placeholder="Methode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle</SelectItem>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={logFilter.status || "all"} onValueChange={(v) => setLogFilter(f => ({ ...f, status: v === "all" ? "" : v }))}>
                    <SelectTrigger className="w-28 bg-slate-800 border-slate-700 text-white text-xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle</SelectItem>
                      <SelectItem value="success">Erfolg</SelectItem>
                      <SelectItem value="error">Fehler</SelectItem>
                      <SelectItem value="2">2xx</SelectItem>
                      <SelectItem value="3">3xx</SelectItem>
                      <SelectItem value="4">4xx</SelectItem>
                      <SelectItem value="5">5xx</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-500" />
                    <Input
                      placeholder="Pfad filtern..."
                      value={logFilter.path}
                      onChange={(e) => setLogFilter(f => ({ ...f, path: e.target.value }))}
                      className="pl-9 bg-slate-800 border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <table className="w-full text-xs font-mono">
                    <thead className="sticky top-0 bg-slate-900 z-10">
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-2 text-slate-400 font-medium">Zeit</th>
                        <th className="text-left py-2 text-slate-400 font-medium">Methode</th>
                        <th className="text-left py-2 text-slate-400 font-medium">Pfad</th>
                        <th className="text-right py-2 text-slate-400 font-medium">Status</th>
                        <th className="text-right py-2 text-slate-400 font-medium">ms</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.data?.logs?.map((log: any, i: number) => (
                        <tr key={i} className={`border-b border-slate-800/50 ${log.statusCode >= 500 ? 'bg-red-950/20' : log.statusCode >= 400 ? 'bg-amber-950/20' : ''}`}>
                          <td className="py-1.5 text-slate-500">{new Date(log.timestamp).toLocaleTimeString('de-DE')}</td>
                          <td className="py-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              log.method === 'GET' ? 'bg-blue-900/50 text-blue-300' :
                              log.method === 'POST' ? 'bg-emerald-900/50 text-emerald-300' :
                              log.method === 'PUT' ? 'bg-amber-900/50 text-amber-300' :
                              log.method === 'DELETE' ? 'bg-red-900/50 text-red-300' :
                              'bg-slate-700 text-slate-300'
                            }`}>{log.method}</span>
                          </td>
                          <td className="py-1.5 text-slate-300 truncate max-w-[300px]">{log.path}</td>
                          <td className="py-1.5 text-right">
                            <span className={`${
                              log.statusCode < 300 ? 'text-emerald-400' :
                              log.statusCode < 400 ? 'text-blue-400' :
                              log.statusCode < 500 ? 'text-amber-400' : 'text-red-400'
                            }`}>{log.statusCode}</span>
                          </td>
                          <td className={`py-1.5 text-right ${log.responseTime > 500 ? 'text-red-400' : log.responseTime > 200 ? 'text-amber-400' : 'text-slate-400'}`}>
                            {log.responseTime}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
    </div>
  );
}
