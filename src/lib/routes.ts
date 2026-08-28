/**
 * Standard Abuja Route Hubs & Dynamic Learning Utility
 * Provides curated typical Abuja destinations, popular Lugbe commute routes,
 * and dynamic memory aggregation so newly entered user routes are saved and suggested.
 */

export const STANDARD_ABUJA_DESTINATIONS = [
  'Berger',
  'Federal Secretariat',
  'Wuse II',
  'Area 1',
  'Area 10',
  'Area 11',
  'Gudu',
  'Banex Plaza',
  'Airport / Airport Road',
  'Dunamis (Glory Dome)',
  'Central Business District (CBD)',
  'Maitama',
  'Jabi',
  'Garki',
  'Lugbe Federal Housing',
  'Lugbe Total / Plaza',
  'TradeMore Estate',
  'Apo Legislative Quarters',
  'Utako',
  'Life Camp',
  'Gwarinpa'
] as const;

export const STANDARD_COMMUTE_ROUTES = [
  'Lugbe -> Berger',
  'Lugbe -> Federal Secretariat',
  'Lugbe -> Wuse II',
  'Lugbe -> Banex Plaza',
  'Lugbe -> Area 1',
  'Lugbe -> Area 10',
  'Lugbe -> Area 11',
  'Lugbe -> Gudu',
  'Lugbe -> Airport / Dunamis',
  'Lugbe -> Central Business District (CBD)',
  'Lugbe -> Maitama',
  'Lugbe -> Jabi / Utako'
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
