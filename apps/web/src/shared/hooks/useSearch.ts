import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchApi, type SearchResult } from '../../api/search.api';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { data: results = [], isLoading, isFetching } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchApi.search(query, 15),
    enabled: query.length >= 2,
    staleTime: 10000,
  });

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
  }, []);

  return {
    query,
    setQuery,
    results: results as SearchResult[],
    isLoading: isLoading || isFetching,
    isOpen,
    open,
    close,
  };
}
