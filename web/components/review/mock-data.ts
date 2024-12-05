export interface Review {
  id: string;
  rating: number;
  review: string;
  date: string;
  reviewer: string;
  role: 'customer' | 'provider';
}

export interface UnreviewedService {
  id: string;
  serviceTitle: string;
  providerName: string;
  date: string;
  role: 'customer' | 'provider';
}

export const mockUnreviewedServicesReceived: UnreviewedService[] = [
  {
    id: 'unreview-1',
    serviceTitle: 'Website Development',
    providerName: 'John Doe',
    date: '2024-03-20',
    role: 'customer',
  },
  {
    id: 'unreview-2',
    serviceTitle: 'Logo Design',
    providerName: 'Jane Smith',
    date: '2024-03-19',
    role: 'customer',
  },
];

export const mockUnreviewedServicesGiven: UnreviewedService[] = [
  {
    id: 'unreview-3',
    serviceTitle: 'Mobile App Development',
    providerName: 'Alice Johnson',
    date: '2024-03-21',
    role: 'customer',
  },
];

export const mockReceivedReviews: Review[] = [
  {
    id: '1',
    rating: 5,
    review: 'Excellent work! Delivered the project ahead of schedule.',
    date: '2024-03-15',
    reviewer: 'Alice',
    role: 'customer',
  },
  {
    id: '2',
    rating: 4,
    review: 'Great communication and quality results.',
    date: '2024-03-10',
    reviewer: 'Bob',
    role: 'provider',
  },
];

export const mockGivenReviews: Review[] = [
  {
    id: '3',
    rating: 5,
    review: 'Perfect service! Clear communication throughout.',
    date: '2024-03-12',
    reviewer: 'Charlie',
    role: 'customer',
  },
  {
    id: '4',
    rating: 4,
    review: 'Great client to work with!',
    date: '2024-03-08',
    reviewer: 'David',
    role: 'provider',
  },
];
