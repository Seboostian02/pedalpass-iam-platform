import { useState, useMemo } from 'react';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { useUsers } from '@/hooks/use-users';
import { ROLES } from '@/lib/constants';
import type { UserResponse } from '@/types/user';
import { Users, Search, X } from 'lucide-react';
import { format } from 'date-fns';

interface UsersTableProps {
  onRowClick: (user: UserResponse) => void;
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-severity-critical/15 text-severity-critical border-severity-critical/30',
  SECURITY_OFFICER: 'bg-severity-warning/15 text-severity-warning border-severity-warning/30',
  RESOURCE_MANAGER: 'bg-status-pending/15 text-status-pending border-status-pending/30',
  USER: 'bg-primary/15 text-primary border-primary/30',
  GUEST: 'bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30',
};

const columns: ColumnDef<UserResponse>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.firstName} {row.original.lastName}</div>
        <div className="text-xs text-muted-foreground">{row.original.email}</div>
      </div>
    ),
  },
  {
    accessorKey: 'departmentName',
    header: 'Department',
    cell: ({ row }) => (
      <span className="text-sm">{row.original.departmentName || '—'}</span>
    ),
  },
  {
    accessorKey: 'roles',
    header: 'Roles',
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.roles.map((role) => (
          <Badge key={role} variant="outline" className={`text-xs ${ROLE_COLORS[role] || ''}`}>
            {role}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    accessorKey: 'active',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant="outline" className={row.original.active
        ? 'bg-status-approved/15 text-status-approved border-status-approved/30'
        : 'bg-status-denied/15 text-status-denied border-status-denied/30'
      }>
        {row.original.active ? 'Active' : 'Inactive'}
      </Badge>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {format(new Date(row.original.createdAt), 'MMM dd, yyyy')}
      </span>
    ),
  },
];

export function UsersTable({ onRowClick }: UsersTableProps) {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const { data, isLoading } = useUsers({ page, size });

  console.log('[UsersTable] Rendering, page:', page, 'size:', size, 'total:', data?.totalElements);

  // Client-side filtering (search + role) on current page data
  const filteredContent = useMemo(() => {
    return (data?.content || []).filter((user) => {
      const matchesSearch = !search ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.roles.includes(roleFilter);
      return matchesSearch && matchesRole;
    });
  }, [data?.content, search, roleFilter]);

  const table = useReactTable({
    data: filteredContent,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          {search && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setSearch('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {Object.values(ROLES).map((role) => (
              <SelectItem key={role} value={role}>{role}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner className="py-12" />
      ) : filteredContent.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="No users found"
          description={search || roleFilter !== 'all' ? 'Try adjusting your filters' : 'No users in the system yet'}
        />
      ) : (
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer transition-colors hover:bg-primary/5"
                  onClick={() => onRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
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
    </div>
  );
}
