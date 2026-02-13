import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RESOURCE_TYPES, RESOURCE_CATEGORIES } from '@/lib/constants';
import { Search, X, LayoutGrid, Table2 } from 'lucide-react';

interface ResourceFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
}

export function ResourceFilters({
  search, onSearchChange,
  typeFilter, onTypeChange,
  categoryFilter, onCategoryChange,
  viewMode, onViewModeChange,
}: ResourceFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
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

      <Select value={typeFilter} onValueChange={onTypeChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {RESOURCE_TYPES.map((type) => (
            <SelectItem key={type} value={type}>{type}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={categoryFilter} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {RESOURCE_CATEGORIES.map((cat) => (
            <SelectItem key={cat} value={cat}>{cat.replace('_', ' ')}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1 ml-auto">
        <Button
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('grid')}
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'table' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('table')}
        >
          <Table2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
