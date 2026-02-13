import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  console.log('[NotFoundPage] Rendering 404');
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="text-xl text-muted-foreground">Page not found</p>
      <Link to={ROUTES.DASHBOARD}>
        <Button variant="outline">
          <Home className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}
