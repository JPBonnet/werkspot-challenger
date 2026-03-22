export interface Review {
  id: string;
  jobId: string;
  customerId: string;
  customerName: string;
  professionalId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewInput {
  jobId: string;
  professionalId: string;
  rating: number;
  comment: string;
}
