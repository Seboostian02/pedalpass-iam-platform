import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { useUnreadCount } from '@/hooks/use-notifications';

export function NotificationBell() {
  const { data: count } = useUnreadCount();

  console.log('[NotificationBell] Unread count:', count);

  return (
    <Link to={ROUTES.NOTIFICATIONS}>
      <Button variant="ghost" size="sm" className="relative">
        <Bell className="h-5 w-5" />
        {count != null && count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </Button>
    </Link>
  );
}
