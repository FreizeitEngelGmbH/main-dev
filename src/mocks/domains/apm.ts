import { registerMock } from "../mockEngine";

/**
 * Shape matched field-for-field against what admin-apm.tsx actually reads
 * off each query's `.data` (its own hand-rolled in-memory observability
 * engine on the server side, not a Drizzle table) — verified by reading
 * the component's render code, not guessed from the endpoint list alone.
 */

function hourly(n: number) {
  return Array.from({ length: n }).map((_, i) => ({
    hour: `${i}:00`,
    requests: Math.round(30 + Math.sin(i / 2) * 15 + Math.random() * 5),
    visitors: Math.round(10 + Math.sin(i / 3) * 5 + Math.random() * 3),
    errors: Math.round(Math.random() * 2),
  }));
}

registerMock("GET", "/api/admin/apm/overview", () => ({
  healthStatus: "healthy",
  uniqueVisitors: 312,
  activeSessions: 7,
  pageViews: 1840,
  totalRequests: 5210,
  avgResponseTime: 186,
  errorRate: 0.4,
  errors: 21,
  uptime: "99.97%",
  hourlyData: hourly(24),
}));

registerMock("GET", "/api/admin/apm/traffic", () => ({
  trafficSources: [
    { source: "Direkt", count: 420 },
    { source: "Google", count: 310 },
    { source: "Instagram", count: 180 },
    { source: "Newsletter", count: 95 },
  ],
  devices: [
    { device: "Mobile", count: 620 },
    { device: "Desktop", count: 340 },
    { device: "Tablet", count: 45 },
  ],
  browsers: [
    { browser: "Chrome", count: 540 },
    { browser: "Safari", count: 310 },
    { browser: "Firefox", count: 95 },
    { browser: "Edge", count: 60 },
  ],
  topPages: [
    { path: "/", views: 640, uniqueVisitors: 480 },
    { path: "/admin", views: 210, uniqueVisitors: 12 },
    { path: "/experience/1", views: 180, uniqueVisitors: 140 },
    { path: "/gruppen-events", views: 95, uniqueVisitors: 80 },
  ],
}));

registerMock("GET", "/api/admin/apm/performance", () => ({
  totalApiCalls: 5210,
  avgResponseTime: 186,
  endpoints: [
    { endpoint: "GET /api/experiences", avgResponseTime: 92, p95ResponseTime: 180, requestCount: 1240, errorCount: 0 },
    { endpoint: "POST /api/bookings", avgResponseTime: 340, p95ResponseTime: 610, requestCount: 210, errorCount: 2 },
    { endpoint: "GET /api/admin/partners", avgResponseTime: 120, p95ResponseTime: 240, requestCount: 340, errorCount: 0 },
    { endpoint: "GET /api/admin/analytics", avgResponseTime: 410, p95ResponseTime: 720, requestCount: 60, errorCount: 1 },
  ],
  statusDistribution: [
    { status: "2xx", count: 4890 },
    { status: "3xx", count: 180 },
    { status: "4xx", count: 110 },
    { status: "5xx", count: 30 },
  ],
  responseTimeBuckets: [
    { label: "<100ms", count: 2400 },
    { label: "100-300ms", count: 1900 },
    { label: "300-600ms", count: 700 },
    { label: ">600ms", count: 210 },
  ],
}));

registerMock("GET", "/api/admin/apm/resources", () => ({
  nodeVersion: "v20.16.0",
  platform: "darwin",
  uptime: 86400 * 3 + 3600 * 4,
  requestsPerMinute: 42,
  activeConnections: 18,
  cpu: { percent: 34, cores: 8 },
  memory: { percentUsed: 58, heapUsed: 312, heapTotal: 540, rss: 620, external: 45 },
  disk: { percentUsed: 41, used: 41 },
  apmDataSize: { requests: 5210, sessions: 312 },
  memoryHistory: Array.from({ length: 20 }).map((_, i) => ({
    time: `${i}m`,
    used: Math.round(280 + Math.sin(i / 3) * 40),
    total: 540,
  })),
}));

registerMock("GET", "/api/admin/apm/sessions", () => ({
  totalSessions: 312,
  activeSessions: 7,
  sessions: Array.from({ length: 8 }).map((_, i) => ({
    id: `sess-${1000 + i}`,
    isActive: i < 3,
    source: ["Direkt", "Google", "Instagram"][i % 3],
    device: i % 2 === 0 ? "Desktop" : "Mobile",
    browser: ["Chrome", "Safari", "Firefox"][i % 3],
    duration: 60 + i * 45,
    pagesVisited: 1 + (i % 5),
    pages: ["/", "/search", `/experience/${i + 1}`],
  })),
}));

const requestLogs = Array.from({ length: 40 }).map((_, i) => ({
  timestamp: new Date(Date.now() - i * 45000).toISOString(),
  method: ["GET", "POST", "GET", "PUT", "DELETE"][i % 5],
  path: ["/api/experiences", "/api/bookings", "/api/admin/partners", "/api/admin/crm/partners/1", "/api/admin/analytics"][i % 5],
  statusCode: i % 13 === 0 ? 500 : i % 7 === 0 ? 404 : 200,
  responseTime: 40 + (i % 9) * 60,
}));

registerMock("GET", "/api/admin/apm/logs", () => ({ total: requestLogs.length, logs: requestLogs }));

registerMock("GET", "/api/admin/apm/topology", () => ({
  components: [
    { id: "api", name: "API Server", type: "service", status: "healthy", responseTime: 92, throughput: 5210, errorRate: 0.4, metadata: { region: "eu-central" } },
    { id: "db", name: "PostgreSQL", type: "database", status: "healthy", responseTime: 12, throughput: 8900, errorRate: 0.0 },
    { id: "stripe", name: "Stripe", type: "external", status: "healthy", responseTime: 210, throughput: 340, errorRate: 0.1 },
    { id: "resend", name: "Resend (E-Mail)", type: "external", status: "degraded", responseTime: 640, throughput: 120, errorRate: 2.1 },
  ],
}));

registerMock("GET", "/api/admin/apm/anomalies", () => ({
  stats: { active: 0 },
  anomalies: [],
}));

registerMock("GET", "/api/admin/apm/insights", () => ({
  insights: [
    { type: "success", title: "Antwortzeiten stabil", description: "Die durchschnittliche API-Antwortzeit liegt im grünen Bereich.", action: "Keine Aktion nötig." },
    { type: "warning", title: "Erhöhte Latenz bei Resend", description: "Der E-Mail-Versand über Resend ist in den letzten 24h leicht verlangsamt.", action: "Resend-Status-Seite prüfen." },
  ],
}));

registerMock("GET", "/api/admin/apm/metrics-history", () => ({
  cpu: Array.from({ length: 30 }).map((_, i) => ({ time: `${i}m`, value: Math.round(25 + Math.sin(i / 4) * 15) })),
  throughput: Array.from({ length: 30 }).map((_, i) => ({ time: `${i}m`, value: Math.round(35 + Math.sin(i / 3) * 20) })),
}));

registerMock("GET", "/api/admin/apm/services", () => ({
  layerStats: [
    { layer: "API", count: 5210, avgTime: 186, errors: 30 },
    { layer: "DB", count: 8900, avgTime: 12, errors: 0 },
    { layer: "External", count: 460, avgTime: 320, errors: 5 },
  ],
}));
