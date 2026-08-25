import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isMock = !supabaseUrl || !supabaseAnonKey;

// Mock database initialization
const initializeMockDb = () => {
  if (typeof window === 'undefined') return;

  const profilesKey = 'gazie_profiles';
  const bookingsKey = 'gazie_bookings';
  const incidentsKey = 'gazie_incidents';
  const authUsersKey = 'gazie_auth_users';
  const postingsKey = 'gazie_ride_postings';
  const templatesKey = 'gazie_recurring_templates';
  const notificationsKey = 'gazie_notifications';

  if (!localStorage.getItem(profilesKey)) {
    const demoProfiles = [
      {
        id: 'admin-uuid-1111',
        phone: '09011111111',
        full_name: 'Admin Gazie',
        role: 'admin',
        verification_status: 'verified',
        preferred_routes: [],
        created_at: new Date().toISOString(),
      },
      {
        id: 'admin-uuid-peculiar',
        phone: '07036639658',
        full_name: 'Peculiar Admin',
        role: 'admin',
        verification_status: 'verified',
        preferred_routes: [],
        created_at: new Date().toISOString(),
      },
      {
        id: 'rider-uuid-2222',
        phone: '09022222222',
        full_name: 'Obinna Rider',
        role: 'rider',
        verification_status: 'verified',
        emergency_contact: '08099998888',
        preferred_routes: ["Lugbe Junction to Secretariat, Garki", "Lugbe Federal Housing to Wuse"],
        id_url: 'id-url-placeholder',
        proof_of_address_url: 'address-url-placeholder',
        created_at: new Date().toISOString(),
      },
      {
        id: 'rider-uuid-4444',
        phone: '09044444444',
        full_name: 'Amina Pending',
        role: 'rider',
        verification_status: 'pending_review',
        emergency_contact: '08077776666',
        preferred_routes: [],
        id_url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        proof_of_address_url: 'address-url-placeholder',
        created_at: new Date().toISOString(),
      },
      {
        id: 'driver-uuid-3333',
        phone: '09033333333',
        full_name: 'Bello Driver',
        role: 'driver',
        verification_status: 'verified',
        vehicle_make: 'Toyota',
        vehicle_model: 'Corolla',
        vehicle_color: 'Yellow',
        vehicle_plate: 'ABJ-123-XY',
        usual_route: 'Lugbe Federal Housing to Secretariat, Garki',
        available_time_window: '07:00 AM - 08:30 AM',
        driver_fare: 1200,
        rating: 4.8,
        id_url: 'id-url-placeholder',
        proof_of_address_url: 'address-url-placeholder',
        license_url: 'license-url-placeholder',
        preferred_routes: [],
        created_at: new Date().toISOString(),
      },
      {
        id: 'driver-uuid-5555',
        phone: '09055555555',
        full_name: 'Chinedu Driver',
        role: 'driver',
        verification_status: 'pending_review',
        vehicle_make: 'Volkswagen',
        vehicle_model: 'Golf 4',
        vehicle_color: 'Black',
        vehicle_plate: 'KJD-888-AB',
        usual_route: 'Lugbe Zone 5 to Wuse Market',
        available_time_window: '07:30 AM - 09:00 AM',
        driver_fare: 1500,
        rating: 5.0,
        id_url: 'id-url-placeholder',
        proof_of_address_url: 'address-url-placeholder',
        license_url: 'license-url-placeholder',
        preferred_routes: [],
        created_at: new Date().toISOString(),
      }
    ];

    const demoAuthUsers = demoProfiles.map(p => ({
      id: p.id,
      phone: p.phone,
      email: p.phone === '07036639658' ? 'gaziecommute@gmail.com' : `${p.phone}@gazie.com`,
      password: p.phone === '07036639658' ? 'N3xtG3N@77%' : 'password123'
    }));

    localStorage.setItem(profilesKey, JSON.stringify(demoProfiles));
    localStorage.setItem(authUsersKey, JSON.stringify(demoAuthUsers));
  }

  if (!localStorage.getItem(bookingsKey)) {
    const demoBookings = [
      {
        id: 'booking-uuid-1',
        rider_id: 'rider-uuid-2222',
        driver_id: null,
        ride_posting_id: null,
        pickup: 'Lugbe Federal Housing',
        destination: 'Secretariat, Garki',
        requested_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        requested_time: '07:30',
        status: 'pending',
        driver_fare: 0,
        platform_fee: 0,
        created_at: new Date().toISOString(),
      },
      {
        id: 'booking-uuid-2',
        rider_id: 'rider-uuid-2222',
        driver_id: 'driver-uuid-3333',
        ride_posting_id: 'posting-uuid-2',
        pickup: 'Lugbe Federal Housing',
        destination: 'Wuse',
        requested_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        requested_time: '08:00',
        status: 'pending',
        driver_fare: 1500,
        platform_fee: 0,
        created_at: new Date(Date.now() - 43200000).toISOString(),
      }
    ];
    localStorage.setItem(bookingsKey, JSON.stringify(demoBookings));
  }

  if (!localStorage.getItem(postingsKey)) {
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const demoPostings = [
      {
        id: 'posting-uuid-1',
        driver_id: 'driver-uuid-3333',
        pickup: 'Lugbe Junction',
        destination: 'Secretariat, Garki',
        departure_date: tomorrowStr,
        departure_time: '07:30',
        seats_total: 4,
        seats_available: 4,
        fare_per_seat: 1200,
        is_recurring: false,
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: 'posting-uuid-2',
        driver_id: 'driver-uuid-3333',
        pickup: 'Lugbe Federal Housing',
        destination: 'Wuse',
        departure_date: tomorrowStr,
        departure_time: '08:00',
        seats_total: 4,
        seats_available: 3,
        fare_per_seat: 1500,
        is_recurring: true,
        recurring_template_id: 'template-uuid-1',
        status: 'active',
        created_at: new Date().toISOString()
      }
    ];
    localStorage.setItem(postingsKey, JSON.stringify(demoPostings));
  }

  if (!localStorage.getItem(templatesKey)) {
    const demoTemplates = [
      {
        id: 'template-uuid-1',
        driver_id: 'driver-uuid-3333',
        pickup: 'Lugbe Federal Housing',
        destination: 'Wuse',
        departure_time: '08:00',
        days_of_week: '1,2,3,4,5',
        fare_per_seat: 1500,
        seats_total: 4,
        active: true,
        created_at: new Date().toISOString()
      }
    ];
    localStorage.setItem(templatesKey, JSON.stringify(demoTemplates));
  }

  if (!localStorage.getItem(notificationsKey)) {
    const demoNotifications = [
      {
        id: 'notif-uuid-1',
        user_id: 'rider-uuid-2222',
        title: 'Welcome to Gazie Commute!',
        message: 'Your Rider account has been verified. You can now browse active rides and schedule commutes.',
        read: false,
        created_at: new Date().toISOString()
      }
    ];
    localStorage.setItem(notificationsKey, JSON.stringify(demoNotifications));
  }

  if (!localStorage.getItem(incidentsKey)) {
    localStorage.setItem(incidentsKey, JSON.stringify([]));
  }
};

let authCallbacks: ((event: string, session: any) => void)[] = [];
const triggerAuthStateChange = (event: string, session: any) => {
  authCallbacks.forEach(cb => cb(event, session));
};

// Mock Query Builder
class MockBuilder {
  private table: string;
  private queryType: 'select' | 'insert' | 'update' | 'delete' | null = null;
  private payload: any = null;
  private filters: { col: string; val: any }[] = [];

  constructor(table: string) {
    this.table = table;
    initializeMockDb();
  }

  select(fields?: string) {
    this.queryType = 'select';
    return this;
  }

  insert(data: any) {
    this.queryType = 'insert';
    this.payload = data;
    return this;
  }

  update(data: any) {
    this.queryType = 'update';
    this.payload = data;
    return this;
  }

  delete() {
    this.queryType = 'delete';
    return this;
  }

  eq(col: string, val: any) {
    this.filters.push({ col, val });
    return this;
  }

  async execute() {
    if (typeof window === 'undefined') return { data: [], error: null };
    
    const key = `gazie_${this.table}`;
    let data = JSON.parse(localStorage.getItem(key) || '[]');

    if (this.queryType === 'select') {
      let filtered = [...data];
      this.filters.forEach(f => {
        filtered = filtered.filter(row => row[f.col] === f.val);
      });
      return { data: filtered, error: null };
    }

    if (this.queryType === 'insert') {
      const records = Array.isArray(this.payload) ? this.payload : [this.payload];
      const newRecords = records.map(r => {
        const id = r.id || crypto.randomUUID();
        return {
          id,
          created_at: new Date().toISOString(),
          ...r
        };
      });
      data.push(...newRecords);
      localStorage.setItem(key, JSON.stringify(data));

      // If we are inserting into profiles, also sync to auth users
      if (this.table === 'profiles') {
        const authUsers = JSON.parse(localStorage.getItem('gazie_auth_users') || '[]');
        newRecords.forEach(r => {
          if (!authUsers.some((u: any) => u.id === r.id)) {
            authUsers.push({
              id: r.id,
              phone: r.phone,
              email: `${r.phone}@gazie.com`,
              password: 'password123'
            });
          }
        });
        localStorage.setItem('gazie_auth_users', JSON.stringify(authUsers));
      }

      return { data: newRecords, error: null };
    }

    if (this.queryType === 'update') {
      let count = 0;
      data = data.map((row: any) => {
        const matches = this.filters.every(f => row[f.col] === f.val);
        if (matches) {
          count++;

          // Special cascade logic if a mock booking status is updated to cancelled
          if (this.table === 'bookings' && this.payload.status === 'cancelled' && (row.status === 'confirmed' || row.status === 'matched') && row.ride_posting_id) {
            const postings = JSON.parse(localStorage.getItem('gazie_ride_postings') || '[]');
            const postingIdx = postings.findIndex((p: any) => p.id === row.ride_posting_id);
            if (postingIdx !== -1) {
              postings[postingIdx].seats_available = postings[postingIdx].seats_available + 1;
              postings[postingIdx].status = 'active';
              localStorage.setItem('gazie_ride_postings', JSON.stringify(postings));
            }
          }

          return { ...row, ...this.payload };
        }
        return row;
      });
      localStorage.setItem(key, JSON.stringify(data));
      return { data: this.payload, error: null };
    }

    if (this.queryType === 'delete') {
      const originalLength = data.length;
      data = data.filter((row: any) => {
        return !this.filters.every(f => row[f.col] === f.val);
      });
      localStorage.setItem(key, JSON.stringify(data));
      return { data: null, error: null };
    }

    return { data: null, error: { message: 'Method not implemented' } };
  }

  // thenable interface for await support
  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return this.execute().then(onfulfilled, onrejected);
  }

  async single() {
    const res = await this.execute();
    return {
      data: res.data && res.data.length > 0 ? res.data[0] : null,
      error: res.data && res.data.length > 0 ? null : { message: 'No record found' }
    };
  }
}

// Mock Supabase client implementation
const mockSupabase = {
  from: (table: string) => new MockBuilder(table),
  
  auth: {
    signUp: async ({ email, phone, password, options }: any) => {
      initializeMockDb();
      const users = JSON.parse(localStorage.getItem('gazie_auth_users') || '[]');
      
      const cleanEmail = email ? email.trim().toLowerCase() : `${phone?.trim()}@gazie.com`;
      const cleanPhone = phone ? phone.trim() : (options?.data?.phone || '');

      if (users.some((u: any) => u.email === cleanEmail)) {
        return { data: { user: null, session: null }, error: { message: 'Email address already registered' } };
      }

      const userId = crypto.randomUUID();
      const newUser = {
        id: userId,
        phone: cleanPhone,
        email: cleanEmail,
      };

      users.push({ ...newUser, password });
      localStorage.setItem('gazie_auth_users', JSON.stringify(users));

      // Create initial blank profile
      const profiles = JSON.parse(localStorage.getItem('gazie_profiles') || '[]');
      const newProfile = {
        id: userId,
        phone: cleanPhone,
        email: cleanEmail,
        full_name: options?.data?.full_name || 'New User',
        role: options?.data?.role || 'rider',
        verification_status: 'pending',
        created_at: new Date().toISOString()
      };
      profiles.push(newProfile);
      localStorage.setItem('gazie_profiles', JSON.stringify(profiles));

      const session = { user: newUser, access_token: 'mock-jwt-token' };
      localStorage.setItem('gazie_session', JSON.stringify(session));
      triggerAuthStateChange('SIGNED_IN', session);

      return { data: { user: newUser, session }, error: null };
    },

    signInWithPassword: async ({ email, phone, password }: any) => {
      initializeMockDb();
      const users = JSON.parse(localStorage.getItem('gazie_auth_users') || '[]');
      
      let user;
      if (email) {
        const cleanEmail = email.trim().toLowerCase();
        user = users.find((u: any) => u.email === cleanEmail && u.password === password);
      } else if (phone) {
        const cleanPhone = phone.trim();
        user = users.find((u: any) => u.phone === cleanPhone && u.password === password);
      }

      if (!user) {
        return { data: { user: null, session: null }, error: { message: 'Invalid credentials' } };
      }

      const cleanUser = { id: user.id, phone: user.phone, email: user.email };
      const session = { user: cleanUser, access_token: 'mock-jwt-token' };
      localStorage.setItem('gazie_session', JSON.stringify(session));
      triggerAuthStateChange('SIGNED_IN', session);

      return { data: { user: cleanUser, session }, error: null };
    },

    signOut: async () => {
      localStorage.removeItem('gazie_session');
      triggerAuthStateChange('SIGNED_OUT', null);
      return { error: null };
    },

    getUser: async () => {
      if (typeof window === 'undefined') return { data: { user: null }, error: null };
      const session = JSON.parse(localStorage.getItem('gazie_session') || 'null');
      return { data: { user: session?.user || null }, error: null };
    },

    getSession: async () => {
      if (typeof window === 'undefined') return { data: { session: null }, error: null };
      const session = JSON.parse(localStorage.getItem('gazie_session') || 'null');
      return { data: { session }, error: null };
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      if (typeof window === 'undefined') {
        return { data: { subscription: { unsubscribe: () => {} } } };
      }
      authCallbacks.push(callback);
      const session = JSON.parse(localStorage.getItem('gazie_session') || 'null');
      callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              authCallbacks = authCallbacks.filter(cb => cb !== callback);
            }
          }
        }
      };
    }
  },

  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: any) => {
        // Return dummy URL
        return { data: { path }, error: null };
      },
      getPublicUrl: (path: string) => {
        return { data: { publicUrl: path } };
      }
    })
  }
};

// Export active client based on config
export const supabase = isMock
  ? (mockSupabase as any)
  : createClient(supabaseUrl, supabaseAnonKey);

// Auto-generate active ride postings from recurring templates
export async function syncRecurringPostings() {
  if (typeof window === 'undefined') return;
  
  if (!isMock) {
    try {
      const tomorrow = new Date(Date.now() + 86400000);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      const dayOfWeek = tomorrow.getDay();
      const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

      const { data: templates } = await supabase
        .from('recurring_templates')
        .select('*')
        .eq('active', true);

      if (templates) {
        for (const t of templates) {
          const isTargetDay = t.days_of_week ? t.days_of_week.includes(String(dayOfWeek)) : isWeekday;
          if (isTargetDay) {
            const { data: existing } = await supabase
              .from('ride_postings')
              .select('id')
              .eq('recurring_template_id', t.id)
              .eq('departure_date', tomorrowStr);

            if (!existing || existing.length === 0) {
              await supabase.from('ride_postings').insert({
                driver_id: t.driver_id,
                pickup: t.pickup,
                destination: t.destination,
                departure_date: tomorrowStr,
                departure_time: t.departure_time,
                seats_total: t.seats_total,
                seats_available: t.seats_total,
                fare_per_seat: t.fare_per_seat,
                is_recurring: true,
                recurring_template_id: t.id,
                status: 'active'
              });
            }
          }
        }
      }
    } catch (err) {
      console.error('Error in syncRecurringPostings:', err);
    }
    return;
  }

  // Mock implementation
  try {
    const tomorrow = new Date(Date.now() + 86400000);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const dayOfWeek = tomorrow.getDay();
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

    const templates = JSON.parse(localStorage.getItem('gazie_recurring_templates') || '[]');
    const postings = JSON.parse(localStorage.getItem('gazie_ride_postings') || '[]');

    let updated = false;
    for (const t of templates) {
      if (!t.active) continue;
      const isTargetDay = t.days_of_week ? t.days_of_week.includes(String(dayOfWeek)) : isWeekday;

      if (isTargetDay) {
        const hasExisting = postings.some(
          (p: any) => p.recurring_template_id === t.id && p.departure_date === tomorrowStr
        );

        if (!hasExisting) {
          postings.push({
            id: crypto.randomUUID(),
            driver_id: t.driver_id,
            pickup: t.pickup,
            destination: t.destination,
            departure_date: tomorrowStr,
            departure_time: t.departure_time,
            seats_total: t.seats_total,
            seats_available: t.seats_total,
            fare_per_seat: t.fare_per_seat,
            is_recurring: true,
            recurring_template_id: t.id,
            status: 'active',
            created_at: new Date().toISOString()
          });
          updated = true;
        }
      }
    }

    if (updated) {
      localStorage.setItem('gazie_ride_postings', JSON.stringify(postings));
    }
  } catch (err) {
    console.error('Error in mock syncRecurringPostings:', err);
  }
}

/**
 * Discrete function to handle atomic matching confirmation.
 * This is designed as a standalone wrapper to easily accommodate future payment integration,
 * allowing inserting a 'payment_pending' verification step before marking a match 'confirmed'.
 */
export const confirmMatch = async (riderId: string, postingId: string) => {
  if (!isMock) {
    const { data, error } = await supabase.rpc('confirm_ride_booking', {
      p_rider_id: riderId,
      p_posting_id: postingId
    });
    if (error) return { data: null, error };
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    if (parsed && !parsed.success) {
      return { data: null, error: { message: parsed.message } };
    }
    return { data: parsed, error: null };
  }

  if (typeof window === 'undefined') return { data: null, error: null };

  const postingsKey = 'gazie_ride_postings';
  const bookingsKey = 'gazie_bookings';
  const notificationsKey = 'gazie_notifications';
  const profilesKey = 'gazie_profiles';

  let postings = JSON.parse(localStorage.getItem(postingsKey) || '[]');
  let bookings = JSON.parse(localStorage.getItem(bookingsKey) || '[]');
  let notifications = JSON.parse(localStorage.getItem(notificationsKey) || '[]');
  let profiles = JSON.parse(localStorage.getItem(profilesKey) || '[]');

  const postingIndex = postings.findIndex((p: any) => p.id === postingId);
  if (postingIndex === -1) {
    return { data: null, error: { message: 'Ride posting not found.' } };
  }

  const posting = postings[postingIndex];

  if (posting.seats_available <= 0) {
    return { data: null, error: { message: 'This ride just filled up — here are similar options' } };
  }

  posting.seats_available -= 1;
  if (posting.seats_available === 0) {
    posting.status = 'full';
  }
  postings[postingIndex] = posting;

  const bookingId = crypto.randomUUID();
  const newBooking = {
    id: bookingId,
    rider_id: riderId,
    driver_id: posting.driver_id,
    ride_posting_id: posting.id,
    pickup: posting.pickup,
    destination: posting.destination,
    requested_date: posting.departure_date,
    requested_time: posting.departure_time,
    status: 'confirmed', // intentional status for future payment integration step in between
    driver_fare: posting.fare_per_seat,
    platform_fee: 0,
    created_at: new Date().toISOString()
  };
  bookings.push(newBooking);

  const riderNotif = {
    id: crypto.randomUUID(),
    user_id: riderId,
    title: 'Ride Match Confirmed!',
    message: `Your ride match from ${posting.pickup} to ${posting.destination} has been confirmed successfully.`,
    read: false,
    created_at: new Date().toISOString()
  };
  const driverNotif = {
    id: crypto.randomUUID(),
    user_id: posting.driver_id,
    title: 'New Passenger Joined',
    message: `A rider has joined your posted commute from ${posting.pickup} to ${posting.destination}.`,
    read: false,
    created_at: new Date().toISOString()
  };
  notifications.push(riderNotif, driverNotif);

  localStorage.setItem(postingsKey, JSON.stringify(postings));
  localStorage.setItem(bookingsKey, JSON.stringify(bookings));
  localStorage.setItem(notificationsKey, JSON.stringify(notifications));

  const rider = profiles.find((p: any) => p.id === riderId);
  const driver = profiles.find((p: any) => p.id === posting.driver_id);

  return {
    data: {
      success: true,
      booking_id: bookingId,
      rider_name: rider?.full_name || 'Rider',
      driver_name: driver?.full_name || 'Driver',
      driver_phone: driver?.phone || '',
      vehicle_info: driver ? `${driver.vehicle_make} ${driver.vehicle_model} [${driver.vehicle_plate}]` : ''
    },
    error: null
  };
};
