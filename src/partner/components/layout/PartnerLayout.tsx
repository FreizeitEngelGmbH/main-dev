import { useLayoutEffect, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  CalendarCheck,
  Layers,
  CalendarClock,
  Wallet,
  MessageSquare,
  UserCircle,
  Sparkles,
  LogOut,
} from "lucide-react";
import { Avatar } from "../ui/avatar";
import { Button } from "../ui/button";
import { useDemoData } from "../../context/demo-data-context";
import { partnerPaths } from "../../routes";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { to: partnerPaths.dashboard, label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: partnerPaths.bookings, label: "Buchungen", icon: CalendarCheck },
  { to: partnerPaths.experiences, label: "Erlebnisse", icon: Layers },
  { to: partnerPaths.availability, label: "Verfügbarkeit", icon: CalendarClock },
  { to: partnerPaths.payouts, label: "Auszahlungen", icon: Wallet },
  { to: partnerPaths.messages, label: "Nachrichten", icon: MessageSquare },
  { to: partnerPaths.profile, label: "Profil", icon: UserCircle },
];

// Bottom bar has room for five; Nachrichten and Profil live in the account menu on small screens.
const bottomNavItems = navItems.slice(0, 5);

export function PartnerLayout({ children }: { children: ReactNode }) {
  const { profile, messages } = useDemoData();
  const { logoutMutation } = useAuth();
  const [location] = useLocation();
  const unreadCount = messages.filter((m) => m.unread).length;

  // Partner design tokens are scoped to <html class="partner-theme"> (see partner-theme.css),
  // so the admin panel and landing page keep their own tokens.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.add("partner-theme");
    return () => root.classList.remove("partner-theme");
  }, []);

  const isActive = (to: string, end?: boolean) =>
    end ? location === to : location === to || location.startsWith(`${to}/`);

  const handleLogout = () => logoutMutation.mutate();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-white lg:flex">
        <div className="flex items-center gap-2 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold leading-tight text-foreground">
              Freizeit<span className="text-primary">Engel</span>
            </div>
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Partner-Demo
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <Link
              key={to}
              href={to}
              className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(to, end)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {label}
              </span>
              {to === partnerPaths.messages && unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="space-y-2 border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-lg bg-secondary/60 p-3">
            <Avatar name={profile.companyName} />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-foreground">
                {profile.companyName}
              </div>
              <div className="truncate text-xs text-muted-foreground">{profile.contactPerson}</div>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4" />
            Abmelden
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-white/80 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex min-w-0 items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="truncate text-sm font-bold">
              Freizeit<span className="text-primary">Engel</span>
              <span className="hidden sm:inline"> Partner-Demo</span>
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-2 whitespace-nowrap rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
              <span>
                Demo-Modus
                <span className="hidden sm:inline"> — lokale Beispieldaten, keine echte Verbindung</span>
              </span>
            </div>

            <div className="lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Konto-Menü"
                    className="relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Avatar name={profile.companyName} className="h-9 w-9" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href={partnerPaths.messages} className="flex cursor-pointer items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Nachrichten
                      {unreadCount > 0 && (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-white">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={partnerPaths.profile} className="flex cursor-pointer items-center gap-2">
                      <UserCircle className="h-4 w-4" />
                      Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer gap-2"
                    onSelect={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="h-4 w-4" />
                    Abmelden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 pb-24 pt-6 lg:px-8 lg:pb-8 lg:pt-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-border bg-white lg:hidden">
        {bottomNavItems.map(({ to, label, icon: Icon, end }) => (
          <Link
            key={to}
            href={to}
            className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 px-0.5 py-2 text-[10px] font-medium min-[380px]:text-[11px] ${
              isActive(to, end) ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
