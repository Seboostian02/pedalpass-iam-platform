import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useResourceFilterOptions } from '@/hooks/use-resources';
import { Search, X, LayoutGrid, Table2 } from 'lucide-react';

interface ResourceFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
}

export function ResourceFilters({
  search, onSearchChange,
  typeFilter, onTypeChange,
  categoryFilter, onCategoryChange,
  statusFilter, onStatusChange,
  viewMode, onViewModeChange,
}: ResourceFiltersProps) {
  const { data: allFilters } = useResourceFilterOptions();
  const { data: filteredByType } = useResourceFilterOptions(typeFilter);

  const availableTypes = allFilters?.types ?? [];
  const availableCategories = filteredByType?.categories ?? [];

  const handleTypeChange = (value: string) => {
    onTypeChange(value);
    // Reset category since available categories will change
    if (categoryFilter !== 'all') {
      onCategoryChange('all');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-0 flex-1 basis-full sm:basis-auto sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search resources..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
        {search && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => onSearchChange('')}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <Select value={typeFilter} onValueChange={handleTypeChange}>
        <SelectTrigger className="w-[calc(50%-6px)] sm:w-[150px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {availableTypes.map((type) => (
            <SelectItem key={type} value={type}>{type}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={categoryFilter} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[calc(50%-6px)] sm:w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {availableCategories.map((cat) => (
            <SelectItem key={cat} value={cat}>{cat.replace('_', ' ')}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[calc(50%-6px)] sm:w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1 ml-auto">
        <Button
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('grid')}
        >
          <LayoutGrid className="h-4 w-4 mr-1" />
          Grid
        </Button>
        <Button
          variant={viewMode === 'table' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('table')}
        >
          <Table2 className="h-4 w-4 mr-1" />
          Table
        </Button>
      </div>
    </div>
  );
}
