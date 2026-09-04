/**
 * Gazie Commute - Community Hubs & Faith Communities Registry
 * Provides curated faith-based and affinity communities across Abuja.
 * Strictly optional and non-intrusive.
 */

export interface CommunityHub {
  id: string;
  name: string;
  shortName: string;
  type: 'church' | 'mosque' | 'campus' | 'workplace';
  landmark: string;
  icon: string;
}

export const COMMUNITY_HUBS: CommunityHub[] = [
  {
    id: 'summit_bible_church',
    name: 'The Summit Bible Church',
    shortName: 'Summit Bible Church',
    type: 'church',
    landmark: 'Kaura District / Games Village, Abuja',
    icon: '⛪'
  },
  {
    id: 'dunamis',
    name: 'Dunamis International Gospel Centre (Glory Dome)',
    shortName: 'Dunamis Glory Dome',
    type: 'church',
    landmark: 'Airport Road, Abuja',
    icon: '⛪'
  },
  {
    id: 'coza',
    name: 'Commonwealth of Zion Assembly (COZA)',
    shortName: 'COZA Guzape',
    type: 'church',
    landmark: 'Guzape Hills, Abuja',
    icon: '⛪'
  },
  {
    id: 'hotr',
    name: 'House on the Rock (The Refuge)',
    shortName: 'House on the Rock',
    type: 'church',
    landmark: 'City Gate / Games Village, Abuja',
    icon: '⛪'
  },
  {
    id: 'living_faith',
    name: 'Living Faith Church / Winners Chapel',
    shortName: 'Winners / Durumi',
    type: 'church',
    landmark: 'Durumi / Goshen, Abuja',
    icon: '⛪'
  },
  {
    id: 'rccg',
    name: 'Redeemed Christian Church of God (RCCG FCT)',
    shortName: 'RCCG Parishes',
    type: 'church',
    landmark: 'Central Area & FCT Corridors',
    icon: '⛪'
  },
  {
    id: 'catholic',
    name: 'Catholic Archdiocese of Abuja',
    shortName: 'Catholic (Holy Trinity / St. Mulumba)',
    type: 'church',
    landmark: 'Maitama / Apo / CBD',
    icon: '⛪'
  },
  {
    id: 'fwc',
    name: 'Family Worship Centre (FWC)',
    shortName: 'Family Worship Centre',
    type: 'church',
    landmark: 'Wuye District, Abuja',
    icon: '⛪'
  },
  {
    id: 'national_mosque',
    name: 'National Mosque & Islamic Centres',
    shortName: 'National Mosque',
    type: 'mosque',
    landmark: 'Central Business District, Abuja',
    icon: '🕌'
  },
  {
    id: 'sec',
    name: 'Federal Secretariat & Civil Service',
    shortName: 'Federal Secretariat',
    type: 'workplace',
    landmark: 'Shehu Shagari Way, CBD',
    icon: '🏢'
  }
];

export function getCommunityByName(name?: string | null): CommunityHub | undefined {
  if (!name) return undefined;
  const clean = name.toLowerCase().trim();
  return COMMUNITY_HUBS.find(
    c => c.name.toLowerCase() === clean || c.shortName.toLowerCase() === clean || c.id === clean
  );
}

/**
 * Checks if a string or hub name corresponds to a church, parish, or Christian fellowship.
 */
export function isChurchCommunity(name?: string | null): boolean {
  if (!name) return false;
  const hub = getCommunityByName(name);
  if (hub && hub.type === 'church') return true;

  const clean = name.toLowerCase();
  const churchKeywords = [
    'church', 'dunamis', 'summit', 'coza', 'winners', 'living faith', 
    'rccg', 'redeemed', 'chapel', 'catholic', 'parish', 'refuge', 
    'glory dome', 'worship', 'baptist', 'anglican', 'methodist', 
    'christ embassy', 'house on the rock', 'fellowship', 'cell group'
  ];
  return churchKeywords.some(k => clean.includes(k));
}

/**
 * Checks if a given departure date string (e.g. "2026-09-06") falls on a Sunday.
 */
export function isSundayDate(dateStr?: string | null): boolean {
  if (!dateStr) return false;
  try {
    const parts = dateStr.trim().split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.getDay() === 0;
    }
    const d = new Date(dateStr);
    return !isNaN(d.getTime()) && d.getDay() === 0;
  } catch {
    return false;
  }
}

/**
 * Determines whether a commute is eligible for the 100% Free Sunday Church pass.
 * Free for any commute on a Sunday or associated with church fellowships.
 */
export function isFreeSundayChurchCommute(params: {
  date?: string | null;
  communityName?: string | null;
  pickup?: string | null;
  destination?: string | null;
  riderCommunity?: string | null;
}): boolean {
  // If the ride is scheduled on a Sunday, it's 100% free
  if (isSundayDate(params.date)) {
    return true;
  }

  // Also qualify if community or destination explicitly links to a church hub
  if (
    isChurchCommunity(params.communityName) ||
    isChurchCommunity(params.riderCommunity) ||
    isChurchCommunity(params.pickup) ||
    isChurchCommunity(params.destination)
  ) {
    return true;
  }

  return false;
}

