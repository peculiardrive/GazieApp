export type UserRole = 'rider' | 'driver' | 'admin';

export type VerificationStatus = 
  | 'email_verified' 
  | 'pending_review' 
  | 'verified' 
  | 'rejected';

export interface Profile {
  id: string;
  phone?: string;
  full_name: string;
  role: UserRole;
  verification_status: VerificationStatus;
  rejection_reason?: string | null;
  emergency_contact?: string | null;
  preferred_routes?: string[];
  vehicle_make?: string | null;
  vehicle_model?: string | null;
  vehicle_color?: string | null;
  vehicle_plate?: string | null;
  usual_route?: string | null;
  available_time_window?: string | null;
  driver_fare?: number | null;
  rating?: number | null;
  id_url?: string | null;
  proof_of_address_url?: string | null;
  license_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type BookingStatus = 
  | 'requested' 
  | 'pending' 
  | 'matched' 
  | 'confirmed' 
  | 'completed' 
  | 'cancelled' 
  | 'no_show' 
  | 'payment_failed';

export interface Booking {
  id: string;
  rider_id: string;
  driver_id?: string | null;
  ride_posting_id?: string | null;
  pickup: string;
  destination: string;
  requested_date: string;
  requested_time: string;
  status: BookingStatus;
  driver_fare: number;
  platform_fee: number;
  created_at: string;
  updated_at?: string;
}

export interface RidePosting {
  id: string;
  driver_id: string;
  pickup: string;
  destination: string;
  departure_date: string;
  departure_time: string;
  seats_total: number;
  seats_available: number;
  fare_per_seat: number;
  is_recurring: boolean;
  recurring_template_id?: string | null;
  status: 'active' | 'full' | 'completed' | 'cancelled';
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface IncidentReport {
  id: string;
  reporter_id: string;
  description: string;
  photo_url?: string | null;
  created_at: string;
}
