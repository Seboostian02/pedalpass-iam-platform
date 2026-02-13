import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string | undefined;
  icon: ReactNode;
  loading?: boolean;
  className?: string;
}

export function StatCard({ title, value, icon, loading, className }: StatCardProps) {
  return (
    <Card className={cn('transition-all hover:glow-violet', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-16 animate-pulse rounded bg-muted" />
        ) : (
          <div className="text-3xl font-bold">{value ?? '-'}</div>
        )}
      </CardContent>
    </Card>
  );
}
