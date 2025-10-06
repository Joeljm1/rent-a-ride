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
