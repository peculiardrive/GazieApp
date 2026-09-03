/**
 * Standard Abuja Route Hubs & Dynamic Learning Utility
 * Provides curated typical Abuja destinations, multi-corridor commute routes,
 * and dynamic memory aggregation so newly entered user routes are saved and suggested.
 */

export const STANDARD_ABUJA_DESTINATIONS = [
  // Central Business & Commercial Hubs
  'Berger',
  'Federal Secretariat',
  'Central Business District (CBD)',
  'Wuse II',
  'Wuse Market',
  'Banex Plaza',
  'Area 1',
  'Area 10',
  'Area 11',
  'Garki II',
  'Maitama',
  'Asokoro',
  'Gudu',
  'Jabi Lake Mall / Jabi',
  'Utako',
  'Life Camp',

  // Airport Road & Southern Corridor
  'Summit Bible Church (Kaura)',
  'Lugbe Federal Housing',
  'Lugbe Total / Plaza',
  'TradeMore Estate',
  'Airport / Nnamdi Azikiwe Airport',
  'Dunamis (Glory Dome)',
  'Apo Legislative Quarters',
  'Apo Resettlement',
  'Lokogoma / Sunnyvale',
  'Kabusa Junction',

  // Northern & Expressway Corridors
  'Gwarinpa Estate',
  'Dawaki',
  'Dutse Alhaji',
  'Kubwa (PW / Phase 4)',
  'Bwari / Law School',
  'Mpape',
  'Katampe Extension',

  // Eastern & Mararaba Corridors
  'Nyanya',
  'Karu',
  'Mararaba / Masaka',
  'Kugbo',
  'Kurudu / Jikwoyi'
] as const;

export const STANDARD_COMMUTE_ROUTES = [
  // Airport Road / Lugbe Corridor
  'Lugbe -> Berger',
  'Lugbe -> Federal Secretariat',
  'Lugbe -> Wuse II',
  'Lugbe -> Banex Plaza',
  'Lugbe -> Area 1',
  'Lugbe -> Area 10 / Area 11',
  'Lugbe -> Central Business District (CBD)',
  'Lugbe -> Gudu',
  'Lugbe -> Airport / Dunamis',

  // Kubwa / Gwarinpa Corridor
  'Kubwa -> Federal Secretariat',
  'Kubwa -> Berger',
  'Kubwa -> Wuse II / Banex',
  'Kubwa -> CBD',
  'Gwarinpa -> Federal Secretariat',
  'Gwarinpa -> Wuse II',
  'Gwarinpa -> CBD',

  // Apo / Lokogoma Corridor
  'Lokogoma -> Federal Secretariat',
  'Lokogoma -> CBD / Area 11',
  'Apo -> Federal Secretariat',
  'Apo -> Wuse II',
  'Gudu -> Central Business District (CBD)',

  // Nyanya / Mararaba Corridor
  'Nyanya -> Federal Secretariat',
  'Nyanya -> Area 1 / Area 10',
  'Mararaba -> CBD / Secretariat',

  // Inter-city & Campus Hubs
  'Jabi / Utako -> Federal Secretariat',
  'Life Camp -> CBD / Wuse'
] as const;

/**
 * Dynamically aggregate and deduplicate all routes entered by drivers & riders across profiles and postings.
 */
export function getKnownRoutes(postings: any[] = [], profiles: any[] = []): string[] {
  const routesSet = new Set<string>(STANDARD_COMMUTE_ROUTES);

  // 1. Collect from ride postings
  postings.forEach(p => {
    if (p?.pickup && p?.destination) {
      routesSet.add(`${p.pickup} -> ${p.destination}`);
    }
  });

  // 2. Collect from user profiles (usual_route)
  profiles.forEach(u => {
    if (u?.usual_route && typeof u.usual_route === 'string' && u.usual_route.trim()) {
      routesSet.add(u.usual_route.trim());
    }
  });

  return Array.from(routesSet);
}

/**
 * Dynamically aggregate all known destination landmarks and stops.
 */
export function getKnownDestinations(postings: any[] = [], bookings: any[] = []): string[] {
  const destSet = new Set<string>(STANDARD_ABUJA_DESTINATIONS);

  postings.forEach(p => {
    if (p?.pickup) destSet.add(p.pickup.trim());
    if (p?.destination) destSet.add(p.destination.trim());
  });

  bookings.forEach(b => {
    if (b?.pickup) destSet.add(b.pickup.trim());
    if (b?.destination) destSet.add(b.destination.trim());
  });

  return Array.from(destSet);
}
