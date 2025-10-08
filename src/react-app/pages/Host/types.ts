export interface Booking {
  id: number;
  car: string;
  customer: string;
  dates: string;
  status: 'confirmed' | 'pending' | string;
  amount: string;
}

export interface StatCard {
  label: string;
  value: string;
  icon: string;
  color?: string;
}

export interface NavLinkItem {
  to: string;
  label: string;
  icon?: string;
}

export interface ProfileData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  language: string;

  // Address
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;

  // Host Information
  hostSince: string;
  responseTime: string;
  responseRate: string;
  bio: string;

  // Business Details
  businessName: string;
  gstNumber: string;
  panNumber: string;
  bankAccount: string;
  ifscCode: string;

  // Preferences
  instantBook: boolean;
  minRentalPeriod: string;
  maxRentalPeriod: string;
  cancellationPolicy: string;

  // Verification Status
  emailVerified: boolean;
  phoneVerified: boolean;
  identityVerified: boolean;
  addressVerified: boolean;
  backgroundCheck: boolean;
}

export interface VehiclePic {
  id: number;
  url: string;
  isCover: boolean;
}

export interface Vehicle {
  id: number;
  distanceUsed: number;
  brand: string;
  model: string;
  year: number;
  fuelType: string;
  transmission: string;
  seats: number;
  status: "available" | "unavailable" | "renting" | "requesting";
  pics: VehiclePic[];
}

export interface VehicleStats {
  total: number;
  available: number;
  rented: number;
  unavailable: number;
}

export interface Transaction {
  id: number;
  date: string;
  booking: string;
  customer: string;
  vehicle?: string;
  amount: number;
  status: "completed" | "pending" | "processing" | "refunded";
  type: "booking" | "payout" | "refund";
}

export interface EarningsStats {
  totalEarnings: number;
  monthlyEarnings: number;
  pendingPayout: number;
  averagePerBooking: number;
  totalBookings: number;
}

export interface PayoutInfo {
  nextPayoutDate: string | null;
  pendingAmount: number;
  payoutMethod: string;
}

export interface EditFormData {
  brand: string;
  model: string;
  year: number;
  distanceUsed: number;
  fuelType: string;
  transmission: string;
  seats: number;
  status: "available" | "unavailable" | "renting" | "requesting";
}