"use client";

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { Criterion, Alternative, SAWResult } from '../lib/saw/types';
import { SAWEngine } from '../lib/saw/engine';

// Define the default criteria based on our standard UI layout
const DEFAULT_CRITERIA: Criterion[] = [
  { id: 'c1', name: 'Kualitas Tanah', type: 'benefit', weight: 0.35 },
  { id: 'c2', name: 'Curah Hujan', type: 'benefit', weight: 0.25 },
  { id: 'c3', name: 'Harga Pasar', type: 'benefit', weight: 0.20 },
  { id: 'c4', name: 'Biaya Produksi', type: 'cost', weight: 0.10 },
  { id: 'c5', name: 'Permintaan', type: 'benefit', weight: 0.10 },
];

interface SAWContextState {
  criteria: Criterion[];
  alternatives: Alternative[];
  results: SAWResult[];
  draftAlternative: Partial<Alternative>;
  setDraftAlternative: React.Dispatch<React.SetStateAction<Partial<Alternative>>>;
  addAlternative: (alt: Omit<Alternative, 'id'>) => void;
  removeAlternative: (id: string) => void;
  updateAlternativeValues: (id: string, values: Record<string, number>) => void;
  updateCriteriaWeights: (updates: { id: string; weight: number }[]) => void;
  clearAlternatives: () => void;
}

const SAWContext = createContext<SAWContextState | undefined>(undefined);

export function SAWProvider({ children }: { children: React.ReactNode }) {
  const [criteria, setCriteria] = useState<Criterion[]>(DEFAULT_CRITERIA);
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [draftAlternative, setDraftAlternative] = useState<Partial<Alternative>>({
    name: '',
    values: {}
  });

  // Calculate results automatically whenever criteria or alternatives change
  const results = useMemo(() => {
    return SAWEngine.calculate(criteria, alternatives);
  }, [criteria, alternatives]);

  const addAlternative = useCallback((alt: Omit<Alternative, 'id'>) => {
    const id = crypto.randomUUID();
    setAlternatives((prev) => [...prev, { ...alt, id }]);
  }, []);

  const removeAlternative = useCallback((id: string) => {
    setAlternatives((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const updateAlternativeValues = useCallback((id: string, values: Record<string, number>) => {
    setAlternatives((prev) => 
      prev.map((a) => (a.id === id ? { ...a, values: { ...a.values, ...values } } : a))
    );
  }, []);

  const updateCriteriaWeights = useCallback((updates: { id: string; weight: number }[]) => {
    setCriteria((prev) =>
      prev.map((c) => {
        const update = updates.find((u) => u.id === c.id);
        return update ? { ...c, weight: update.weight } : c;
      })
    );
  }, []);

  const clearAlternatives = useCallback(() => {
    setAlternatives([]);
  }, []);

  const value = {
    criteria,
    alternatives,
    results,
    draftAlternative,
    setDraftAlternative,
    addAlternative,
    removeAlternative,
    updateAlternativeValues,
    updateCriteriaWeights,
    clearAlternatives,
  };

  return <SAWContext.Provider value={value}>{children}</SAWContext.Provider>;
}

export function useSAW() {
  const context = useContext(SAWContext);
  if (context === undefined) {
    throw new Error('useSAW must be used within a SAWProvider');
  }
  return context;
}
