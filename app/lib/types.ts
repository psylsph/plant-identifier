export interface PlantInfo {
  name: string;
  confidence: string;
  details: string;
  healthy: string;
  care: string;
}

export interface HistoryEntry {
  id: string;
  thumbnail: string;
  result: PlantInfo;
  at: number;
}