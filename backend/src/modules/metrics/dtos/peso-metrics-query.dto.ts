export interface GetPesoMetricsQuery {
  fazendaId: string;
  days?: number;
  loteId?: string;
}

export interface PesoMetricPoint {
  date: string;
  avg: number;
}
