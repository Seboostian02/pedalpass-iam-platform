import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface DataTablePaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  size: number;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
}

export function DataTablePagination({
  page, totalPages, totalElements, size, onPageChange, onSizeChange,
}: DataTablePaginationProps) {
  console.log('[DataTablePagination] Page:', page + 1, 'of', totalPages, 'total:', totalElements);

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-muted-foreground">
        {totalElements} total results
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page</span>
          <Select value={String(size)} onValueChange={(v) => onSizeChange(Number(v))}>
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50].map((s) => (
                <SelectItem key={s} value={String(s)}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground">
          Page {page + 1} of {totalPages || 1}
        </div>

        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => onPageChange(0)} disabled={page === 0}>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onPageChange(totalPages - 1)} disabled={page >= totalPages - 1}>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
