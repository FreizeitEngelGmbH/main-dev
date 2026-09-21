import { Switch, Route, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./hooks/use-auth";

import LandingPage from "@/pages/landing-page";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";

import AdminLayout from "@/pages/admin/admin-layout";
import AdminDashboard from "@/pages/admin/admin-dashboard";
import AdminExperiences from "@/pages/admin/admin-experiences";
import AdminBookings from "@/pages/admin/admin-bookings";
import AdminPartners from "@/pages/admin/admin-partners";
import AdminPartnerOverview from "@/pages/admin/admin-partner-overview";
import AdminNewsletterPage from "@/pages/admin-newsletter";
import AdminCRM from "@/pages/admin/admin-crm";
import AdminMailing from "@/pages/admin/admin-mailing";
import AdminMarketing from "@/pages/admin/admin-marketing";
import AdminCalendar from "@/pages/admin/admin-calendar";
import AdminChat from "@/pages/admin/admin-chat";
import AdminInbox from "@/pages/admin/admin-inbox";
import AdminAnalytics from "@/pages/admin/admin-analytics";
import AdminProjects from "@/pages/admin/admin-projects";
import AdminSales from "@/pages/admin/admin-sales";
import AdminMaterials from "@/pages/admin/admin-materials";
import AdminKnowledgeBase from "@/pages/admin/admin-knowledge-base";
import AdminPayments from "@/pages/admin/admin-payments";
import AdminDocuments from "@/pages/admin/admin-documents";
import AdminHR from "@/pages/admin/admin-hr";
import AdminMeetings from "@/pages/admin/admin-meetings";
import AdminOnboarding from "@/pages/admin/admin-onboarding";
import AdminRoadmap from "@/pages/admin/admin-roadmap";
import AdminTracking from "@/pages/admin/admin-tracking";
import AdminSupport from "@/pages/admin/admin-support";
import AdminAccounting from "@/pages/admin/admin-accounting";
import AdminAPM from "@/pages/admin/admin-apm";
import AdminCommissionInvoices from "@/pages/admin/admin-commission-invoices";
import IntegrationArchitecture from "@/pages/admin/integration-architecture";
import AdminVoiceAgent from "@/pages/admin/admin-voice-agent";
import AdminRoller from "@/pages/admin/admin-roller";
import AdminRegiondo from "@/pages/admin/admin-regiondo";
import AdminEversport from "@/pages/admin/admin-eversport";
import AdminPlanyo from "@/pages/admin/admin-planyo";
import AdminPretix from "@/pages/admin/admin-pretix";
import PartnerApp from "@/partner/PartnerApp";

import { ProtectedRoute } from "./lib/protected-route";

/**
 * One app, three areas:
 *  - public:  `/` (landing page), `/auth` (login)
 *  - admin:   `/admin/*`   — `requiredRole="admin"`, paths/layout as in the source project
 *  - partner: `/partner/*` — `requiredRole="partner"`, handled by `PartnerApp`
 * `ProtectedRoute` sends signed-out users to `/auth` and users with the wrong
 * role to their own dashboard (`lib/auth-routing.ts`).
 */
function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <LandingPage />} />
      <Route path="/landing">
        <Redirect to="/" replace />
      </Route>

      <Route path="/auth" component={() => <AuthPage />} />

      <ProtectedRoute
        path="/admin"
        component={() => (
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        )}
        requiredRole="admin"
      />

      <ProtectedRoute
        path="/admin/experiences"
        component={() => (
          <AdminLayout>
            <AdminExperiences />
          </AdminLayout>
        )}
        requiredRole="admin"
      />

      <ProtectedRoute
        path="/admin/bookings"
        component={() => (
          <AdminLayout>
            <AdminBookings />
          </AdminLayout>
        )}
        requiredRole="admin"
      />

      <ProtectedRoute
        path="/admin/partners"
        component={() => (
          <AdminLayout>
            <AdminPartners />
          </AdminLayout>
        )}
        requiredRole="admin"
      />

      <ProtectedRoute
        path="/admin/crm"
        component={() => (
          <AdminLayout>
            <AdminCRM />
          </AdminLayout>
        )}
        requiredRole="admin"
      />

      <ProtectedRoute
        path="/admin/partner-overview"
        component={() => (
          <AdminLayout>
            <AdminPartnerOverview />
          </AdminLayout>
        )}
        requiredRole="admin"
      />

      <ProtectedRoute path="/admin/newsletter" component={AdminNewsletterPage} requiredRole="admin" />

      <ProtectedRoute
        path="/admin/postfach"
        component={() => (
          <AdminLayout>
            <AdminInbox />
          </AdminLayout>
        )}
        requiredRole="admin"
      />

      <ProtectedRoute
        path="/admin/mailing"
        component={() => (
          <AdminLayout>
            <AdminMailing />
          </AdminLayout>
        )}
        requiredRole="admin"
      />

      <ProtectedRoute
        path="/admin/marketing"
        component={() => (
          <AdminLayout>
            <AdminMarketing />
          </AdminLayout>
        )}
        requiredRole="admin"
      />

      <ProtectedRoute
        path="/admin/analytics"
        component={() => (
          <AdminLayout>
            <AdminAnalytics />
          </AdminLayout>
        )}
        requiredRole="admin"
      />

      <ProtectedRoute
        path="/admin/kalender"
        component={() => (
          <AdminLayout>
            <AdminCalendar />
          </AdminLayout>
        )}
        requiredRole="admin"
      />

      <ProtectedRoute path="/admin/chat" component={AdminChat} requiredRole="admin" />
      <ProtectedRoute path="/admin/sales" component={AdminSales} requiredRole="admin" />
      <ProtectedRoute path="/admin/projects" component={AdminProjects} requiredRole="admin" />
      <ProtectedRoute path="/admin/materials" component={AdminMaterials} requiredRole="admin" />
      <ProtectedRoute path="/admin/wissensdatenbank" component={AdminKnowledgeBase} requiredRole="admin" />
      <ProtectedRoute path="/admin/payments" component={AdminPayments} requiredRole="admin" />
      <ProtectedRoute path="/admin/documents" component={AdminDocuments} requiredRole="admin" />
      <ProtectedRoute path="/admin/hr" component={AdminHR} requiredRole="admin" />
      <ProtectedRoute path="/admin/meetings" component={AdminMeetings} requiredRole="admin" />
      <ProtectedRoute path="/admin/onboarding" component={AdminOnboarding} requiredRole="admin" />
      <ProtectedRoute path="/admin/roadmap" component={AdminRoadmap} requiredRole="admin" />
      <ProtectedRoute path="/admin/tracking" component={AdminTracking} requiredRole="admin" />
      <ProtectedRoute path="/admin/support" component={AdminSupport} requiredRole="admin" />
      <ProtectedRoute path="/admin/commission-invoices" component={AdminCommissionInvoices} requiredRole="admin" />
      <ProtectedRoute path="/admin/accounting" component={AdminAccounting} requiredRole="admin" />
      <ProtectedRoute path="/admin/apm" component={AdminAPM} requiredRole="admin" />
      <ProtectedRoute path="/admin/roller" component={AdminRoller} requiredRole="admin" />
      <ProtectedRoute path="/admin/eversport" component={AdminEversport} requiredRole="admin" />
      <ProtectedRoute path="/admin/regiondo" component={AdminRegiondo} requiredRole="admin" />
      <ProtectedRoute path="/admin/planyo" component={AdminPlanyo} requiredRole="admin" />
      <ProtectedRoute path="/admin/pretix" component={AdminPretix} requiredRole="admin" />
      <ProtectedRoute path="/admin/integration-architecture" component={IntegrationArchitecture} requiredRole="admin" />
      <ProtectedRoute path="/admin/voice-agent" component={AdminVoiceAgent} requiredRole="admin" />

      <ProtectedRoute path="/partner/*?" component={PartnerApp} requiredRole="partner" />

      <Route component={() => <NotFound />} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="light">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
