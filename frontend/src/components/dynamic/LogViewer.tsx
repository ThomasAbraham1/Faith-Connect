import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface LogViewerProps<T> {
  data: T[];
  searchKeys?: (keyof T)[];
  searchPlaceholder?: string;
  renderItem: (item: T, index: number) => React.ReactNode;
  itemsPerPage?: number;
  emptyMessage?: string;
}

export function LogViewer<T>({
  data,
  searchKeys = [],
  searchPlaceholder = "Search...",
  renderItem,
  itemsPerPage = 10,
  emptyMessage = "No logs found.",
}: LogViewerProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;

    const lowercasedTerm = searchTerm.toLowerCase();
    return data.filter((item) => {
      // If no specific search keys are provided, we could stringify the object, 
      // but it's safer to only search specific keys.
      if (searchKeys.length === 0) {
         return JSON.stringify(item).toLowerCase().includes(lowercasedTerm);
      }
      
      return searchKeys.some((key) => {
        const val = item[key];
        return val != null && String(val).toLowerCase().includes(lowercasedTerm);
      });
    });
  }, [data, searchTerm, searchKeys]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Handle page changes
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="flex flex-col space-y-4 w-full">
      {/* Search Header */}
      {(data.length > 0 || searchTerm) && (
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-muted-foreground" />
          </div>
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background/50 border-border/50 focus-visible:ring-1 transition-all h-9 text-sm"
          />
        </div>
      )}

      {/* Log List */}
      <div className="flex flex-col gap-3 min-h-[200px]">
        {paginatedData.length > 0 ? (
          paginatedData.map((item, index) => renderItem(item, startIndex + index))
        ) : (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground bg-muted/10 rounded-lg border border-dashed border-border/50">
            {emptyMessage}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
