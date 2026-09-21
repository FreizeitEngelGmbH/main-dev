import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, ArrowLeftRight, Clock, Shield, Zap, Database, Globe, Calendar, Lock, AlertTriangle, CheckCircle, Timer, Server, Wifi, RefreshCw } from "lucide-react";

export default function IntegrationArchitecture() {
  const [activeFlow, setActiveFlow] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">FreizeitEngel – Integration Architecture</h1>
          <p className="text-gray-400 text-lg">Multi-System Booking Synchronization & Anti-Double-Booking Strategy</p>
        </div>

        <Tabs defaultValue="architecture" className="space-y-6">
          <TabsList className="bg-gray-900 border border-gray-800">
            <TabsTrigger value="architecture" className="data-[state=active]:bg-blue-600">System Architecture</TabsTrigger>
            <TabsTrigger value="countdown" className="data-[state=active]:bg-blue-600">Countdown Lock</TabsTrigger>
            <TabsTrigger value="flow" className="data-[state=active]:bg-blue-600">Booking Flow</TabsTrigger>
            <TabsTrigger value="sync" className="data-[state=active]:bg-blue-600">Sync Strategy</TabsTrigger>
          </TabsList>

          <TabsContent value="architecture">
            <div className="space-y-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-400" />
                    Full System Architecture
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <svg viewBox="0 0 1200 800" className="w-full h-auto" style={{ minHeight: '500px' }}>
                      <defs>
                        <linearGradient id="gradBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#1d4ed8" />
                        </linearGradient>
                        <linearGradient id="gradGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#22c55e" />
                          <stop offset="100%" stopColor="#16a34a" />
                        </linearGradient>
                        <linearGradient id="gradPurple" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#7c3aed" />
                        </linearGradient>
                        <linearGradient id="gradOrange" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#f97316" />
                          <stop offset="100%" stopColor="#ea580c" />
                        </linearGradient>
                        <linearGradient id="gradRed" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ef4444" />
                          <stop offset="100%" stopColor="#dc2626" />
                        </linearGradient>
                        <linearGradient id="gradTeal" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#14b8a6" />
                          <stop offset="100%" stopColor="#0d9488" />
                        </linearGradient>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                        <marker id="arrowBlue" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                          <polygon points="0 0, 10 3.5, 0 7" fill="#60a5fa" />
                        </marker>
                        <marker id="arrowGreen" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                          <polygon points="0 0, 10 3.5, 0 7" fill="#4ade80" />
                        </marker>
                        <marker id="arrowOrange" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                          <polygon points="0 0, 10 3.5, 0 7" fill="#fb923c" />
                        </marker>
                        <marker id="arrowPurple" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                          <polygon points="0 0, 10 3.5, 0 7" fill="#c084fc" />
                        </marker>
                      </defs>

                      <rect x="0" y="0" width="1200" height="800" fill="#0a0a0f" rx="12" />

                      <text x="600" y="35" textAnchor="middle" fill="#94a3b8" fontSize="13" fontWeight="600">FREIZEITENGEL INTEGRATION ARCHITECTURE</text>

                      <rect x="400" y="55" width="400" height="120" rx="12" fill="url(#gradBlue)" opacity="0.9" filter="url(#glow)" />
                      <text x="600" y="90" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">FreizeitEngel Platform</text>
                      <text x="600" y="112" textAnchor="middle" fill="#bfdbfe" fontSize="11">React + Express + PostgreSQL (Replit)</text>
                      <text x="600" y="132" textAnchor="middle" fill="#bfdbfe" fontSize="10">REST API | WebSocket | Webhooks</text>
                      <text x="600" y="152" textAnchor="middle" fill="#93c5fd" fontSize="10">Stripe Connect | SendGrid | QR Ticketing</text>

                      <rect x="70" y="250" width="220" height="110" rx="10" fill="url(#gradGreen)" opacity="0.85" />
                      <text x="180" y="285" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">Booking Middleware</text>
                      <text x="180" y="305" textAnchor="middle" fill="#bbf7d0" fontSize="10">Sync Engine & Router</text>
                      <text x="180" y="325" textAnchor="middle" fill="#bbf7d0" fontSize="10">Conflict Resolution</text>
                      <text x="180" y="345" textAnchor="middle" fill="#bbf7d0" fontSize="10">Event Queue (FIFO)</text>

                      <rect x="490" y="250" width="220" height="110" rx="10" fill="url(#gradRed)" opacity="0.85" />
                      <text x="600" y="285" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">Countdown Lock</text>
                      <text x="600" y="305" textAnchor="middle" fill="#fecaca" fontSize="10">5-Min Reservation Timer</text>
                      <text x="600" y="325" textAnchor="middle" fill="#fecaca" fontSize="10">Distributed Lock Manager</text>
                      <text x="600" y="345" textAnchor="middle" fill="#fecaca" fontSize="10">Auto-Release on Timeout</text>

                      <rect x="910" y="250" width="220" height="110" rx="10" fill="url(#gradPurple)" opacity="0.85" />
                      <text x="1020" y="285" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">Webhook Hub</text>
                      <text x="1020" y="305" textAnchor="middle" fill="#e9d5ff" fontSize="10">Inbound & Outbound Events</text>
                      <text x="1020" y="325" textAnchor="middle" fill="#e9d5ff" fontSize="10">Retry Logic (3x)</text>
                      <text x="1020" y="345" textAnchor="middle" fill="#e9d5ff" fontSize="10">Event Logging & Audit</text>

                      <line x1="500" y1="175" x2="180" y2="250" stroke="#4ade80" strokeWidth="2" markerEnd="url(#arrowGreen)" strokeDasharray="6,3" />
                      <line x1="600" y1="175" x2="600" y2="250" stroke="#f87171" strokeWidth="2" markerEnd="url(#arrowBlue)" strokeDasharray="6,3" />
                      <line x1="700" y1="175" x2="1020" y2="250" stroke="#c084fc" strokeWidth="2" markerEnd="url(#arrowPurple)" strokeDasharray="6,3" />

                      <text x="600" y="420" textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="600">EXTERNAL PARTNER SYSTEMS</text>
                      <line x1="200" y1="430" x2="1000" y2="430" stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />

                      <rect x="30" y="460" width="200" height="130" rx="10" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
                      <rect x="30" y="460" width="200" height="30" rx="10" fill="url(#gradOrange)" />
                      <text x="130" y="480" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Partner System A</text>
                      <text x="130" y="510" textAnchor="middle" fill="#94a3b8" fontSize="10">e.g. BookNow, SimplyBook</text>
                      <text x="130" y="530" textAnchor="middle" fill="#94a3b8" fontSize="10">REST API + Webhooks</text>
                      <text x="130" y="555" textAnchor="middle" fill="#4ade80" fontSize="10">Real-time Sync</text>
                      <circle cx="55" cy="555" r="4" fill="#4ade80" />

                      <rect x="260" y="460" width="200" height="130" rx="10" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
                      <rect x="260" y="460" width="200" height="30" rx="10" fill="url(#gradOrange)" />
                      <text x="360" y="480" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Partner System B</text>
                      <text x="360" y="510" textAnchor="middle" fill="#94a3b8" fontSize="10">e.g. Timify, Shore</text>
                      <text x="360" y="530" textAnchor="middle" fill="#94a3b8" fontSize="10">REST API + Polling</text>
                      <text x="360" y="555" textAnchor="middle" fill="#facc15" fontSize="10">Near-real-time (30s)</text>
                      <circle cx="285" cy="555" r="4" fill="#facc15" />

                      <rect x="490" y="460" width="200" height="130" rx="10" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
                      <rect x="490" y="460" width="200" height="30" rx="10" fill="url(#gradOrange)" />
                      <text x="590" y="480" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Google Calendar</text>
                      <text x="590" y="510" textAnchor="middle" fill="#94a3b8" fontSize="10">Google Calendar API v3</text>
                      <text x="590" y="530" textAnchor="middle" fill="#94a3b8" fontSize="10">OAuth 2.0 + Push Notif.</text>
                      <text x="590" y="555" textAnchor="middle" fill="#4ade80" fontSize="10">Real-time Sync</text>
                      <circle cx="515" cy="555" r="4" fill="#4ade80" />

                      <rect x="720" y="460" width="200" height="130" rx="10" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
                      <rect x="720" y="460" width="200" height="30" rx="10" fill="url(#gradOrange)" />
                      <text x="820" y="480" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">iCal / CalDAV</text>
                      <text x="820" y="510" textAnchor="middle" fill="#94a3b8" fontSize="10">Outlook, Apple Calendar</text>
                      <text x="820" y="530" textAnchor="middle" fill="#94a3b8" fontSize="10">iCal Feed (Read/Write)</text>
                      <text x="820" y="555" textAnchor="middle" fill="#facc15" fontSize="10">Polling (5 min)</text>
                      <circle cx="745" cy="555" r="4" fill="#facc15" />

                      <rect x="950" y="460" width="200" height="130" rx="10" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
                      <rect x="950" y="460" width="200" height="30" rx="10" fill="url(#gradOrange)" />
                      <text x="1050" y="480" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Custom / Legacy</text>
                      <text x="1050" y="510" textAnchor="middle" fill="#94a3b8" fontSize="10">Proprietäre Systeme</text>
                      <text x="1050" y="530" textAnchor="middle" fill="#94a3b8" fontSize="10">CSV / Manual Import</text>
                      <text x="1050" y="555" textAnchor="middle" fill="#f87171" fontSize="10">Manual / Scheduled</text>
                      <circle cx="975" cy="555" r="4" fill="#f87171" />

                      <line x1="180" y1="360" x2="130" y2="460" stroke="#4ade80" strokeWidth="1.5" markerEnd="url(#arrowGreen)" opacity="0.7" />
                      <line x1="180" y1="360" x2="360" y2="460" stroke="#4ade80" strokeWidth="1.5" markerEnd="url(#arrowGreen)" opacity="0.7" />
                      <line x1="180" y1="360" x2="590" y2="460" stroke="#4ade80" strokeWidth="1.5" markerEnd="url(#arrowGreen)" opacity="0.7" />
                      <line x1="180" y1="360" x2="820" y2="460" stroke="#4ade80" strokeWidth="1.5" markerEnd="url(#arrowGreen)" opacity="0.7" />
                      <line x1="180" y1="360" x2="1050" y2="460" stroke="#4ade80" strokeWidth="1.5" markerEnd="url(#arrowGreen)" opacity="0.7" />

                      <rect x="70" y="650" width="320" height="120" rx="10" fill="#1e293b" stroke="#1d4ed8" strokeWidth="1.5" />
                      <text x="230" y="680" textAnchor="middle" fill="#60a5fa" fontSize="13" fontWeight="bold">FreizeitEngel Database</text>
                      <text x="230" y="705" textAnchor="middle" fill="#94a3b8" fontSize="10">PostgreSQL (Neon)</text>
                      <text x="230" y="725" textAnchor="middle" fill="#94a3b8" fontSize="10">Partners | Experiences | Bookings</text>
                      <text x="230" y="745" textAnchor="middle" fill="#94a3b8" fontSize="10">Slot Locks | Sync Log | Events</text>

                      <rect x="440" y="650" width="320" height="120" rx="10" fill="#1e293b" stroke="#dc2626" strokeWidth="1.5" />
                      <text x="600" y="680" textAnchor="middle" fill="#f87171" fontSize="13" fontWeight="bold">Lock Store (Redis-like)</text>
                      <text x="600" y="705" textAnchor="middle" fill="#94a3b8" fontSize="10">In-Memory Slot Reservations</text>
                      <text x="600" y="725" textAnchor="middle" fill="#94a3b8" fontSize="10">TTL: 5 Min Auto-Expire</text>
                      <text x="600" y="745" textAnchor="middle" fill="#94a3b8" fontSize="10">Atomic Lock/Unlock Operations</text>

                      <rect x="810" y="650" width="320" height="120" rx="10" fill="#1e293b" stroke="#7c3aed" strokeWidth="1.5" />
                      <text x="970" y="680" textAnchor="middle" fill="#c084fc" fontSize="13" fontWeight="bold">Event / Audit Log</text>
                      <text x="970" y="705" textAnchor="middle" fill="#94a3b8" fontSize="10">All Sync Events Tracked</text>
                      <text x="970" y="725" textAnchor="middle" fill="#94a3b8" fontSize="10">Conflict Resolution History</text>
                      <text x="970" y="745" textAnchor="middle" fill="#94a3b8" fontSize="10">Webhook Delivery Status</text>

                      <line x1="600" y1="175" x2="230" y2="650" stroke="#3b82f6" strokeWidth="1" opacity="0.4" strokeDasharray="4,4" />
                      <line x1="600" y1="360" x2="600" y2="650" stroke="#ef4444" strokeWidth="1" opacity="0.4" strokeDasharray="4,4" />
                      <line x1="1020" y1="360" x2="970" y2="650" stroke="#a855f7" strokeWidth="1" opacity="0.4" strokeDasharray="4,4" />
                    </svg>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-sm">Real-time API</h3>
                        <p className="text-gray-500 text-xs">Under 2s latency</p>
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      Direct REST API + Webhooks. Both systems push events instantly. Best for modern booking platforms (SimplyBook, Timify, BookNow).
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                        <RefreshCw className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-sm">Polling Sync</h3>
                        <p className="text-gray-500 text-xs">30-60s intervals</p>
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      For systems without webhooks. FreizeitEngel polls partner API every 30-60 seconds. Combined with Countdown Lock for safety.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-sm">Calendar Sync</h3>
                        <p className="text-gray-500 text-xs">iCal / Google Cal</p>
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      Google Calendar API or iCal feeds for partners using calendar-based scheduling. Events created as "busy" blocks prevent overlaps.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="countdown">
            <div className="space-y-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Timer className="h-5 w-5 text-red-400" />
                    Countdown Lock – Anti-Double-Booking System
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <svg viewBox="0 0 1200 600" className="w-full h-auto" style={{ minHeight: '400px' }}>
                    <rect x="0" y="0" width="1200" height="600" fill="#0a0a0f" rx="12" />

                    <text x="600" y="35" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="600">COUNTDOWN LOCK FLOW – PREVENTING DOUBLE BOOKINGS</text>

                    <rect x="50" y="60" width="160" height="70" rx="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
                    <text x="130" y="90" textAnchor="middle" fill="#60a5fa" fontSize="12" fontWeight="bold">User A</text>
                    <text x="130" y="110" textAnchor="middle" fill="#94a3b8" fontSize="10">FreizeitEngel</text>

                    <rect x="990" y="60" width="160" height="70" rx="8" fill="#1e293b" stroke="#f97316" strokeWidth="2" />
                    <text x="1070" y="90" textAnchor="middle" fill="#fb923c" fontSize="12" fontWeight="bold">User B</text>
                    <text x="1070" y="110" textAnchor="middle" fill="#94a3b8" fontSize="10">Partner System</text>

                    <text x="600" y="80" textAnchor="middle" fill="#ef4444" fontSize="16" fontWeight="bold">SLOT: Court 1 – 18:00</text>
                    <text x="600" y="100" textAnchor="middle" fill="#94a3b8" fontSize="11">Both users want the same time slot</text>

                    <rect x="30" y="160" width="1140" height="80" rx="8" fill="#166534" fillOpacity="0.3" stroke="#22c55e" strokeWidth="1" strokeDasharray="4,4" />
                    <text x="60" y="185" fill="#4ade80" fontSize="13" fontWeight="bold">STEP 1: User A clicks "Buchen" → Slot gets LOCKED</text>
                    <text x="60" y="210" fill="#86efac" fontSize="11">→ Lock entry created: slot_id=C1_18:00, locked_by=UserA, expires_at=NOW()+5min</text>
                    <text x="60" y="228" fill="#86efac" fontSize="11">→ Webhook sent to partner system: status="RESERVED" → Calendar shows as blocked</text>

                    <rect x="840" y="168" width="120" height="55" rx="6" fill="#ef4444" fillOpacity="0.2" stroke="#ef4444" strokeWidth="1.5" />
                    <text x="900" y="192" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">4:59</text>
                    <text x="900" y="212" textAnchor="middle" fill="#fca5a5" fontSize="10">Countdown</text>

                    <rect x="30" y="260" width="1140" height="80" rx="8" fill="#7c2d12" fillOpacity="0.3" stroke="#f97316" strokeWidth="1" strokeDasharray="4,4" />
                    <text x="60" y="285" fill="#fb923c" fontSize="13" fontWeight="bold">STEP 2: User B tries to book same slot → REJECTED</text>
                    <text x="60" y="310" fill="#fdba74" fontSize="11">→ Lock check: slot_id=C1_18:00 → LOCKED by UserA (3:42 remaining)</text>
                    <text x="60" y="328" fill="#fdba74" fontSize="11">→ User B sees: "Dieser Zeitslot wird gerade reserviert. Bitte wählen Sie einen anderen."</text>

                    <rect x="30" y="360" width="550" height="90" rx="8" fill="#1e3a5f" fillOpacity="0.5" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4,4" />
                    <text x="60" y="388" fill="#60a5fa" fontSize="13" fontWeight="bold">SCENARIO A: User A completes payment</text>
                    <text x="60" y="410" fill="#93c5fd" fontSize="11">→ Lock upgraded to CONFIRMED booking</text>
                    <text x="60" y="428" fill="#93c5fd" fontSize="11">→ Webhook: status="CONFIRMED" → Calendar: final block</text>

                    <rect x="620" y="360" width="550" height="90" rx="8" fill="#3b0764" fillOpacity="0.5" stroke="#a855f7" strokeWidth="1" strokeDasharray="4,4" />
                    <text x="650" y="388" fill="#c084fc" fontSize="13" fontWeight="bold">SCENARIO B: Countdown expires (User A abandons)</text>
                    <text x="650" y="410" fill="#d8b4fe" fontSize="11">→ Lock auto-released after 5 minutes</text>
                    <text x="650" y="428" fill="#d8b4fe" fontSize="11">→ Webhook: status="AVAILABLE" → Calendar: unblocked</text>

                    <rect x="200" y="480" width="800" height="90" rx="8" fill="#1e293b" stroke="#22c55e" strokeWidth="2" />
                    <text x="600" y="510" textAnchor="middle" fill="#4ade80" fontSize="14" fontWeight="bold">RESULT: Zero Double Bookings Guaranteed</text>
                    <text x="600" y="535" textAnchor="middle" fill="#94a3b8" fontSize="11">Every slot can only be locked by one user at a time across ALL connected systems</text>
                    <text x="600" y="555" textAnchor="middle" fill="#94a3b8" fontSize="11">Lock state synchronized via webhooks to partner system + calendar in real-time</text>
                  </svg>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="pt-6">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-400" />
                      How the Lock Works
                    </h3>
                    <div className="space-y-3">
                      {[
                        { step: "1", text: "User clicks 'Jetzt buchen' on a time slot", color: "blue" },
                        { step: "2", text: "Server creates atomic lock (slot_id + user + TTL 5min)", color: "green" },
                        { step: "3", text: "Webhook pushes 'RESERVED' to partner system + calendar", color: "purple" },
                        { step: "4", text: "5-minute countdown shown to user in checkout", color: "red" },
                        { step: "5", text: "Payment completed → Lock upgraded to CONFIRMED", color: "green" },
                        { step: "6", text: "OR: Timer expires → Lock released → Slot available again", color: "orange" },
                      ].map((item) => (
                        <div key={item.step} className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-full bg-${item.color}-500/20 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <span className={`text-${item.color}-400 text-xs font-bold`}>{item.step}</span>
                          </div>
                          <p className="text-gray-300 text-sm">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="pt-6">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-400" />
                      Edge Cases Handled
                    </h3>
                    <div className="space-y-3 text-sm">
                      {[
                        { case: "User closes browser mid-checkout", solution: "TTL auto-expires lock after 5 min" },
                        { case: "Network failure during webhook delivery", solution: "3x retry with exponential backoff" },
                        { case: "Partner system offline", solution: "Lock still held locally, retries on reconnect" },
                        { case: "Two users click at exact same millisecond", solution: "Atomic database lock – only first wins" },
                        { case: "Payment fails after lock", solution: "Lock released, slot immediately available" },
                        { case: "User wants to extend reservation", solution: "One-time 2-min extension allowed" },
                      ].map((item, i) => (
                        <div key={i} className="bg-gray-800/50 rounded-lg p-3">
                          <p className="text-yellow-300 text-xs font-medium mb-1">{item.case}</p>
                          <p className="text-gray-400 text-xs">{item.solution}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="flow">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ArrowLeftRight className="h-5 w-5 text-blue-400" />
                  Complete Booking Flow – Multi-System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <svg viewBox="0 0 1200 700" className="w-full h-auto" style={{ minHeight: '450px' }}>
                  <rect x="0" y="0" width="1200" height="700" fill="#0a0a0f" rx="12" />

                  <text x="600" y="30" textAnchor="middle" fill="#94a3b8" fontSize="13" fontWeight="600">END-TO-END BOOKING FLOW WITH REAL-TIME SYNC</text>

                  <rect x="50" y="50" width="140" height="630" rx="0" fill="#1e3a5f" fillOpacity="0.15" />
                  <text x="120" y="75" textAnchor="middle" fill="#60a5fa" fontSize="11" fontWeight="bold">USER</text>

                  <rect x="260" y="50" width="280" height="630" rx="0" fill="#166534" fillOpacity="0.1" />
                  <text x="400" y="75" textAnchor="middle" fill="#4ade80" fontSize="11" fontWeight="bold">FREIZEITENGEL</text>

                  <rect x="610" y="50" width="220" height="630" rx="0" fill="#7c2d12" fillOpacity="0.15" />
                  <text x="720" y="75" textAnchor="middle" fill="#fb923c" fontSize="11" fontWeight="bold">LOCK STORE</text>

                  <rect x="900" y="50" width="250" height="630" rx="0" fill="#3b0764" fillOpacity="0.15" />
                  <text x="1025" y="75" textAnchor="middle" fill="#c084fc" fontSize="11" fontWeight="bold">PARTNER / CALENDAR</text>

                  {[
                    { y: 110, user: "Select slot", fe: "Check availability", lock: "Query lock status", partner: "Fetch latest slots" },
                    { y: 190, user: "Click 'Buchen'", fe: "Request lock", lock: "CREATE LOCK (5min TTL)", partner: "Webhook: RESERVED" },
                    { y: 270, user: "See countdown", fe: "Show checkout form", lock: "Lock active: 4:58...", partner: "Calendar: BUSY" },
                    { y: 350, user: "Enter details", fe: "Validate form", lock: "Lock active: 3:20...", partner: "Still RESERVED" },
                    { y: 430, user: "Pay (Stripe)", fe: "Process payment", lock: "Lock → CONFIRMED", partner: "Webhook: CONFIRMED" },
                    { y: 510, user: "Get QR ticket", fe: "Create booking + QR", lock: "Lock released", partner: "Calendar: CONFIRMED" },
                    { y: 590, user: "Email confirm.", fe: "SendGrid email", lock: "Audit log entry", partner: "Partner notified" },
                  ].map((row, i) => (
                    <g key={i}>
                      <rect x="60" y={row.y} width="120" height="50" rx="6" fill="#1e293b" stroke="#3b82f6" strokeWidth="1" />
                      <text x="120" y={row.y + 30} textAnchor="middle" fill="#93c5fd" fontSize="9">{row.user}</text>

                      <rect x="280" y={row.y} width="240" height="50" rx="6" fill="#1e293b" stroke="#22c55e" strokeWidth="1" />
                      <text x="400" y={row.y + 30} textAnchor="middle" fill="#86efac" fontSize="9">{row.fe}</text>

                      <rect x="620" y={row.y} width="200" height="50" rx="6" fill="#1e293b" stroke="#ef4444" strokeWidth="1" />
                      <text x="720" y={row.y + 30} textAnchor="middle" fill="#fca5a5" fontSize="9">{row.lock}</text>

                      <rect x="920" y={row.y} width="230" height="50" rx="6" fill="#1e293b" stroke="#a855f7" strokeWidth="1" />
                      <text x="1035" y={row.y + 30} textAnchor="middle" fill="#d8b4fe" fontSize="9">{row.partner}</text>

                      <line x1="180" y1={row.y + 25} x2="280" y2={row.y + 25} stroke="#4ade80" strokeWidth="1" opacity="0.5" />
                      <line x1="520" y1={row.y + 25} x2="620" y2={row.y + 25} stroke="#ef4444" strokeWidth="1" opacity="0.5" />
                      <line x1="820" y1={row.y + 25} x2="920" y2={row.y + 25} stroke="#a855f7" strokeWidth="1" opacity="0.5" />
                    </g>
                  ))}
                </svg>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sync">
            <div className="space-y-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Wifi className="h-5 w-5 text-teal-400" />
                    Synchronization Strategies by Partner Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Partner System</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Sync Method</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Latency</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Lock Support</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Complexity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { system: "REST API + Webhooks", method: "Real-time bidirectional", latency: "< 2s", lock: "Full support", complexity: "Medium", color: "green" },
                          { system: "REST API (no webhooks)", method: "Push + Polling (30s)", latency: "< 30s", lock: "Lock + Poll", complexity: "Medium", color: "yellow" },
                          { system: "Google Calendar API", method: "Push + Watch Channels", latency: "< 5s", lock: "Event reservation", complexity: "Low", color: "green" },
                          { system: "iCal / CalDAV Feed", method: "Polling (5 min)", latency: "< 5min", lock: "Limited", complexity: "Low", color: "orange" },
                          { system: "Proprietäres System", method: "Custom adapter", latency: "Varies", lock: "Case by case", complexity: "High", color: "red" },
                          { system: "Kein System (Telefon/Papier)", method: "Manual + Dashboard", latency: "Manual", lock: "Dashboard only", complexity: "Very Low", color: "blue" },
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                            <td className="py-3 px-4 text-white font-medium">{row.system}</td>
                            <td className="py-3 px-4 text-gray-300">{row.method}</td>
                            <td className="py-3 px-4">
                              <Badge className={`bg-${row.color}-500/20 text-${row.color}-400 border-${row.color}-500/30`}>
                                {row.latency}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-gray-300">{row.lock}</td>
                            <td className="py-3 px-4 text-gray-400">{row.complexity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="pt-6">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Database className="h-4 w-4 text-blue-400" />
                      Data Model – Slot Lock Table
                    </h3>
                    <div className="bg-gray-950 rounded-lg p-4 font-mono text-xs text-gray-300 leading-relaxed">
                      <div className="text-blue-400">CREATE TABLE slot_locks (</div>
                      <div className="pl-4">id <span className="text-purple-400">SERIAL PRIMARY KEY</span>,</div>
                      <div className="pl-4">partner_id <span className="text-purple-400">INTEGER NOT NULL</span>,</div>
                      <div className="pl-4">resource_id <span className="text-purple-400">VARCHAR(50)</span>, <span className="text-gray-500">-- court_1, lane_3</span></div>
                      <div className="pl-4">slot_date <span className="text-purple-400">DATE NOT NULL</span>,</div>
                      <div className="pl-4">slot_time <span className="text-purple-400">TIME NOT NULL</span>,</div>
                      <div className="pl-4">locked_by <span className="text-purple-400">VARCHAR(100)</span>, <span className="text-gray-500">-- user/session</span></div>
                      <div className="pl-4">lock_source <span className="text-purple-400">VARCHAR(20)</span>, <span className="text-gray-500">-- 'freizeitplus'/'partner'</span></div>
                      <div className="pl-4">status <span className="text-purple-400">VARCHAR(20)</span>, <span className="text-gray-500">-- 'locked'/'confirmed'</span></div>
                      <div className="pl-4">expires_at <span className="text-purple-400">TIMESTAMP</span>,</div>
                      <div className="pl-4">created_at <span className="text-purple-400">TIMESTAMP DEFAULT NOW()</span></div>
                      <div className="text-blue-400">);</div>
                      <div className="mt-2 text-green-400">-- Unique constraint prevents double locks</div>
                      <div className="text-blue-400">CREATE UNIQUE INDEX</div>
                      <div className="pl-4">ON slot_locks(partner_id, resource_id, slot_date, slot_time)</div>
                      <div className="pl-4">WHERE status IN ('locked', 'confirmed');</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="pt-6">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Server className="h-4 w-4 text-teal-400" />
                      Webhook Event Payload
                    </h3>
                    <div className="bg-gray-950 rounded-lg p-4 font-mono text-xs text-gray-300 leading-relaxed">
                      <div className="text-yellow-400">POST /webhook/booking-event</div>
                      <div className="text-gray-500 mt-1">Content-Type: application/json</div>
                      <div className="mt-2">{"{"}</div>
                      <div className="pl-4">"event": <span className="text-green-400">"slot.reserved"</span>,</div>
                      <div className="pl-4">"timestamp": <span className="text-green-400">"2026-03-05T18:00:00Z"</span>,</div>
                      <div className="pl-4">"partner_id": <span className="text-purple-400">596</span>,</div>
                      <div className="pl-4">"resource": <span className="text-green-400">"court_1"</span>,</div>
                      <div className="pl-4">"slot": {"{"}</div>
                      <div className="pl-8">"date": <span className="text-green-400">"2026-03-10"</span>,</div>
                      <div className="pl-8">"time": <span className="text-green-400">"18:00"</span>,</div>
                      <div className="pl-8">"duration_min": <span className="text-purple-400">60</span></div>
                      <div className="pl-4">{"}"},</div>
                      <div className="pl-4">"lock": {"{"}</div>
                      <div className="pl-8">"status": <span className="text-green-400">"reserved"</span>,</div>
                      <div className="pl-8">"expires_at": <span className="text-green-400">"2026-03-05T18:05:00Z"</span>,</div>
                      <div className="pl-8">"source": <span className="text-green-400">"freizeitplus"</span></div>
                      <div className="pl-4">{"}"}</div>
                      <div>{"}"}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
