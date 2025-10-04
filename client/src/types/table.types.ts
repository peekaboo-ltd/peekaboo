import { ReactNode } from 'react';

export interface Column<T> {
  id: string;
  header: string | ReactNode;
  accessor?: keyof T | ((row: T) => any);
  cell?: (info: { row: T; value: any }) => ReactNode;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageCount?: number;
  pageIndex?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSortChange?: (sort: { column: string; direction: 'asc' | 'desc' }) => void;
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  searchPlaceholder?: string;
  onSearchChange?: (search: string) => void;
  selectedRows?: T[];
  onSelectionChange?: (rows: T[]) => void;
  getRowId?: (row: T) => string;
  emptyMessage?: string;
  actions?: (row: T) => ReactNode;
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface SortingState {
  column: string;
  direction: 'asc' | 'desc';
}