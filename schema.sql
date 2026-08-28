-- Enable UUID generation extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES Table (stores user records for riders, drivers, and admins)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  phone TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('rider', 'driver', 'admin')) NOT NULL,
  verification_status TEXT DEFAULT 'pending_email' CHECK (verification_status IN ('pending_email', 'email_verified', 'pending_review', 'rejected', 'verified')),
  
  -- Rider Specific
  emergency_contact TEXT,
  
  -- Commuter Documents & Verification
  id_url TEXT, -- URL of government ID/NIN
  proof_of_address_url TEXT, -- URL of proof of address utility bill
  license_url TEXT, -- URL of driver's license (drivers only)
  rejection_reason TEXT, -- Explanation of reject status
  
  -- Driver & Vehicle Specific
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_color TEXT,
  vehicle_plate TEXT,
  usual_route TEXT,
  available_time_window TEXT,
  driver_fare NUMERIC DEFAULT 0,
  rating NUMERIC DEFAULT 5.0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop any previously overloaded versions of is_admin to eliminate ambiguity
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(text) CASCADE;
DROP FUNCTION IF EXISTS public.current_user_is_admin() CASCADE;

-- Unambiguous helper function to check if the current user is an admin without RLS recursion
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by anyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by anyone" 
  ON public.profiles FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users and admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow user signup or admin insert" ON public.profiles;
CREATE POLICY "Users and admins can insert profiles" 
  ON public.profiles FOR INSERT 
  WITH CHECK (
    auth.uid() = id OR
    auth.uid() IS NULL OR
    public.current_user_is_admin()
  );

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users and admins can update profiles" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (
    auth.uid() = id OR 
    public.current_user_is_admin()
  )
  WITH CHECK (
    auth.uid() = id OR 
    public.current_user_is_admin()
  );

DROP POLICY IF EXISTS "Admins can delete any profile" ON public.profiles;
CREATE POLICY "Admins can delete any profile" 
  ON public.profiles FOR DELETE 
  USING (
    public.current_user_is_admin()
  );

-- Trigger to automatically create a profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, full_name, role, verification_status)
  VALUES (
    new.id,
    COALESCE(new.phone, ''),
    COALESCE(new.raw_user_meta_data->>'full_name', 'New Commuter'),
    COALESCE(new.raw_user_meta_data->>'role', 'rider'),
    'pending_email'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. BOOKINGS Table (stores ride requests and matched trips)
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  rider_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Nullable until matched
  pickup TEXT NOT NULL,
  destination TEXT NOT NULL,
  requested_date DATE NOT NULL, -- Date of commute (next-day)
  requested_time TIME NOT NULL, -- Time of commute (next-day)
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'confirmed', 'completed', 'cancelled')),
  driver_fare NUMERIC NOT NULL DEFAULT 0, -- Set by driver
  platform_fee NUMERIC DEFAULT 0, -- Placeholder for v2
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Bookings Policies
CREATE POLICY "Users can view bookings they are part of" 
  ON public.bookings FOR SELECT 
  TO authenticated 
  USING (
    auth.uid() = rider_id OR 
    auth.uid() = driver_id OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Riders can insert bookings" 
  ON public.bookings FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = rider_id);

CREATE POLICY "Riders can update their own bookings" 
  ON public.bookings FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = rider_id);

CREATE POLICY "Admins can update any booking" 
  ON public.bookings FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- 3. INCIDENTS Table (stores incident reports filed by users)
CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reported_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  incident_type TEXT DEFAULT 'service_issue' CHECK (incident_type IN ('accident', 'threat', 'medical', 'service_issue')),
  severity TEXT DEFAULT 'level_1' CHECK (severity IN ('level_1', 'level_2', 'level_3')),
  trip_code TEXT,
  current_location TEXT,
  involved_party TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  immediate_action_taken TEXT,
  description TEXT NOT NULL,
  photo_url TEXT, -- Optional incident photo
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'triaged', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS reported_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS incident_type TEXT DEFAULT 'service_issue';
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'level_1';
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS trip_code TEXT;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS current_location TEXT;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS involved_party TEXT;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS immediate_action_taken TEXT;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open';

-- Enable RLS
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Incidents Policies
CREATE POLICY "Users can view their own filed incidents" 
  ON public.incidents FOR SELECT 
  TO authenticated 
  USING (
    auth.uid() = reporter_id OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can insert incidents" 
  ON public.incidents FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = reporter_id);


-- =========================================================================
-- ADDITIONAL SCHEMAS FOR V1 EXTENSIONS
-- =========================================================================

-- Add preferred_routes to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_routes TEXT[] DEFAULT '{}';

-- 4. RIDE POSTINGS Table
CREATE TABLE IF NOT EXISTS public.ride_postings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  driver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  pickup TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_date DATE NOT NULL,
  departure_time TIME NOT NULL,
  seats_total INTEGER NOT NULL CHECK (seats_total > 0),
  seats_available INTEGER NOT NULL CHECK (seats_available >= 0),
  fare_per_seat NUMERIC NOT NULL CHECK (fare_per_seat >= 0),
  is_recurring BOOLEAN DEFAULT FALSE NOT NULL,
  recurring_template_id UUID,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'full', 'cancelled', 'completed')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.ride_postings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public ride postings are viewable by authenticated users"
  ON public.ride_postings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Drivers can insert own ride postings"
  ON public.ride_postings FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = driver_id AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'driver' AND verification_status = 'verified'
    )
  );

CREATE POLICY "Drivers can update own ride postings"
  ON public.ride_postings FOR UPDATE
  TO authenticated
  USING (auth.uid() = driver_id);

CREATE POLICY "Admins can update any ride posting"
  ON public.ride_postings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- 5. RECURRING TEMPLATES Table
CREATE TABLE IF NOT EXISTS public.recurring_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  driver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  pickup TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_time TIME NOT NULL,
  days_of_week TEXT NOT NULL,
  fare_per_seat NUMERIC NOT NULL CHECK (fare_per_seat >= 0),
  seats_total INTEGER NOT NULL CHECK (seats_total > 0),
  active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.recurring_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view own recurring templates"
  ON public.recurring_templates FOR SELECT
  TO authenticated
  USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can insert own recurring templates"
  ON public.recurring_templates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Drivers can update own recurring templates"
  ON public.recurring_templates FOR UPDATE
  TO authenticated
  USING (auth.uid() = driver_id);


-- 6. NOTIFICATIONS Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);


-- Update bookings to add ride_posting_id
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS ride_posting_id UUID REFERENCES public.ride_postings(id) ON DELETE SET NULL;

-- Relax and extend check constraints on bookings status
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_status_check CHECK (status IN ('requested', 'confirmed', 'cancelled', 'completed', 'no_show', 'pending', 'matched'));

-- PostgreSQL transactional function to atomically confirm matches without race conditions
CREATE OR REPLACE FUNCTION public.confirm_ride_booking(
  p_rider_id UUID,
  p_posting_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_posting RECORD;
  v_booking_id UUID;
  v_rider_name TEXT;
  v_driver_name TEXT;
  v_driver_phone TEXT;
  v_vehicle_info TEXT;
BEGIN
  -- Lock the target ride posting row to prevent concurrent race condition overbooking
  SELECT * INTO v_posting 
  FROM public.ride_postings 
  WHERE id = p_posting_id 
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Ride posting not found.');
  END IF;
  
  -- Check seat availability
  IF v_posting.seats_available <= 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'This ride just filled up — here are similar options');
  END IF;
  
  -- Decrement seats available
  UPDATE public.ride_postings
  SET 
    seats_available = seats_available - 1,
    status = CASE WHEN seats_available - 1 = 0 THEN 'full' ELSE 'active' END
  WHERE id = p_posting_id;
  
  -- Create confirmed match booking record (structured to support future payment integration step in between)
  INSERT INTO public.bookings (
    rider_id,
    driver_id,
    ride_posting_id,
    pickup,
    destination,
    requested_date,
    requested_time,
    status,
    driver_fare,
    platform_fee
  ) VALUES (
    p_rider_id,
    v_posting.driver_id,
    p_posting_id,
    v_posting.pickup,
    v_posting.destination,
    v_posting.departure_date,
    v_posting.departure_time,
    'confirmed',
    v_posting.fare_per_seat,
    0
  ) RETURNING id INTO v_booking_id;
  
  -- Trigger alerts notifications
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    read
  ) VALUES (
    p_rider_id,
    'Ride Match Confirmed!',
    'Your ride match from ' || v_posting.pickup || ' to ' || v_posting.destination || ' has been confirmed successfully.',
    FALSE
  );

  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    read
  ) VALUES (
    v_posting.driver_id,
    'New Passenger Joined',
    'A rider has joined your posted commute from ' || v_posting.pickup || ' to ' || v_posting.destination || '.',
    FALSE
  );
  
  SELECT full_name INTO v_rider_name FROM public.profiles WHERE id = p_rider_id;
  SELECT full_name, phone, (vehicle_make || ' ' || vehicle_model || ' [' || vehicle_plate || ']') INTO v_driver_name, v_driver_phone, v_vehicle_info 
  FROM public.profiles WHERE id = v_posting.driver_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'rider_name', v_rider_name,
    'driver_name', v_driver_name,
    'driver_phone', v_driver_phone,
    'vehicle_info', v_vehicle_info
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. PAYMENTS Table (stores log of platform fees payment records)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  reference TEXT NOT NULL UNIQUE,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Select policy for payments (users can view payments on matches they are part of)
CREATE POLICY "Users can view payments for bookings they are part of"
  ON public.payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = payments.booking_id AND (
        bookings.rider_id = auth.uid() OR
        bookings.driver_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
      )
    )
  );

-- Update bookings constraint to accept 'payment_failed'
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_status_check CHECK (status IN ('requested', 'confirmed', 'cancelled', 'completed', 'no_show', 'pending', 'matched', 'payment_failed'));


-- =========================================================================
-- 8. PERFORMANCE INDEXES (Optimized for High-Volume Production Queries)
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_bookings_rider_id ON public.bookings(rider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_driver_id ON public.bookings(driver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_requested_date ON public.bookings(requested_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

CREATE INDEX IF NOT EXISTS idx_ride_postings_driver_id ON public.ride_postings(driver_id);
CREATE INDEX IF NOT EXISTS idx_ride_postings_date_status ON public.ride_postings(departure_date, status);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON public.profiles(role, verification_status);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);


-- =========================================================================
-- 9. SUPABASE STORAGE SETUP (verification-docs bucket for KYC)
-- =========================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-docs', 'verification-docs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload documents into their own folder
CREATE POLICY "Authenticated commuters can upload verification docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verification-docs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update/upsert their own documents
CREATE POLICY "Authenticated commuters can update their own verification docs"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'verification-docs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public / authenticated viewing of verification documents
CREATE POLICY "Verification docs are accessible to commuters and admins"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'verification-docs');


-- =========================================================================
-- 10. RATINGS & REVIEWS SYSTEM
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reviewee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  score INTEGER CHECK (score >= 1 AND score <= 5) NOT NULL,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_trip_rating UNIQUE (booking_id, reviewer_id)
);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ratings viewable by authenticated users"
  ON public.ratings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create rating for completed trip"
  ON public.ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

CREATE INDEX IF NOT EXISTS idx_ratings_reviewee_id ON public.ratings(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_ratings_reviewer_id ON public.ratings(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_ratings_booking_id ON public.ratings(booking_id);


