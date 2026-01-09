import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

interface QueryContextValue {
  query: string;
  setQuery: (query: string) => void;
}

const QueryContext = createContext<QueryContextValue | null>(null);

export function QueryProvider({ children }: { children: ReactNode }) {
  const [query, setQueryState] = useState('');

  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
  }, []);

  return (
    <QueryContext.Provider value={{ query, setQuery }}>
      {children}
    </QueryContext.Provider>
  );
}

export function useQuery() {
  const context = useContext(QueryContext);
  if (!context) {
    throw new Error('useQuery must be used within a QueryProvider');
  }
  return context;
}
