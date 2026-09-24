import { ReactNode } from "react";
import { Header } from "./header";
import { Footer } from "./footer";

/**
 * Real MainLayout, verbatim except for one deliberate omission: the real
 * app also renders <AISupportWidget /> here. That component calls raw
 * fetch("/api/support/chat") directly - NOT through the apiRequest/
 * queryClient chokepoint everything else in this static build is mocked through.
 * Including it would risk a real network call slipping past this static build's
 * "zero API calls" guarantee, so it's intentionally left out rather than
 * silently included and either broken or unsafe.
 */
interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
