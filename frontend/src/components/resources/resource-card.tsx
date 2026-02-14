import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ResourceResponse } from '@/types/resource';
import { MapPin, Users, Lock, LockOpen, Server, Building2 } from 'lucide-react';

interface ResourceCardProps {
  resource: ResourceResponse;
  onRequestAccess: (resource: ResourceResponse) => void;
  onEdit?: (resource: ResourceResponse) => void;
  canEdit?: boolean;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  PHYSICAL: <Building2 className="h-5 w-5" />,
  DIGITAL: <Server className="h-5 w-5" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  OFFICE: 'bg-primary/15 text-primary border-primary/30',
  MEETING_ROOM: 'bg-status-pending/15 text-status-pending border-status-pending/30',
  PARKING: 'bg-severity-info/15 text-severity-info border-severity-info/30',
  EQUIPMENT: 'bg-severity-warning/15 text-severity-warning border-severity-warning/30',
  APPLICATION: 'bg-primary/15 text-primary border-primary/30',
  FILE_SHARE: 'bg-status-approved/15 text-status-approved border-status-approved/30',
  VPN: 'bg-severity-critical/15 text-severity-critical border-severity-critical/30',
  DATABASE: 'bg-status-collision/15 text-status-collision border-status-collision/30',
};

export function ResourceCard({ resource, onRequestAccess, onEdit, canEdit }: ResourceCardProps) {
  console.log('[ResourceCard] Rendering:', resource.name, resource.resourceType);

  return (
    <Card className={`group h-full transition-all duration-300 ${resource.active ? 'hover:neon-border hover:glow-violet hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(224,163,255,0.1)]' : 'opacity-50 grayscale-[40%]'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="text-primary">{TYPE_ICONS[resource.resourceType]}</div>
            <CardTitle className="text-base">{resource.name}</CardTitle>
          </div>
          <Badge variant="outline" className={`text-xs ${CATEGORY_COLORS[resource.resourceCategory] || ''}`}>
            {resource.resourceCategory.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-3">
        {resource.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{resource.description}</p>
        )}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {resource.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {resource.location}
            </span>
          )}
          {resource.capacity && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Cap: {resource.capacity}
            </span>
          )}
          <span className="flex items-center gap-1">
            {resource.requiresApproval
              ? <><Lock className="h-3 w-3" /> Requires approval</>
              : <><LockOpen className="h-3 w-3" /> Auto-approved</>}
          </span>
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          <Badge variant="outline" className={resource.active
            ? 'bg-status-approved/15 text-status-approved border-status-approved/30'
            : 'bg-status-denied/15 text-status-denied border-status-denied/30'
          }>
            {resource.active ? 'Active' : 'Inactive'}
          </Badge>
          <div className="flex-1" />
          {canEdit && onEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(resource)}>
              Edit
            </Button>
          )}
          {resource.active && (
            <Button size="sm" onClick={() => onRequestAccess(resource)}>
              Request Access
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
