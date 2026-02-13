import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser, useAssignRole, useRemoveRole, useDeactivateUser } from '@/hooks/use-users';
import { useRoles } from '@/hooks/use-roles';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import type { UserResponse } from '@/types/user';
import { format } from 'date-fns';
import { Shield, ShieldOff, UserX, Pencil, X } from 'lucide-react';
import { useState } from 'react';

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-severity-critical/15 text-severity-critical border-severity-critical/30',
  SECURITY_OFFICER: 'bg-severity-warning/15 text-severity-warning border-severity-warning/30',
  RESOURCE_MANAGER: 'bg-status-pending/15 text-status-pending border-status-pending/30',
  USER: 'bg-primary/15 text-primary border-primary/30',
  GUEST: 'bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30',
};

interface UserDetailSheetProps {
  user: UserResponse | null;
  open: boolean;
  onClose: () => void;
  onEdit: (user: UserResponse) => void;
}

export function UserDetailSheet({ user, open, onClose, onEdit }: UserDetailSheetProps) {
  const [roleToAssign, setRoleToAssign] = useState('');
  const { data: fullUser, isLoading } = useUser(user?.id || '');
  const { data: allRoles } = useRoles();
  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();
  const deactivateUser = useDeactivateUser();

  const displayUser = fullUser || user;

  console.log('[UserDetailSheet] Open:', open, 'User:', displayUser?.email);

  if (!displayUser) return null;

  const availableRoles = allRoles?.filter((r) => !displayUser.roles.includes(r.name)) || [];

  const handleAssignRole = () => {
    if (!roleToAssign) return;
    console.log('[UserDetailSheet] Assigning role:', roleToAssign, 'to user:', displayUser.id);
    assignRole.mutate({ userId: displayUser.id, roleName: roleToAssign }, {
      onSuccess: () => setRoleToAssign(''),
    });
  };

  const handleRemoveRole = (roleName: string) => {
    console.log('[UserDetailSheet] Removing role:', roleName, 'from user:', displayUser.id);
    removeRole.mutate({ userId: displayUser.id, roleName });
  };

  const handleDeactivate = () => {
    console.log('[UserDetailSheet] Deactivating user:', displayUser.id);
    deactivateUser.mutate(displayUser.id, { onSuccess: onClose });
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {displayUser.firstName} {displayUser.lastName}
            <Badge variant="outline" className={displayUser.active
              ? 'bg-status-approved/15 text-status-approved border-status-approved/30'
              : 'bg-status-denied/15 text-status-denied border-status-denied/30'
            }>
              {displayUser.active ? 'Active' : 'Inactive'}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : (
          <div className="mt-6 space-y-6">
            {/* User Info */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Details</h4>
              <div className="space-y-2 text-sm">
                <InfoRow label="Email" value={displayUser.email} mono />
                <InfoRow label="Phone" value={displayUser.phoneNumber || '—'} />
                <InfoRow label="Department" value={displayUser.departmentName || '—'} />
                <InfoRow label="User ID" value={displayUser.id} mono />
                <InfoRow label="Created" value={format(new Date(displayUser.createdAt), 'MMM dd, yyyy HH:mm')} />
                <InfoRow label="Updated" value={format(new Date(displayUser.updatedAt), 'MMM dd, yyyy HH:mm')} />
              </div>
            </div>

            <Separator />

            {/* Roles */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Roles</h4>
              <div className="flex flex-wrap gap-2">
                {displayUser.roles.map((role) => (
                  <Badge key={role} variant="outline" className={`text-xs ${ROLE_COLORS[role] || ''}`}>
                    {role}
                    <button
                      onClick={() => handleRemoveRole(role)}
                      className="ml-1.5 hover:text-destructive transition-colors"
                      disabled={removeRole.isPending}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              {/* Assign new role */}
              {availableRoles.length > 0 && (
                <div className="flex gap-2">
                  <Select value={roleToAssign} onValueChange={setRoleToAssign}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select role to assign" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={handleAssignRole}
                    disabled={!roleToAssign || assignRole.isPending}
                  >
                    <Shield className="h-4 w-4 mr-1" />
                    Assign
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => onEdit(displayUser)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit User
              </Button>
              {displayUser.active && (
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDeactivate}
                  disabled={deactivateUser.isPending}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Deactivate
                </Button>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? 'font-mono text-xs' : ''}>{value}</span>
    </div>
  );
}
