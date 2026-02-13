import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ResourceResponse } from '@/types/resource';
import { Lock, LockOpen, MapPin } from 'lucide-react';

interface ResourcesTableProps {
  data: ResourceResponse[];
  onRequestAccess: (resource: ResourceResponse) => void;
  onEdit?: (resource: ResourceResponse) => void;
  canEdit?: boolean;
}

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

export function ResourcesTable({ data, onRequestAccess, onEdit, canEdit }: ResourcesTableProps) {
  const columns: ColumnDef<ResourceResponse>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          {row.original.description && (
            <div className="text-xs text-muted-foreground line-clamp-1">{row.original.description}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'resourceType',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">{row.original.resourceType}</Badge>
      ),
    },
    {
      accessorKey: 'resourceCategory',
      header: 'Category',
      cell: ({ row }) => (
        <Badge variant="outline" className={`text-xs ${CATEGORY_COLORS[row.original.resourceCategory] || ''}`}>
          {row.original.resourceCategory.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => row.original.location ? (
        <span className="flex items-center gap-1 text-sm">
          <MapPin className="h-3 w-3" />
          {row.original.location}
        </span>
      ) : <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: 'requiresApproval',
      header: 'Approval',
      cell: ({ row }) => (
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          {row.original.requiresApproval
            ? <><Lock className="h-3 w-3" /> Required</>
            : <><LockOpen className="h-3 w-3" /> Auto</>}
        </span>
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
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          {canEdit && onEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(row.original)}>
              Edit
            </Button>
          )}
          <Button size="sm" onClick={() => onRequestAccess(row.original)}>
            Request
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded-md border border-border">
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
            <TableRow key={row.id}>
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
  );
}
