import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { tEnum } from '@/lib/i18n-utils';
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { ResourceResponse } from '@/types/resource';
import { Lock, LockOpen, MapPin, Pencil, ShieldPlus, ArrowUpDown, Building2, Server, Users } from 'lucide-react';

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

const TYPE_ICONS: Record<string, React.ReactNode> = {
  PHYSICAL: <Building2 className="h-4 w-4" />,
  DIGITAL: <Server className="h-4 w-4" />,
};

function SortableHeader({ column, children }: { column: { toggleSorting: (desc?: boolean) => void; getIsSorted: () => false | 'asc' | 'desc' }; children: React.ReactNode }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 font-medium"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {children}
      <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 text-muted-foreground/60" />
    </Button>
  );
}

export function ResourcesTable({ data, onRequestAccess, onEdit, canEdit }: ResourcesTableProps) {
  const { t } = useTranslation();
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<ResourceResponse>[] = useMemo(() => [
    {
      accessorKey: 'name',
      header: ({ column }) => <SortableHeader column={column}>{t('resources.name')}</SortableHeader>,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            {TYPE_ICONS[row.original.resourceType] || <Server className="h-4 w-4" />}
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate">{row.original.name}</div>
            {row.original.description && (
              <div className="text-xs text-muted-foreground truncate max-w-[280px]">{row.original.description}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'resourceType',
      header: ({ column }) => <SortableHeader column={column}>{t('resources.type')}</SortableHeader>,
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {tEnum('resourceType', row.original.resourceType)}
        </Badge>
      ),
    },
    {
      accessorKey: 'resourceCategory',
      header: ({ column }) => <SortableHeader column={column}>{t('resources.category')}</SortableHeader>,
      cell: ({ row }) => (
        <Badge variant="outline" className={`text-xs ${CATEGORY_COLORS[row.original.resourceCategory] || ''}`}>
          {tEnum('resourceCategory', row.original.resourceCategory)}
        </Badge>
      ),
    },
    {
      accessorKey: 'location',
      header: t('resources.location'),
      cell: ({ row }) => row.original.location ? (
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {row.original.location}
        </span>
      ) : <span className="text-muted-foreground/50">—</span>,
    },
    {
      accessorKey: 'capacity',
      header: t('resources.capacity'),
      cell: ({ row }) => row.original.capacity ? (
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="h-3.5 w-3.5 shrink-0" />
          {row.original.capacity}
        </span>
      ) : <span className="text-muted-foreground/50">—</span>,
    },
    {
      accessorKey: 'requiresApproval',
      header: t('resources.approval'),
      cell: ({ row }) => (
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {row.original.requiresApproval
            ? <><Lock className="h-3.5 w-3.5 text-severity-warning" /> {t('resources.approvalRequired')}</>
            : <><LockOpen className="h-3.5 w-3.5 text-status-approved" /> {t('resources.approvalAuto')}</>}
        </span>
      ),
    },
    {
      accessorKey: 'active',
      header: ({ column }) => <SortableHeader column={column}>{t('resources.status')}</SortableHeader>,
      cell: ({ row }) => (
        <Badge variant="outline" className={row.original.active
          ? 'bg-status-approved/15 text-status-approved border-status-approved/30'
          : 'bg-status-denied/15 text-status-denied border-status-denied/30'
        }>
          {row.original.active ? t('common.active') : t('common.inactive')}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">{t('common.actions')}</span>,
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          {canEdit && onEdit && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(row.original)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('resources.editResourceTooltip')}</TooltipContent>
            </Tooltip>
          )}
          {row.original.active && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" className="h-8 gap-1.5" onClick={() => onRequestAccess(row.original)}>
                  <ShieldPlus className="h-3.5 w-3.5" />
                  {t('resources.request')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('resources.requestAccessTooltip')}</TooltipContent>
            </Tooltip>
          )}
        </div>
      ),
    },
  ], [t, canEdit, onEdit, onRequestAccess]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-muted/30 hover:bg-muted/30">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                {t('resources.noResourcesTable')}
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={`transition-colors ${row.original.active ? 'hover:bg-primary/5' : 'opacity-40'}`}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
