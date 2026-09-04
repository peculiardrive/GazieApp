import { supabase, isMock } from './supabase';

export type CommunityType = 'estate' | 'church' | 'workplace' | 'school' | 'association' | 'other';
export type CommunityVerificationStatus = 'unverified' | 'pending' | 'community_verified' | 'admin_verified';
export type CommunityRole = 'member' | 'cell_leader' | 'zone_leader' | 'church_admin';

export type RidePurpose = 
  | 'work_commute'
  | 'sunday_service'
  | 'midweek_service'
  | 'cell_meeting'
  | 'church_event'
  | 'other';

export interface Church {
  id: string;
  name: string;
  slug: string;
  denomination?: string;
  address?: string;
  landmark?: string;
  city: string;
  state: string;
  logo_url?: string;
  icon: string;
  status: 'active' | 'pending' | 'suspended';
  created_at?: string;
  service_times?: string[];
}

export type ChurchCommunity = Church;

export interface ChurchZone {
  id: string;
  church_id: string;
  name: string;
  area: string;
  city_area?: string;
  created_at?: string;
}

export interface ChurchCell {
  id: string;
  church_id: string;
  zone_id?: string;
  name: string;
  location: string;
  meeting_address?: string;
  meeting_day?: string;
  meeting_time?: string;
  leader_name?: string;
  leader_user_id?: string;
  created_at?: string;
}

export interface ChurchRequest {
  id: string;
  user_id?: string;
  church_name: string;
  denomination?: string;
  address?: string;
  city: string;
  leader_contact?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at?: string;
}

/**
 * Pre-seeded curated Abuja faith communities & cell hierarchies.
 * Provides instantaneous availability for the pilot even before SQL migration execution.
 */
export const SEED_CHURCHES: Church[] = [
  {
    id: 'ch-summit-bible',
    name: 'The Summit Bible Church',
    slug: 'summit-bible-church',
    denomination: 'Non-Denominational / Evangelical',
    address: 'Kaura District, near Games Village',
    landmark: 'Games Village / Kaura District, Abuja',
    city: 'Abuja',
    state: 'FCT',
    icon: '⛪',
    status: 'active'
  },
  {
    id: 'ch-dunamis',
    name: 'Dunamis International Gospel Centre (Glory Dome)',
    slug: 'dunamis-glory-dome',
    denomination: 'Pentecostal',
    address: 'Lord’s Garden, KM 37 Airport Road',
    landmark: 'Airport Road, Abuja',
    city: 'Abuja',
    state: 'FCT',
    icon: '⛪',
    status: 'active'
  },
  {
    id: 'ch-coza',
    name: 'Commonwealth of Zion Assembly (COZA)',
    slug: 'coza-guzape',
    denomination: 'Evangelical',
    address: 'COZA Hills, Guzape District',
    landmark: 'Guzape Hills, Abuja',
    city: 'Abuja',
    state: 'FCT',
    icon: '⛪',
    status: 'active'
  },
  {
    id: 'ch-living-faith',
    name: 'Living Faith Church (Winners Chapel)',
    slug: 'winners-chapel-durumi',
    denomination: 'Pentecostal / Faith Tabernacle',
    address: 'Durumi / Area 1 District',
    landmark: 'Durumi District, Abuja',
    city: 'Abuja',
    state: 'FCT',
    icon: '⛪',
    status: 'active'
  },
  {
    id: 'ch-hotr',
    name: 'House on the Rock (The Refuge)',
    slug: 'house-on-the-rock-refuge',
    denomination: 'Non-Denominational',
    address: 'Plot 104, Kaura District, opposite Games Village',
    landmark: 'Games Village / City Gate, Abuja',
    city: 'Abuja',
    state: 'FCT',
    icon: '⛪',
    status: 'active'
  },
  {
    id: 'ch-rccg',
    name: 'Redeemed Christian Church of God (RCCG FCT)',
    slug: 'rccg-fct',
    denomination: 'Pentecostal',
    address: 'Central Business District & Parishes',
    landmark: 'Central Area & Regional Parishes',
    city: 'Abuja',
    state: 'FCT',
    icon: '⛪',
    status: 'active'
  },
  {
    id: 'ch-fwc',
    name: 'Family Worship Centre (FWC)',
    slug: 'family-worship-centre-wuye',
    denomination: 'Non-Denominational',
    address: 'Plot 1205, Moshood Abiola Way, Wuye',
    landmark: 'Wuye District, Abuja',
    city: 'Abuja',
    state: 'FCT',
    icon: '⛪',
    status: 'active'
  },
  {
    id: 'ch-catholic',
    name: 'Catholic Archdiocese of Abuja',
    slug: 'catholic-archdiocese-abuja',
    denomination: 'Catholic',
    address: 'Holy Trinity Maitama & Area 3 Pro-Cathedral',
    landmark: 'Maitama / Area 3 / Garki, Abuja',
    city: 'Abuja',
    state: 'FCT',
    icon: '⛪',
    status: 'active'
  }
];

export const SEED_ZONES: ChurchZone[] = [
  // Summit Bible Church Zones
  { id: 'zn-summit-lugbe', church_id: 'ch-summit-bible', name: 'Lugbe / Airport Road Zone', area: 'Lugbe, FHA, Aco, Airport Corridor' },
  { id: 'zn-summit-kaura', church_id: 'ch-summit-bible', name: 'Kaura / Games Village Zone', area: 'Kaura, Games Village, Lokogoma' },
  { id: 'zn-summit-garki', church_id: 'ch-summit-bible', name: 'Garki / Central Zone', area: 'Area 11, Area 1, Garki 2, Apo' },
  { id: 'zn-summit-kubwa', church_id: 'ch-summit-bible', name: 'Kubwa / Gwarinpa Zone', area: 'Kubwa Express, Gwarinpa, Dutse' },

  // Dunamis Zones
  { id: 'zn-dunamis-airport', church_id: 'ch-dunamis', name: 'Airport Road Main Zone', area: 'Lugbe, River Park, Trademore, Glory Dome' },
  { id: 'zn-dunamis-lokogoma', church_id: 'ch-dunamis', name: 'Lokogoma / Galadimawa Zone', area: 'Peace Court, Sun City, Galadimawa' },
  { id: 'zn-dunamis-kubwa', church_id: 'ch-dunamis', name: 'Kubwa / Bwari Zone', area: 'Kubwa Phase 4, Arab Road, Bwari' },

  // Winners Chapel Zones
  { id: 'zn-winners-durumi', church_id: 'ch-living-faith', name: 'Durumi / Area 1 Zone', area: 'Durumi 1, Durumi 2, Area 1' },
  { id: 'zn-winners-lugbe', church_id: 'ch-living-faith', name: 'Lugbe Zonal Centre', area: 'Federal Housing, Sector F, AMAC' },

  // House on the Rock Zones
  { id: 'zn-hotr-kaura', church_id: 'ch-hotr', name: 'Kaura / City Gate Zone', area: 'Games Village, Kaura, Galadimawa' },
  { id: 'zn-hotr-wuse', church_id: 'ch-hotr', name: 'Wuse / Maitama Zone', area: 'Wuse 2, Maitama, Central Area' },

  // COZA Zones
  { id: 'zn-coza-guzape', church_id: 'ch-coza', name: 'Guzape / Asokoro Zone', area: 'Guzape Hills, Asokoro, Area 11' },
  { id: 'zn-coza-apo', church_id: 'ch-coza', name: 'Apo / Gudu Zone', area: 'Apo Resettlement, Legislative Quarters, Gudu' },

  // RCCG Zones
  { id: 'zn-rccg-province1', church_id: 'ch-rccg', name: 'FCT Province 1 (Central / Maitama)', area: 'Central Area, Maitama, Wuse' },
  { id: 'zn-rccg-lugbe', church_id: 'ch-rccg', name: 'FCT Province 4 (Lugbe / Airport)', area: 'Lugbe, FHA, Airport Road' },

  // Family Worship Centre
  { id: 'zn-fwc-wuye', church_id: 'ch-fwc', name: 'Wuye / Utako Zone', area: 'Wuye District, Utako, Jabi' },

  // Catholic Archdiocese
  { id: 'zn-catholic-maitama', church_id: 'ch-catholic', name: 'Maitama Deanery', area: 'Holy Trinity, Maitama, Katampe' },
  { id: 'zn-catholic-garki', church_id: 'ch-catholic', name: 'Garki Deanery', area: 'Our Lady Queen of Nigeria Area 3, Garki 2' }
];

export const SEED_CELLS: ChurchCell[] = [
  // Summit Lugbe Zone Cells
  { id: 'cl-summit-lugbe-fha', church_id: 'ch-summit-bible', zone_id: 'zn-summit-lugbe', name: 'Lugbe FHA Cell', location: 'FHA Lugbe, near Total filling station', leader_name: 'Bro. Emmanuel & Sis. Ruth' },
  { id: 'cl-summit-trademore', church_id: 'ch-summit-bible', zone_id: 'zn-summit-lugbe', name: 'TradeMore Estate Fellowship', location: 'TradeMore Estate Phase 2, Lugbe', leader_name: 'Elder Oche' },
  { id: 'cl-summit-aco', church_id: 'ch-summit-bible', zone_id: 'zn-summit-lugbe', name: 'Aco Estate Cell', location: 'Aco AMAC Estate, Airport Road', leader_name: 'Deacon Paul' },

  // Summit Kaura Zone Cells
  { id: 'cl-summit-games-vill', church_id: 'ch-summit-bible', zone_id: 'zn-summit-kaura', name: 'Games Village Fellowship', location: 'Games Village Main Gate, Kaura', leader_name: 'Bro. David' },
  { id: 'cl-summit-kaura-dist', church_id: 'ch-summit-bible', zone_id: 'zn-summit-kaura', name: 'Kaura District Cell', location: 'Near Kaura Modern Market', leader_name: 'Sis. Grace' },

  // Summit Garki Zone Cells
  { id: 'cl-summit-area11', church_id: 'ch-summit-bible', zone_id: 'zn-summit-garki', name: 'Area 11 Fellowship', location: 'Near Force HQ / Area 11', leader_name: 'Minister Joshua' },
  { id: 'cl-summit-apo-leg', church_id: 'ch-summit-bible', zone_id: 'zn-summit-garki', name: 'Apo Legislative Cell', location: 'Apo Legislative Quarters Zone B', leader_name: 'Bro. Chuka' },

  // Dunamis Cells
  { id: 'cl-dunamis-riverpark', church_id: 'ch-dunamis', zone_id: 'zn-dunamis-airport', name: 'River Park Care Cell', location: 'River Park Estate, Airport Road', leader_name: 'Pastor Samuel' },
  { id: 'cl-dunamis-sector-f', church_id: 'ch-dunamis', zone_id: 'zn-dunamis-airport', name: 'Lugbe Sector F Care Cell', location: 'Sector F Extension, Lugbe', leader_name: 'Deacon Matthew' },
  { id: 'cl-dunamis-suncity', church_id: 'ch-dunamis', zone_id: 'zn-dunamis-lokogoma', name: 'Sun City Home Care', location: 'Sun City Estate Main Park', leader_name: 'Bro. Peter' },

  // Winners Cells
  { id: 'cl-winners-durumi1', church_id: 'ch-living-faith', zone_id: 'zn-winners-durumi', name: 'Durumi Phase 1 Winners Cell', location: 'Durumi Chief Palace Area', leader_name: 'Elder Gabriel' },
  { id: 'cl-winners-fha', church_id: 'ch-living-faith', zone_id: 'zn-winners-lugbe', name: 'Lugbe FHA Winners Cell', location: 'FHA Lugbe Sector 1', leader_name: 'Sis. Joy' },

  // COZA Cells
  { id: 'cl-coza-guzape1', church_id: 'ch-coza', zone_id: 'zn-coza-guzape', name: 'Guzape Valley Fellowship', location: 'Guzape Main Junction', leader_name: 'Bro. Femi' },
  { id: 'cl-coza-apo-res', church_id: 'ch-coza', zone_id: 'zn-coza-apo', name: 'Apo Resettlement Fellowship', location: 'Apo Resettlement Zone E', leader_name: 'Sis. Tolu' },

  // House on the Rock Cells
  { id: 'cl-hotr-games-refuge', church_id: 'ch-hotr', zone_id: 'zn-hotr-kaura', name: 'The Refuge Care Cell', location: 'Games Village / Kaura', leader_name: 'Bro. Michael' },

  // RCCG Cells
  { id: 'cl-rccg-overcomers', church_id: 'ch-rccg', zone_id: 'zn-rccg-lugbe', name: 'RCCG Overcomers House Fellowship', location: 'Lugbe Federal Housing, Road 3', leader_name: 'Elder John' }
];

export const RIDE_PURPOSE_LABELS: Record<RidePurpose, { label: string; icon: string; description: string }> = {
  work_commute: {
    label: 'Daily Work Commute',
    icon: '💼',
    description: 'Regular weekday travel to work, business, or civil service hubs'
  },
  sunday_service: {
    label: 'Sunday Church Service',
    icon: '⛪',
    description: 'Sunday morning services (100% Free platform pass)'
  },
  midweek_service: {
    label: 'Midweek Church Service',
    icon: '📖',
    description: 'Tuesday / Wednesday evening Bible study and prayer communion'
  },
  cell_meeting: {
    label: 'Cell / Home Fellowship',
    icon: '🏡',
    description: 'Neighborhood small group fellowship and house care meetings'
  },
  church_event: {
    label: 'Special Church Program / Convention',
    icon: '✨',
    description: 'Conferences, vigils, crusades, and monthly thanksgiving programs'
  },
  other: {
    label: 'General Community Trip',
    icon: '🚗',
    description: 'Other personal or community trips'
  }
};

/**
 * Resilient fetch functions with automatic database & pre-seeded fallback
 */
export async function getChurches(): Promise<Church[]> {
  try {
    if (!isMock) {
      const { data, error } = await supabase
        .from('churches')
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as Church[];
      }
    }
  } catch (err) {
    console.warn('Error fetching churches from DB, using fallback seed data:', err);
  }
  return SEED_CHURCHES;
}

export async function getChurchBySlug(slug: string): Promise<Church | undefined> {
  try {
    if (!isMock) {
      const { data, error } = await supabase
        .from('churches')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!error && data) {
        return data as Church;
      }
    }
  } catch (err) {
    console.warn('Error fetching church by slug, falling back:', err);
  }
  return SEED_CHURCHES.find(c => c.slug === slug || c.id === slug);
}

export async function getChurchById(id: string): Promise<Church | undefined> {
  try {
    if (!isMock) {
      const { data, error } = await supabase
        .from('churches')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        return data as Church;
      }
    }
  } catch (err) {
    console.warn('Error fetching church by id, falling back:', err);
  }
  return SEED_CHURCHES.find(c => c.id === id);
}

export async function getChurchZones(churchId?: string): Promise<ChurchZone[]> {
  if (!churchId) return [];
  try {
    if (!isMock) {
      const { data, error } = await supabase
        .from('church_zones')
        .select('*')
        .eq('church_id', churchId)
        .order('name', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as ChurchZone[];
      }
    }
  } catch (err) {
    console.warn('Error fetching zones from DB, using fallback:', err);
  }
  return SEED_ZONES.filter(z => z.church_id === churchId);
}

export async function getChurchCells(churchId?: string, zoneId?: string): Promise<ChurchCell[]> {
  if (!churchId) return [];
  try {
    if (!isMock) {
      let query = supabase.from('church_cells').select('*').eq('church_id', churchId);
      if (zoneId) query = query.eq('zone_id', zoneId);
      const { data, error } = await query.order('name', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as ChurchCell[];
      }
    }
  } catch (err) {
    console.warn('Error fetching cells from DB, using fallback:', err);
  }
  return SEED_CELLS.filter(c => {
    if (zoneId) return c.church_id === churchId && c.zone_id === zoneId;
    return c.church_id === churchId;
  });
}

export async function submitChurchRequest(req: {
  userId?: string;
  churchName: string;
  denomination?: string;
  address?: string;
  city?: string;
  leaderContact?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isMock) {
      const { error } = await supabase.from('church_requests').insert({
        user_id: req.userId || null,
        church_name: req.churchName,
        denomination: req.denomination || null,
        address: req.address || null,
        city: req.city || 'Abuja',
        leader_contact: req.leaderContact || null,
        status: 'pending'
      });
      if (error) throw error;
    } else if (typeof window !== 'undefined') {
      const key = 'gazie_church_requests';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push({
        id: 'cr-' + Date.now(),
        ...req,
        status: 'pending',
        created_at: new Date().toISOString()
      });
      localStorage.setItem(key, JSON.stringify(existing));
    }
    return { success: true };
  } catch (err: any) {
    console.error('Error submitting church request:', err);
    return { success: false, error: err?.message || 'Failed to submit request' };
  }
}

// Convenient alias functions for clean UI consumption
export const fetchChurches = getChurches;

export async function fetchChurchZones(churchId?: string): Promise<ChurchZone[]> {
  const zones = await getChurchZones(churchId);
  return zones.map(z => ({ ...z, city_area: z.city_area || z.area }));
}

export async function fetchChurchCells(zoneOrChurchId?: string, optionalZoneId?: string): Promise<ChurchCell[]> {
  if (!zoneOrChurchId && !optionalZoneId) return [];
  if (optionalZoneId) {
    const cells = await getChurchCells(zoneOrChurchId, optionalZoneId);
    return cells.map(c => ({ ...c, meeting_address: c.meeting_address || c.location }));
  }

  // Check if zoneOrChurchId matches any zone_id in SEED_CELLS
  const matchesZone = SEED_CELLS.filter(c => c.zone_id === zoneOrChurchId);
  if (matchesZone.length > 0) {
    try {
      if (!isMock) {
        const { data } = await supabase.from('church_cells').select('*').eq('zone_id', zoneOrChurchId);
        if (data && data.length > 0) {
          return (data as any[]).map((d: any) => ({ ...d, meeting_address: d.location || d.meeting_address })) as ChurchCell[];
        }
      }
    } catch (e) {}
    return matchesZone.map(c => ({ ...c, meeting_address: c.meeting_address || c.location }));
  }

  const cells = await getChurchCells(zoneOrChurchId);
  return cells.map(c => ({ ...c, meeting_address: c.meeting_address || c.location }));
}

