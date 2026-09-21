export interface PartnerProfile {
  id: number;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  category: string;
  description: string;
  website: string;
  logoInitials: string;
  openingHours: string;
  rating: number;
  reviewCount: number;
  memberSince: string;
}

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Booking {
  id: number;
  bookingReference: string;
  experienceTitle: string;
  customerName: string;
  customerEmail: string;
  date: string;
  time: string;
  participants: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
}

export interface Experience {
  id: number;
  title: string;
  category: string;
  price: number;
  duration: string;
  maxParticipants: number;
  active: boolean;
  bookingsCount: number;
  rating: number;
  imageColor: string;
}

export interface AvailabilitySlot {
  id: number;
  experienceTitle: string;
  date: string;
  time: string;
  capacity: number;
  booked: number;
}

export type PayoutStatus = "paid" | "pending" | "processing";

export interface Payout {
  id: number;
  period: string;
  grossAmount: number;
  commission: number;
  netAmount: number;
  status: PayoutStatus;
  paidOn: string | null;
  bookingsCount: number;
}

export interface Message {
  id: number;
  customerName: string;
  subject: string;
  preview: string;
  body: string;
  date: string;
  unread: boolean;
  status: "new" | "in_progress" | "answered";
}

export interface DashboardStats {
  totalBookingsThisMonth: number;
  bookingsChangePct: number;
  revenueThisMonth: number;
  revenueChangePct: number;
  avgRating: number;
  reviewCount: number;
  activeExperiences: number;
  pendingMessages: number;
}
