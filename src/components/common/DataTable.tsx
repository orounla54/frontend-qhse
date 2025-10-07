import React, { useState, useMemo } from 'react';
import { cn } from '../../utils/cn';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp,
  Search,
  Filter,
  Download,
  MoreHorizontal
} from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';

export interface Column<T> {
  key: string;
  header: string;
  accessor: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  searchable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  className?: string;
  onRowClick?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  title,
  searchable = true,
  filterable = true,
  exportable = true,
  pagination = true,
  pageSize = 10,
  className,
  onRowClick,
  actions
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = data;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    return filtered;
  }, [data, searchTerm]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof T];
      const bValue = b[sortConfig.key as keyof T];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const handleExport = () => {
    // Implementation for export functionality
    const csvContent = [
      columns.map(col => col.header).join(','),
      ...filteredData.map(item =>
        columns.map(col => {
          const value = item[col.key as keyof T];
          return typeof value === 'string' ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'data'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {title && (
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          {searchable && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
                size="sm"
              />
            </div>
          )}

          {/* Export */}
          {exportable && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              leftIcon={<Download className="h-4 w-4" />}
            >
              Exporter
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider",
                      column.sortable && "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600",
                      column.width && column.width,
                      column.align === 'center' && "text-center",
                      column.align === 'right' && "text-right"
                    )}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className={cn(
                      "flex items-center gap-2",
                      column.align === 'center' && "justify-center",
                      column.align === 'right' && "justify-end"
                    )}>
                      {column.header}
                      {column.sortable && (
                        <div className="flex flex-col">
                          <ChevronUp 
                            className={cn(
                              "h-3 w-3",
                              sortConfig?.key === column.key && sortConfig.direction === 'asc'
                                ? "text-primary-600"
                                : "text-gray-400"
                            )}
                          />
                          <ChevronDown 
                            className={cn(
                              "h-3 w-3 -mt-1",
                              sortConfig?.key === column.key && sortConfig.direction === 'desc'
                                ? "text-primary-600"
                                : "text-gray-400"
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
                {actions && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedData.length === 0 ? (
                <tr>
                  <td 
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <Search className="h-6 w-6 text-gray-400" />
                      </div>
                      <p>Aucune donnée trouvée</p>
                      {searchTerm && (
                        <p className="text-sm">
                          Essayez de modifier vos critères de recherche
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <tr
                    key={index}
                    className={cn(
                      "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150",
                      onRowClick && "cursor-pointer"
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white",
                          column.align === 'center' && "text-center",
                          column.align === 'right' && "text-right"
                        )}
                      >
                        {column.accessor(item)}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        {actions(item)}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && totalPages > 1 && (
          <div className="bg-white dark:bg-gray-800 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Affichage de {((currentPage - 1) * pageSize) + 1} à{' '}
                {Math.min(currentPage * pageSize, filteredData.length)} sur{' '}
                {filteredData.length} résultats
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(current => Math.max(1, current - 1))}
                  disabled={currentPage === 1}
                  leftIcon={<ChevronLeft className="h-4 w-4" />}
                >
                  Précédent
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "px-3 py-1 text-sm rounded-md transition-colors duration-150",
                        page === currentPage
                          ? "bg-primary-600 text-white"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      )}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(current => Math.min(totalPages, current + 1))}
                  disabled={currentPage === totalPages}
                  rightIcon={<ChevronRight className="h-4 w-4" />}
                >
                  Suivant
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 