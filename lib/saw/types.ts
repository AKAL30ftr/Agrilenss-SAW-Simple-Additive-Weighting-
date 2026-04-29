export type CriterionType = 'benefit' | 'cost';

export interface Criterion {
  id: string;
  name: string;
  type: CriterionType;
  weight: number; // 0 to 1
}

export interface Alternative {
  id: string;
  name: string;
  values: Record<string, number>; // key is Criterion.id
}

export interface SAWResult {
  alternativeId: string;
  name: string;
  preferenceScore: number;
  normalizedValues: Record<string, number>;
}
