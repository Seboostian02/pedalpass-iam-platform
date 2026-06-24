import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { ROUTES } from '@/lib/constants';
import { LogOut, User, Menu, Sun, Moon } from 'lucide-react';

interface TopbarProps {
  onMobileMenuToggle?: () => void;
}

export function Topbar({ onMobileMenuToggle }: TopbarProps) {
  const { state, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const initials = state.user
    ? `${state.user.firstName[0]}${state.user.lastName[0]}`.toUpperCase()
    : '??';

  const handleLogout = async () => {
    console.log('[Topbar] Logout clicked');
    await logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ro' ? 'en' : 'ro';
    i18n.changeLanguage(newLang);
    console.log('[Topbar] Language changed to:', newLang);
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-neon-lavender/12 bg-card/40 px-4 backdrop-blur-md">
      {/* Left: spacer (keeps right side aligned) */}
      <div className="flex items-center gap-2" />

      {/* Right: language + theme + notifications + user + mobile menu */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLanguage}
          className="h-8 w-8 p-0 font-semibold text-xs"
          title={i18n.language === 'en' ? 'Schimba in Romana' : 'Switch to English'}
        >
          {i18n.language === 'en' ? 'RO' : 'EN'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="h-8 w-8 p-0"
          title={theme === 'dark' ? t('layout.switchToLight') : t('layout.switchToDark')}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
        <NotificationBell />
        {onMobileMenuToggle && (
          <Button variant="ghost" size="sm" className="md:hidden" onClick={onMobileMenuToggle}>
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary/20 text-xs text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm md:inline">{state.user?.firstName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm">{state.user?.firstName} {state.user?.lastName}</span>
                <span className="text-xs text-muted-foreground">{state.user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(ROUTES.PROFILE)}>
              <User className="mr-2 h-4 w-4" />
              {t('layout.profile')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              {t('layout.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
