"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useCompleteProfile } from '@/hooks/useCompleteProfile';

interface CVBuilderContextType {
  profile: any;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const CVBuilderContext = createContext<CVBuilderContextType | undefined>(undefined);

interface CVBuilderProviderProps {
  children: ReactNode;
}

export function CVBuilderProvider({ children }: CVBuilderProviderProps) {
  const { profile, isLoading, error, refetch } = useCompleteProfile();

  return (
    <CVBuilderContext.Provider value={{ profile, isLoading, error, refetch }}>
      {children}
    </CVBuilderContext.Provider>
  );
}

export function useCVBuilder() {
  const context = useContext(CVBuilderContext);
  if (context === undefined) {
    throw new Error('useCVBuilder must be used within a CVBuilderProvider');
  }
  return context;
}
