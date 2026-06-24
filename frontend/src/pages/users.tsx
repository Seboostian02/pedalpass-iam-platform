import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/shared/page-header';
import { UsersTable } from '@/components/users/users-table';
import { UserDetailSheet } from '@/components/users/user-detail-sheet';
import { CreateUserDialog } from '@/components/users/create-user-dialog';
import { EditUserDialog } from '@/components/users/edit-user-dialog';
import { Button } from '@/components/ui/button';
import type { UserResponse } from '@/types/user';
import { UserPlus } from 'lucide-react';

export default function UsersPage() {
  const { t } = useTranslation();
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserResponse | null>(null);

  console.log('[UsersPage] Rendering, selectedUser:', selectedUser?.email);

  const handleRowClick = (user: UserResponse) => {
    console.log('[UsersPage] Row clicked:', user.email);
    setSelectedUser(user);
    setSheetOpen(true);
  };

  const handleEdit = (user: UserResponse) => {
    console.log('[UsersPage] Opening edit for:', user.email);
    setSheetOpen(false);
    setEditUser(user);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('users.title')}
        description={t('users.description')}
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            {t('users.createUser')}
          </Button>
        }
      />

      <UsersTable onRowClick={handleRowClick} />

      <UserDetailSheet
        user={selectedUser}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onEdit={handleEdit}
      />

      <CreateUserDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      <EditUserDialog
        user={editUser}
        open={!!editUser}
        onClose={() => setEditUser(null)}
      />
    </div>
  );
}
