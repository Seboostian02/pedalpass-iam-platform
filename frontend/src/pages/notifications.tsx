import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useNotificationPreferences,
  useUpdatePreference,
} from '@/hooks/use-notifications';
import type { NotificationResponse } from '@/types/notification';
import { Bell, Settings, CheckCheck, Trash2, Mail, BellRing } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const TYPE_COLORS: Record<string, string> = {
  WELCOME: 'bg-primary/15 text-primary border-primary/30',
  ACCESS: 'bg-status-pending/15 text-status-pending border-status-pending/30',
  COLLISION: 'bg-status-collision/15 text-status-collision border-status-collision/30',
  SECURITY: 'bg-severity-critical/15 text-severity-critical border-severity-critical/30',
};

export default function NotificationsPage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);

  const notificationsQuery = useNotifications({ page, size });
  const preferencesQuery = useNotificationPreferences();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();
  const updatePreference = useUpdatePreference();

  console.log('[NotificationsPage] Rendering, total:', notificationsQuery.data?.totalElements,
    'preferences:', preferencesQuery.data?.length);

  const handleMarkRead = (notification: NotificationResponse) => {
    if (!notification.read) {
      console.log('[NotificationsPage] Marking as read:', notification.id);
      markAsRead.mutate(notification.id);
    }
  };

  const handleDelete = (id: string) => {
    console.log('[NotificationsPage] Deleting notification:', id);
    deleteNotification.mutate(id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="View your notifications and manage preferences"
        action={
          <Button variant="outline" onClick={() => markAllAsRead.mutate()}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        }
      />

      <Tabs defaultValue="all">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">All</span> Notifications
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        {/* Notifications List */}
        <TabsContent value="all" className="space-y-4">
          {notificationsQuery.isLoading ? (
            <LoadingSpinner className="py-12" />
          ) : !notificationsQuery.data?.content.length ? (
            <EmptyState
              icon={<Bell className="h-12 w-12" />}
              title="No notifications"
              description="You're all caught up"
            />
          ) : (
            <>
              <div className="space-y-2">
                {notificationsQuery.data.content.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'flex items-start gap-4 rounded-lg border border-border p-4 transition-colors',
                      !notification.read && 'bg-primary/5 border-primary/20',
                    )}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className={cn('text-sm', !notification.read && 'font-semibold')}>
                          {notification.title}
                        </h4>
                        <Badge variant="outline" className={`text-xs ${TYPE_COLORS[notification.notificationType] || ''}`}>
                          {notification.notificationType}
                        </Badge>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(notification.createdAt), 'MMM dd, yyyy HH:mm')}
                        {notification.emailSent && (
                          <span className="ml-2 inline-flex items-center gap-1">
                            <Mail className="h-3 w-3" /> Email sent
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkRead(notification)}
                          title="Mark as read"
                        >
                          <CheckCheck className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <DataTablePagination
                page={page}
                totalPages={notificationsQuery.data.totalPages}
                totalElements={notificationsQuery.data.totalElements}
                size={size}
                onPageChange={setPage}
                onSizeChange={(s) => { setSize(s); setPage(0); }}
              />
            </>
          )}
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4">
          {preferencesQuery.isLoading ? (
            <LoadingSpinner className="py-12" />
          ) : !preferencesQuery.data?.length ? (
            <EmptyState
              icon={<Settings className="h-12 w-12" />}
              title="No preferences"
              description="Notification preferences will appear once configured"
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Notification Type</TableHead>
                      <TableHead className="text-center">
                        <span className="flex items-center justify-center gap-1">
                          <Mail className="h-4 w-4" /> Email
                        </span>
                      </TableHead>
                      <TableHead className="text-center">
                        <span className="flex items-center justify-center gap-1">
                          <BellRing className="h-4 w-4" /> In-App
                        </span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preferencesQuery.data.map((pref) => (
                      <TableRow key={pref.id}>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${TYPE_COLORS[pref.notificationType] || ''}`}>
                            {pref.notificationType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={pref.emailEnabled}
                            onCheckedChange={(checked) => {
                              console.log('[NotificationsPage] Updating preference:', pref.notificationType, 'email:', checked);
                              updatePreference.mutate({
                                notificationType: pref.notificationType,
                                emailEnabled: checked,
                                inAppEnabled: pref.inAppEnabled,
                              });
                            }}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={pref.inAppEnabled}
                            onCheckedChange={(checked) => {
                              console.log('[NotificationsPage] Updating preference:', pref.notificationType, 'inApp:', checked);
                              updatePreference.mutate({
                                notificationType: pref.notificationType,
                                emailEnabled: pref.emailEnabled,
                                inAppEnabled: checked,
                              });
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
