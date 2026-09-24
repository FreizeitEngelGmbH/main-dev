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
import BundlesListPage, { BundleDetailPage } from "@/pages/bundles-page";
import SearchPage from "@/pages/search-page";
import AboutPage from "@/pages/about-page";
import FAQPage from "@/pages/faq-page";
import LexikonRatgeber from "@/pages/lexikon-ratgeber";
import BrandsPage from "@/pages/brands-page";
import FavoritesPage from "@/pages/favorites-page";
import UnavailablePage from "@/pages/unavailable-page";
import PrivacyPage from "@/pages/privacy-page";
import TermsPage from "@/pages/terms-page";
import ImprintPage from "@/pages/imprint-page";
import { GroupActivitiesListPage, GroupActivityDetailPage } from "@/pages/group-activities-page";

/**
 * The Partner app: its screens, routes and static mock data, mounted inside the
 * unified app. Everything under it reads from its own in-memory data layer
 * (`./queryClient`), separate from the admin's mock API.
 *
 * Routes owned by the unified app (`/`, `/landing`, `/auth`, `/admin/*`) are
 * declared in `src/App.tsx`; this is the fallback for everything else, so
 * unknown URLs redirect home exactly like the original app's own catch-all did.
 *
 * Partner-only routes use the shared role-aware `ProtectedRoute`: signed-out
 * users go to `/auth`, admins are sent to their own dashboard.
 */
export default function PartnerApp() {
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
            path="/bundles/:slug"
            component={() => (
              <MainLayout>
                <BundleDetailPage />
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

          {/* Public "Mach-mit-Gruppen" pages, as in the source app (static data). */}
          <Route
            path="/gruppen"
            component={() => (
              <MainLayout>
                <GroupActivitiesListPage />
              </MainLayout>
            )}
          />

          <Route
            path="/gruppen/:id"
            component={() => (
              <MainLayout>
                <GroupActivityDetailPage />
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

          {/* Pages linked from the shared header/footer and home page, as in the source app. */}
          <Route
            path="/search"
            component={() => (
              <MainLayout>
                <SearchPage />
              </MainLayout>
            )}
          />

          <Route
            path="/about"
            component={() => (
              <MainLayout>
                <AboutPage />
              </MainLayout>
            )}
          />

          <Route
            path="/faq"
            component={() => (
              <MainLayout>
                <FAQPage />
              </MainLayout>
            )}
          />

          <Route
            path="/lexikon"
            component={() => (
              <MainLayout>
                <LexikonRatgeber />
              </MainLayout>
            )}
          />

          <Route
            path="/brands"
            component={() => (
              <MainLayout>
                <BrandsPage />
              </MainLayout>
            )}
          />

          <Route
            path="/favorites"
            component={() => (
              <MainLayout>
                <FavoritesPage />
              </MainLayout>
            )}
          />

          {/* Linked from the header account menu / mobile menu; their source pages need backend data. */}
          <Route
            path="/profile"
            component={() => (
              <MainLayout>
                <UnavailablePage title="Mein Profil ist noch nicht verfügbar" description="Profil und „Meine Buchungen“ können in dieser Version noch nicht angezeigt werden." />
              </MainLayout>
            )}
          />

          <Route
            path="/community"
            component={() => (
              <MainLayout>
                <UnavailablePage title="Community ist noch nicht verfügbar" description="Der Community-Blog kann in dieser Version noch nicht angezeigt werden." />
              </MainLayout>
            )}
          />

          {/* Static legal pages, as in the source app. /datenschutz is linked from the partner application consent. */}
          <Route
            path="/datenschutz"
            component={() => (
              <MainLayout>
                <PrivacyPage />
              </MainLayout>
            )}
          />

          <Route
            path="/privacy"
            component={() => (
              <MainLayout>
                <PrivacyPage />
              </MainLayout>
            )}
          />

          <Route
            path="/terms"
            component={() => (
              <MainLayout>
                <TermsPage />
              </MainLayout>
            )}
          />

          {/* German URL used by the partner application consent ("AGB"); same page as /terms. */}
          <Route
            path="/agb"
            component={() => (
              <MainLayout>
                <TermsPage />
              </MainLayout>
            )}
          />

          <Route
            path="/imprint"
            component={() => (
              <MainLayout>
                <ImprintPage />
              </MainLayout>
            )}
          />

          {/* German URL used by the landing-page footer ("Impressum"); same page as /imprint. */}
          <Route
            path="/impressum"
            component={() => (
              <MainLayout>
                <ImprintPage />
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
