import { SpeciesDisplayGroup } from '../services/api';

export type { SpeciesDisplayGroup };

export type SpeciesCard = {
  codexEntryId: string;
  habitatCellId: string;
  codexNumber: number;
  displayName: string;
  scientificName: string | null;
  displayGroup: SpeciesDisplayGroup;
  description: string;
  imageUrl: string | null;
  regionName: string;
  observationCount: number;
  firstObservedAt: string | null;
  lastObservedAt: string | null;
};
