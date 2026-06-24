import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useTheme } from '@/context/theme-context';

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

  const { theme } = useTheme();
  const { t } = useTranslation();

  console.log('[AppLayout] Rendering layout');

  const gradientStyle = theme === 'dark'
    ? `radial-gradient(ellipse at 20% 80%, rgba(168, 85, 247, 0.18) 0%, transparent 55%),
       radial-gradient(ellipse at 80% 20%, rgba(192, 132, 252, 0.14) 0%, transparent 55%),
       radial-gradient(ellipse at 50% 50%, rgba(139, 92, 246, 0.10) 0%, transparent 65%)`
    : `radial-gradient(ellipse at 20% 80%, rgba(139, 92, 246, 0.12) 0%, transparent 55%),
       radial-gradient(ellipse at 80% 20%, rgba(168, 85, 247, 0.08) 0%, transparent 55%),
       radial-gradient(ellipse at 50% 50%, rgba(124, 58, 237, 0.06) 0%, transparent 65%)`;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar (sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-60 border-0 p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">{t('common.navigation')}</SheetTitle>
          <SheetDescription className="sr-only">{t('common.navigationMenu')}</SheetDescription>
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
              backgroundImage: gradientStyle,
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
