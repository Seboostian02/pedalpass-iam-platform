import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { RequestStatusBadge } from '@/components/shared/status-badge';
import { ReviewDialog } from '@/components/access-requests/review-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMyRequests, usePendingRequests } from '@/hooks/use-access-requests';
import { useAuth } from '@/context/auth-context';
import { ROLES } from '@/lib/constants';
import type { AccessRequestResponse } from '@/types/resource';
import { Clock, ClipboardCheck, Eye } from 'lucide-react';
import { format } from 'date-fns';

export default function AccessRequestsPage() {
  const { hasAnyRole } = useAuth();
  const canReview = hasAnyRole([ROLES.ADMIN, ROLES.RESOURCE_MANAGER]);

  const [myPage, setMyPage] = useState(0);
  const [mySize, setMySize] = useState(10);
  const [pendingPage, setPendingPage] = useState(0);
  const [pendingSize, setPendingSize] = useState(10);
  const [reviewRequest, setReviewRequest] = useState<AccessRequestResponse | null>(null);

  const myRequestsQuery = useMyRequests({ page: myPage, size: mySize });
  const pendingQuery = usePendingRequests({ page: pendingPage, size: pendingSize }, { enabled: canReview });

  console.log('[AccessRequestsPage] Rendering, myRequests:', myRequestsQuery.data?.totalElements,
    'pending:', pendingQuery.data?.totalElements, 'canReview:', canReview);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Access Requests"
        description="Track your access requests and review pending ones"
      />

      <Tabs defaultValue="my-requests">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="my-requests" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">My</span> Requests
            {myRequestsQuery.data && (
              <Badge variant="outline" className="ml-1 text-xs">{myRequestsQuery.data.totalElements}</Badge>
            )}
          </TabsTrigger>
          {canReview && (
            <TabsTrigger value="pending-review" className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Pending Review
              {pendingQuery.data && pendingQuery.data.totalElements > 0 && (
                <Badge className="ml-1 text-xs bg-status-pending text-status-pending-foreground">
                  {pendingQuery.data.totalElements}
                </Badge>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        {/* My Requests Tab */}
        <TabsContent value="my-requests" className="space-y-4">
          {myRequestsQuery.isLoading ? (
            <LoadingSpinner className="py-12" />
          ) : !myRequestsQuery.data?.content.length ? (
            <EmptyState
              icon={<Clock className="h-12 w-12" />}
              title="No requests yet"
              description="You haven't submitted any access requests"
            />
          ) : (
            <>
              <div className="overflow-x-auto rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Resource</TableHead>
                      <TableHead>Access Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Review Comment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myRequestsQuery.data.content.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{req.resource.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {req.resource.resourceType} / {req.resource.resourceCategory}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{req.accessLevel}</Badge>
                        </TableCell>
                        <TableCell>
                          <RequestStatusBadge status={req.status} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(req.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {req.reviewComment || '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <DataTablePagination
                page={myPage}
                totalPages={myRequestsQuery.data.totalPages}
                totalElements={myRequestsQuery.data.totalElements}
                size={mySize}
                onPageChange={setMyPage}
                onSizeChange={(s) => { setMySize(s); setMyPage(0); }}
              />
            </>
          )}
        </TabsContent>

        {/* Pending Review Tab */}
        {canReview && (
          <TabsContent value="pending-review" className="space-y-4">
            {pendingQuery.isLoading ? (
              <LoadingSpinner className="py-12" />
            ) : !pendingQuery.data?.content.length ? (
              <EmptyState
                icon={<ClipboardCheck className="h-12 w-12" />}
                title="All caught up"
                description="No pending requests to review"
              />
            ) : (
              <>
                <div className="overflow-x-auto rounded-md border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Resource</TableHead>
                        <TableHead>Access Level</TableHead>
                        <TableHead>Justification</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingQuery.data.content.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="font-mono text-xs">{req.userEmail}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{req.resource.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {req.resource.resourceType} / {req.resource.resourceCategory}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{req.accessLevel}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                            {req.justification || '—'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(req.createdAt), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" onClick={() => setReviewRequest(req)}>
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <DataTablePagination
                  page={pendingPage}
                  totalPages={pendingQuery.data.totalPages}
                  totalElements={pendingQuery.data.totalElements}
                  size={pendingSize}
                  onPageChange={setPendingPage}
                  onSizeChange={(s) => { setPendingSize(s); setPendingPage(0); }}
                />
              </>
            )}
          </TabsContent>
        )}
      </Tabs>

      <ReviewDialog
        request={reviewRequest}
        open={!!reviewRequest}
        onClose={() => setReviewRequest(null)}
      />
    </div>
  );
}
