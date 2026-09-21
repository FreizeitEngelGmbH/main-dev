import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  Layers,
  Package,
  Users,
  Calendar,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Contact,
  Globe,
  Mail,
  Target,
  CalendarDays,
  Inbox,
  BarChart3,
  MessageSquare,
  FolderKanban,
  TrendingUp,
  Megaphone,
  BookOpen,
  Wallet,
  HardDrive,
  UsersRound,
  Video,
  ClipboardCheck,
  Rocket,
  Bot,
  BookOpenCheck,
  Activity,
  Receipt,
  Cog,
  Dumbbell,
  CalendarCheck,
  Ticket,
  Link2,
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import logoSymbol from "@assets/image_1775051923875.png";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      window.location.href = "/";
    }
  }, [user]);

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "CRM", href: "/admin/crm", icon: Contact },
    { name: "Erlebnisse", href: "/admin/experiences", icon: Package },
    { name: "Buchungen", href: "/admin/bookings", icon: Calendar },
    { name: "Partner", href: "/admin/partners", icon: Users },
    { name: "Postfach", href: "/admin/postfach", icon: Inbox },
    { name: "Mailing", href: "/admin/mailing", icon: Mail },
    { name: "Marketing", href: "/admin/marketing", icon: Target },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Kalender", href: "/admin/kalender", icon: CalendarDays },
    { name: "Vertrieb", href: "/admin/sales", icon: TrendingUp },
    { name: "Team Chat", href: "/admin/chat", icon: MessageSquare },
    { name: "Projekte", href: "/admin/projects", icon: FolderKanban },
    { name: "Werbematerial", href: "/admin/materials", icon: Megaphone },
    { name: "Wissen", href: "/admin/wissensdatenbank", icon: BookOpen },
    { name: "Zahlungen", href: "/admin/payments", icon: Wallet },
    { name: "Dokumente", href: "/admin/documents", icon: HardDrive },
    { name: "Personal", href: "/admin/hr", icon: UsersRound },
    { name: "Meetings", href: "/admin/meetings", icon: Video },
    { name: "Onboarding", href: "/admin/onboarding", icon: ClipboardCheck },
    { name: "Roadmap", href: "/admin/roadmap", icon: Rocket },
    { name: "Link- & QR-Tracking", href: "/admin/tracking", icon: Link2 },
    { name: "KI-Support", href: "/admin/support", icon: Bot },
    { name: "Voice-Agent", href: "/admin/voice-agent", icon: Phone },
    { name: "Provisionen", href: "/admin/commission-invoices", icon: Receipt },
    { name: "Buchhaltung", href: "/admin/accounting", icon: BookOpenCheck },
    { name: "APM & Monitoring", href: "/admin/apm", icon: Activity },
    { name: "ROLLER Integration", href: "/admin/roller", icon: Cog },
    { name: "Regiondo Integration", href: "/admin/regiondo", icon: Calendar },
    { name: "Eversport Integration", href: "/admin/eversport", icon: Dumbbell },
    { name: "Planyo Integration", href: "/admin/planyo", icon: CalendarCheck },
    { name: "Pretix Integration", href: "/admin/pretix", icon: Ticket },
    { name: "IT-Architektur", href: "/admin/integration-architecture", icon: Globe },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const NavLink = ({ item }: { item: typeof navigation[0] }) => {
    const isActive = location === item.href;
    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
        onClick={() => setIsMobileOpen(false)}
      >
        <item.icon className="h-4 w-4" />
        {item.name}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile header */}
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:hidden">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <img src={logoSymbol} alt="FreizeitEngel" className="h-7 w-7" />
          <span>FreizeitEngel Admin</span>
        </Link>
        <div className="flex-1"></div>
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 sm:max-w-none !p-0 overflow-hidden">
            <div className="flex flex-col h-full max-h-screen">
              <div className="flex items-center gap-2 font-semibold px-6 py-5 border-b shrink-0">
                <img src={logoSymbol} alt="FreizeitEngel" className="h-7 w-7" />
                <span>FreizeitEngel Admin</span>
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                <nav className="p-3">
                  <div className="flex flex-col gap-1">
                    {navigation.map((item) => (
                      <NavLink key={item.name} item={item} />
                    ))}
                  </div>
                  <Separator className="my-3" />
                  <div className="flex flex-col gap-1">
                    <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                      onClick={() => setIsMobileOpen(false)}>
                      <Globe className="h-4 w-4" />
                      Zur Website
                    </Link>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm justify-start text-muted-foreground hover:text-foreground"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Abmelden
                    </Button>
                  </div>
                </nav>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop and Mobile layout */}
      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 border-r md:block sticky top-0 h-screen">
          <div className="flex h-full flex-col gap-2">
            <div className="flex h-16 items-center gap-2 border-b px-4 font-semibold">
              <img src={logoSymbol} alt="FreizeitEngel" className="h-7 w-7" />
              <span>FreizeitEngel Admin</span>
            </div>
            <nav className="flex-1 overflow-auto p-4">
              <div className="flex flex-col gap-2">
                {navigation.map((item) => (
                  <NavLink key={item.name} item={item} />
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex flex-col gap-2">
                <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                  <Globe className="h-4 w-4" />
                  Zur Website
                </Link>
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm justify-start text-muted-foreground hover:text-foreground"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Abmelden
                </Button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
