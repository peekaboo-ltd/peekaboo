import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Skeleton } from '../ui/skeleton';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { DataTableProps, SortingState } from '../../types/table.types';

function DataTableComponent<T extends Record<string, unknown>>({
  data, 
  columns,
  pageCount = 1,
  pageIndex = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  isLoading = false,
  onRowClick,
  searchPlaceholder = 'Search...',
  onSearchChange,
  selectedRows = [],
  onSelectionChange,
  getRowId = (row: T) => row.id as string || JSON.stringify(row),
  emptyMessage = 'No data available',
  actions,
}: DataTableProps<T>) {
  const [localSearch, setLocalSearch] = useState('');
  const [sortState, setSortState] = useState<SortingState | null>(null);
  const [localSelectedRows, setLocalSelectedRows] = useState<Set<string>>(new Set());

  // Update local selected rows when prop changes
  useEffect(() => {
    if (onSelectionChange) {
      const selectedIds = new Set(selectedRows.map(row => getRowId(row)));
      setLocalSelectedRows(selectedIds);
    }
  }, [selectedRows, getRowId, onSelectionChange]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange?.(localSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  // Handle sorting
  const handleSort = (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (!column?.sortable) return;

    let newDirection: 'asc' | 'desc' = 'asc';
    
    if (sortState?.column === columnId) {
      newDirection = sortState.direction === 'asc' ? 'desc' : 'asc';
    }

    const newSortState = { column: columnId, direction: newDirection };
    setSortState(newSortState);
    onSortChange?.(newSortState);
  };

  // Handle row selection
  const handleRowSelection = (rowId: string, checked: boolean) => {
    if (!onSelectionChange || !Array.isArray(data)) return;

    const newSelection = new Set(localSelectedRows);
    if (checked) {
      newSelection.add(rowId);
    } else {
      newSelection.delete(rowId);
    }

    setLocalSelectedRows(newSelection);
    const selectedData = data.filter(row => newSelection.has(getRowId(row)));
    onSelectionChange(selectedData);
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange || !Array.isArray(data)) return;

    if (checked) {
      const allIds = new Set(data.map(row => getRowId(row)));
      setLocalSelectedRows(allIds);
      onSelectionChange(data);
    } else {
      setLocalSelectedRows(new Set());
      onSelectionChange([]);
    }
  };

  const isAllSelected = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return false;
    return data.every(row => localSelectedRows.has(getRowId(row)));
  }, [data, localSelectedRows, getRowId]);

  const isPartiallySelected = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return false;
    return data.some(row => localSelectedRows.has(getRowId(row))) && !isAllSelected;
  }, [data, localSelectedRows, getRowId, isAllSelected]);

  // Pagination calculations
  const totalPages = pageCount;
  const currentPage = pageIndex + 1;

  const pageSizeOptions = [10, 20, 50, 100];

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.id}>
                    <Skeleton className="h-4 w-full" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.id}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Search Bar */}
      {onSearchChange && (
        <div className="flex items-center max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {onSelectionChange && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isPartiallySelected}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(column.headerClassName)}
                >
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8 data-[state=open]:bg-accent"
                      onClick={() => handleSort(column.id)}
                    >
                      {column.header}
                      {sortState?.column === column.id ? (
                        sortState.direction === 'asc' ? (
                          <ArrowUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ArrowDown className="ml-2 h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
              {actions && (
                <TableHead className="w-12">
                  <span className="sr-only">Actions</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {!Array.isArray(data) || data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (onSelectionChange ? 1 : 0) + (actions ? 1 : 0)}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => {
                const rowId = getRowId(row);
                const isSelected = localSelectedRows.has(rowId);
                
                return (
                  <TableRow
                    key={rowId}
                    className={cn(
                      onRowClick && 'cursor-pointer hover:bg-muted/50',
                      isSelected && 'bg-muted/50'
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {onSelectionChange && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked: boolean) => 
                            handleRowSelection(rowId, checked as boolean)
                          }
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => {
                      let value;
                      if (column.accessor) {
                        if (typeof column.accessor === 'function') {
                          value = column.accessor?.(row);
                        } else {
                          value = row[column.accessor as string];
                        }
                      }

                      return (
                        <TableCell
                          key={column.id}
                          className={cn(column.className)}
                        >
                          {column.cell ? column.cell({ row, value }) : value}
                        </TableCell>
                      );
                    })}
                    {actions && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {actions(row)}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {Array.isArray(data) && data.length > 0 && (onPageChange || onPageSizeChange) && (
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">
              Showing {pageIndex * pageSize + 1} to{' '}
              {Math.min((pageIndex + 1) * pageSize, data.length)} of{' '}
              {pageCount * pageSize} results
            </p>
            {onPageSizeChange && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {pageSize} per page
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Page size</DropdownMenuLabel>
                  {pageSizeOptions.map((size) => (
                    <DropdownMenuItem
                      key={size}
                      onClick={() => onPageSizeChange(size)}
                    >
                      {size} per page
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          {onPageChange && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(0)}
                disabled={pageIndex === 0}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pageIndex - 1)}
                disabled={pageIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pageIndex + 1)}
                disabled={pageIndex >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(totalPages - 1)}
                disabled={pageIndex >= totalPages - 1}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Export with type assertion to maintain generic type
export const DataTable = DataTableComponent as <T extends Record<string, unknown>>(
  props: DataTableProps<T>
) => React.ReactElement;