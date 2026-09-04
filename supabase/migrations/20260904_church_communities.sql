-- =========================================================================
-- GAZIE COMMUTE: CHURCH COMMUNITIES & CELL GROUPS MIGRATION
-- Migration Date: 2026-09-04
-- =========================================================================

-- Enable UUID generation if not already active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CHURCHES TABLE
CREATE TABLE IF NOT EXISTS public.churches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  denomination TEXT,
  address TEXT,
  landmark TEXT,
  city TEXT DEFAULT 'Abuja',
  state TEXT DEFAULT 'FCT',
  logo_url TEXT,
  icon TEXT DEFAULT '⛪',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. CHURCH ZONES TABLE
CREATE TABLE IF NOT EXISTS public.church_zones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  area TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. CHURCH CELLS / HOME FELLOWSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.church_cells (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  zone_id UUID REFERENCES public.church_zones(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  meeting_day TEXT DEFAULT 'Wednesday',
  meeting_time TEXT DEFAULT '18:00',
  leader_name TEXT,
  leader_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. CHURCH ADDITION REQUESTS TABLE (When a commuter requests an unlisted church)
CREATE TABLE IF NOT EXISTS public.church_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  church_name TEXT NOT NULL,
  denomination TEXT,
  address TEXT,
  city TEXT DEFAULT 'Abuja',
  leader_contact TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. EXTEND PROFILES TABLE WITH COMMUNITY & CHURCH FIELDS
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS community_type TEXT DEFAULT 'estate';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS church_zone_id UUID REFERENCES public.church_zones(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS church_cell_id UUID REFERENCES public.church_cells(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS community_verification_status TEXT DEFAULT 'unverified';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS community_role TEXT DEFAULT 'member';

-- Add constraints if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_community_type_check'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_community_type_check 
    CHECK (community_type IN ('estate', 'church', 'workplace', 'school', 'association', 'other'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_community_verification_check'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_community_verification_check 
    CHECK (community_verification_status IN ('unverified', 'pending', 'community_verified', 'admin_verified'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_community_role_check'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_community_role_check 
    CHECK (community_role IN ('member', 'cell_leader', 'zone_leader', 'church_admin'));
  END IF;
END $$;

-- 6. EXTEND RIDE POSTINGS TABLE FOR PURPOSE-DRIVEN CHURCH CARPOOLS
ALTER TABLE public.ride_postings ADD COLUMN IF NOT EXISTS ride_purpose TEXT DEFAULT 'work_commute';
ALTER TABLE public.ride_postings ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) ON DELETE SET NULL;
ALTER TABLE public.ride_postings ADD COLUMN IF NOT EXISTS church_zone_id UUID REFERENCES public.church_zones(id) ON DELETE SET NULL;
ALTER TABLE public.ride_postings ADD COLUMN IF NOT EXISTS church_cell_id UUID REFERENCES public.church_cells(id) ON DELETE SET NULL;
ALTER TABLE public.ride_postings ADD COLUMN IF NOT EXISTS service_event_name TEXT;
ALTER TABLE public.ride_postings ADD COLUMN IF NOT EXISTS notes TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ride_postings_purpose_check'
  ) THEN
    ALTER TABLE public.ride_postings ADD CONSTRAINT ride_postings_purpose_check 
    CHECK (ride_purpose IN ('work_commute', 'sunday_service', 'midweek_service', 'cell_meeting', 'church_event', 'other'));
  END IF;
END $$;

-- 7. EXTEND BOOKINGS TABLE FOR CHURCH RIDES
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS ride_purpose TEXT DEFAULT 'work_commute';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) ON DELETE SET NULL;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS church_cell_id UUID REFERENCES public.church_cells(id) ON DELETE SET NULL;

-- 8. INDEXES FOR HIGH PERFORMANCE CHURCH SEARCHES
CREATE INDEX IF NOT EXISTS idx_churches_slug ON public.churches(slug);
CREATE INDEX IF NOT EXISTS idx_church_zones_church ON public.church_zones(church_id);
CREATE INDEX IF NOT EXISTS idx_church_cells_church ON public.church_cells(church_id);
CREATE INDEX IF NOT EXISTS idx_church_cells_zone ON public.church_cells(zone_id);
CREATE INDEX IF NOT EXISTS idx_profiles_church ON public.profiles(church_id);
CREATE INDEX IF NOT EXISTS idx_profiles_church_cell ON public.profiles(church_cell_id);
CREATE INDEX IF NOT EXISTS idx_profiles_comm_status ON public.profiles(community_verification_status);
CREATE INDEX IF NOT EXISTS idx_ride_postings_purpose ON public.ride_postings(ride_purpose);
CREATE INDEX IF NOT EXISTS idx_ride_postings_church ON public.ride_postings(church_id);

-- 9. ROW LEVEL SECURITY POLICIES

-- Churches RLS
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Churches viewable by authenticated users" ON public.churches;
CREATE POLICY "Churches viewable by authenticated users"
  ON public.churches FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Public can view active churches" ON public.churches;
CREATE POLICY "Public can view active churches"
  ON public.churches FOR SELECT
  TO anon
  USING (status = 'active');

DROP POLICY IF EXISTS "Admins can manage churches" ON public.churches;
CREATE POLICY "Admins can manage churches"
  ON public.churches FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Church Zones RLS
ALTER TABLE public.church_zones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Zones viewable by authenticated users" ON public.church_zones;
CREATE POLICY "Zones viewable by authenticated users"
  ON public.church_zones FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Public can view church zones" ON public.church_zones;
CREATE POLICY "Public can view church zones"
  ON public.church_zones FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Admins can manage church zones" ON public.church_zones;
CREATE POLICY "Admins can manage church zones"
  ON public.church_zones FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Church Cells RLS
ALTER TABLE public.church_cells ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cells viewable by authenticated users" ON public.church_cells;
CREATE POLICY "Cells viewable by authenticated users"
  ON public.church_cells FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Public can view church cells" ON public.church_cells;
CREATE POLICY "Public can view church cells"
  ON public.church_cells FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Cell leaders or admins can update their cells" ON public.church_cells;
CREATE POLICY "Cell leaders or admins can update their cells"
  ON public.church_cells FOR UPDATE
  TO authenticated
  USING (
    leader_user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can insert and delete cells" ON public.church_cells;
CREATE POLICY "Admins can insert and delete cells"
  ON public.church_cells FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Church Requests RLS
ALTER TABLE public.church_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert church requests" ON public.church_requests;
CREATE POLICY "Users can insert church requests"
  ON public.church_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own church requests" ON public.church_requests;
CREATE POLICY "Users can view own church requests"
  ON public.church_requests FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update church requests" ON public.church_requests;
CREATE POLICY "Admins can update church requests"
  ON public.church_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
