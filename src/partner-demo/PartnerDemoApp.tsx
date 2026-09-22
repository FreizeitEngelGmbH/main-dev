import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./queryClient";
import { CartProvider } from "@/contexts/cart-context";
import { MainLayout } from "@/components/layout/main-layout";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ProtectedRoute } from "@/lib/protected-route";

import HomePage from "@/pages/home-page";
import PartnerPage from "@/pages/partner-page";
import PartnerDashboard from "@/pages/partner-dashboard";
import PartnerInquiries from "@/pages/partner-inquiries";
import PartnerGroupActivitiesPage from "@/pages/partner-group-activities";
import PartnerGroupActivityDetailPage from "@/pages/partner-group-activity-detail";
import PartnerScanner from "@/pages/partner-scanner";
import PartnerShop from "@/pages/partner-shop";
import EventCategoryPage from "@/pages/event-category-page";
import BundlesListPage from "@/pages/bundles-page";

/**
 * The Partner Demo: its screens, routes and static mock data, mounted inside the
 * unified app. Everything under it reads from its own in-memory data layer
 * (`./queryClient`), separate from the admin's mock API.
 *
 * Routes owned by the unified app (`/`, `/landing`, `/auth`, `/admin/*`) are
 * declared in `src/App.tsx`; this is the fallback for everything else, so
 * unknown URLs redirect home exactly like the demo's own catch-all did.
 *
 * Partner-only routes use the shared role-aware `ProtectedRoute`: signed-out
 * users go to `/auth`, admins are sent to their own dashboard.
 */
export default function PartnerDemoApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <ScrollToTop />
        <Switch>
          <Route
            path="/home"
            component={() => (
              <MainLayout>
                <HomePage />
              </MainLayout>
            )}
          />

          <Route
            path="/partner"
            component={() => (
              <MainLayout>
                <PartnerPage />
              </MainLayout>
            )}
          />

          <ProtectedRoute
            path="/partner/dashboard"
            component={() => (
              <MainLayout>
                <PartnerDashboard />
              </MainLayout>
            )}
            allowedRoles={["partner", "admin"]}
          />

          <ProtectedRoute
            path="/partner/inquiries"
            component={() => (
              <MainLayout>
                <PartnerInquiries />
              </MainLayout>
            )}
            allowedRoles={["partner", "admin"]}
          />

          <ProtectedRoute
            path="/partner/group-activities"
            component={() => (
              <MainLayout>
                <PartnerGroupActivitiesPage />
              </MainLayout>
            )}
            allowedRoles={["partner", "admin"]}
          />

          <ProtectedRoute
            path="/partner/group-activities/:id"
            component={() => (
              <MainLayout>
                <PartnerGroupActivityDetailPage />
              </MainLayout>
            )}
            allowedRoles={["partner", "admin"]}
          />

          <ProtectedRoute
            path="/partner/scanner"
            component={() => <PartnerScanner />}
            allowedRoles={["partner", "admin"]}
          />

          <Route
            path="/partners/:id"
            component={() => (
              <MainLayout>
                <PartnerShop />
              </MainLayout>
            )}
          />

          <Route
            path="/bundles"
            component={() => (
              <MainLayout>
                <BundlesListPage />
              </MainLayout>
            )}
          />

          <Route
            path="/gruppen-events/:key"
            component={() => (
              <MainLayout>
                <EventCategoryPage />
              </MainLayout>
            )}
          />

          {/* Bare /gruppen-events maps to the same list as /bundles, as in the source app. */}
          <Route
            path="/gruppen-events"
            component={() => (
              <MainLayout>
                <BundlesListPage />
              </MainLayout>
            )}
          />

          <Route>
            <Redirect to="/" replace />
          </Route>
        </Switch>
      </CartProvider>
    </QueryClientProvider>
  );
}
