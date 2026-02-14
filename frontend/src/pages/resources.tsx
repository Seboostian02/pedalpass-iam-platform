import { useState, useCallback } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { ResourceCard } from '@/components/resources/resource-card';
import { ResourcesTable } from '@/components/resources/resources-table';
import { ResourceFilters } from '@/components/resources/resource-filters';
import { CreateResourceDialog } from '@/components/resources/create-resource-dialog';
import { EditResourceDialog } from '@/components/resources/edit-resource-dialog';
import { RequestAccessDialog } from '@/components/resources/request-access-dialog';
import { ResourceCalendarDialog } from '@/components/resources/resource-calendar-dialog';
import { Button } from '@/components/ui/button';
import { useResources } from '@/hooks/use-resources';
import { useAuth } from '@/context/auth-context';
import { ROLES } from '@/lib/constants';
import type { ResourceResponse } from '@/types/resource';
import { Plus, Server, CalendarDays } from 'lucide-react';

export default function ResourcesPage() {
  const { hasAnyRole } = useAuth();
  const canManage = hasAnyRole([ROLES.ADMIN, ROLES.RESOURCE_MANAGER]);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(12);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  const [createOpen, setCreateOpen] = useState(false);
  const [editResource, setEditResource] = useState<ResourceResponse | null>(null);
  const [requestResource, setRequestResource] = useState<ResourceResponse | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [defaultStart, setDefaultStart] = useState<string | undefined>();
  const [defaultEnd, setDefaultEnd] = useState<string | undefined>();

  const handleCalendarSlotSelect = useCallback((start: Date, end: Date) => {
    const toLocalDatetime = (d: Date) => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    setDefaultStart(toLocalDatetime(start));
    setDefaultEnd(toLocalDatetime(end));
    // Open request dialog without a pre-selected resource — user picks from dropdown
    setRequestResource({} as ResourceResponse);
  }, []);

  const { data, isLoading } = useResources({ page, size });

  console.log('[ResourcesPage] Rendering, page:', page, 'total:', data?.totalElements, 'viewMode:', viewMode);

  // Client-side filtering on current page data
  const filteredContent = (data?.content || []).filter((resource) => {
    const matchesSearch = !search ||
      resource.name.toLowerCase().includes(search.toLowerCase()) ||
      resource.description?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || resource.resourceType === typeFilter;
    const matchesCategory = categoryFilter === 'all' || resource.resourceCategory === categoryFilter;
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? resource.active : !resource.active);
    return matchesSearch && matchesType && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resources"
        description="Browse and request access to system resources"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setCalendarOpen(true)}>
              <CalendarDays className="h-4 w-4 mr-2" />
              Reservations
            </Button>
            {canManage && (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Resource
              </Button>
            )}
          </div>
        }
      />

      <ResourceFilters
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {isLoading ? (
        <LoadingSpinner className="py-12" />
      ) : filteredContent.length === 0 ? (
        <EmptyState
          icon={<Server className="h-12 w-12" />}
          title="No resources found"
          description={search || typeFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all'
            ? 'Try adjusting your filters'
            : 'No resources in the system yet'}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredContent.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onRequestAccess={(r) => { setDefaultStart(undefined); setDefaultEnd(undefined); setRequestResource(r); }}
              onEdit={canManage ? setEditResource : undefined}
              canEdit={canManage}
            />
          ))}
        </div>
      ) : (
        <ResourcesTable
          data={filteredContent}
          onRequestAccess={(r) => { setDefaultStart(undefined); setDefaultEnd(undefined); setRequestResource(r); }}
          onEdit={canManage ? setEditResource : undefined}
          canEdit={canManage}
        />
      )}

      {data && data.totalPages > 0 && (
        <DataTablePagination
          page={page}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          size={size}
          onPageChange={setPage}
          onSizeChange={(newSize) => { setSize(newSize); setPage(0); }}
        />
      )}

      <CreateResourceDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <EditResourceDialog resource={editResource} open={!!editResource} onClose={() => setEditResource(null)} />
      <RequestAccessDialog
        resource={requestResource}
        open={!!requestResource}
        onClose={() => { setRequestResource(null); setDefaultStart(undefined); setDefaultEnd(undefined); }}
        defaultStart={defaultStart}
        defaultEnd={defaultEnd}
      />
      <ResourceCalendarDialog
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        onSelectSlot={handleCalendarSlotSelect}
      />
    </div>
  );
}
