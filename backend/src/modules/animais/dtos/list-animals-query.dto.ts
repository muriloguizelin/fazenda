export interface ListAnimalsQuery {
  fazendaId: string;
  prefixo?: string;
  numero?: number;
  loteId?: string;
  status?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}
