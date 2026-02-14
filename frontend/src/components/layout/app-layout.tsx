import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile sheet on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close mobile sheet when viewport grows past md breakpoint (768px)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setMobileOpen(false);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  console.log('[AppLayout] Rendering layout');

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar (sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-60 border-0 p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">Application navigation menu</SheetDescription>
          <Sidebar side="right" />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMobileMenuToggle={() => setMobileOpen(true)} />
        <main className="relative flex-1 overflow-y-auto p-3 sm:p-6">
          {/* Animated gradient background */}
          <div
            className="pointer-events-none fixed inset-0 -z-10"
            aria-hidden="true"
            style={{
              backgroundImage: `
                radial-gradient(ellipse at 20% 80%, rgba(224, 163, 255, 0.08) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 20%, rgba(255, 105, 180, 0.06) 0%, transparent 50%),
                radial-gradient(ellipse at 60% 40%, rgba(147, 112, 219, 0.05) 0%, transparent 60%)
              `,
              animation: 'bg-pulse 16s ease-in-out infinite',
            }}
          />
          <div key={location.pathname} className="relative animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
