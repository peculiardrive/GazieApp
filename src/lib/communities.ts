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
