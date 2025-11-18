export interface ListPesagensQuery {
  animalId: string;
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
}
