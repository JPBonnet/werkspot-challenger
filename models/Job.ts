export interface Job {
  id: string;
  customerId: string;
  professionalId: string;
  professionalName: string;
  serviceType: string;
  description: string;
  location: string;
  scheduledDate: string;
  budget: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Professional {
  id: string;
  name: string;
  email: string;
  rating: number;
  reviewCount: number;
  bio: string;
  location: string;
  avatar?: string;
  services: ProfessionalService[];
  portfolio: string[];
}

export interface ProfessionalService {
  id: string;
  name: string;
  description: string;
  priceFrom: number;
  priceTo: number;
  duration: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  professionalId: string;
  professionalName: string;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
}
