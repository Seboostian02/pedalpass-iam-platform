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
    <Card className={cn('transition-all duration-300 hover:neon-border hover:glow-violet hover:shadow-[0_0_25px_rgba(224,163,255,0.1)]', className)}>
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
