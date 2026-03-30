"use client";

import { useState, useMemo, useEffect } from 'react';

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc' | null;
}

interface UseRegistryFilterOptions<T> {
  data: T[];
  searchFields: (item: T) => string[];
  initialSort?: SortConfig;
  pageSize?: number;
  // Optional custom sort logic for complex types (e.g. scores)
  customSort?: (a: T, b: T, key: string, direction: 'asc' | 'desc') => number;
}

/**
 * Standardized hook for managing registry data views.
 * Handles searching, sorting, and client-side pagination.
 */
export function useRegistryFilter<T>({
  data,
  searchFields,
  initialSort = { key: '', direction: null },
  pageSize = 10,
  customSort
}: UseRegistryFilterOptions<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>(initialSort);
  const [currentPage, setCurrentPage] = useState(1);

  // Auto-reset to page 1 when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(item => 
      searchFields(item).some(field => 
        String(field || "").toLowerCase().includes(term)
      )
    );
  }, [data, searchTerm, searchFields]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      if (customSort) {
        return customSort(a, b, sortConfig.key, sortConfig.direction as 'asc' | 'desc');
      }

      let valA = (a as any)[sortConfig.key];
      let valB = (b as any)[sortConfig.key];

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig, customSort]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return {
    searchTerm,
    setSearchTerm,
    sortConfig,
    handleSort,
    currentPage,
    setCurrentPage,
    paginatedData,
    filteredData,
    totalItems: filteredData.length,
    pageSize
  };
}
