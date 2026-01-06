// ============================================================================
// Base Types
// ============================================================================

export interface Coordinates {
  longitude: number;
  latitude: number;
}

export interface BirthDate {
  birthday: number;
  birthmonth: number;
  birthyear: number;
}

export interface BirthTime {
  birthhour: number;
  birthminute: number;
}

export interface ZodiacSign {
  name: string;
  symbol: string;
}

// ============================================================================
// Profile
// ============================================================================

export interface Profile {
  id: string;
  user_id?: string; // For Supabase auth
  name: string;
  birthdate: BirthDate;
  birthtime: BirthTime;
  coordinates: number[]; // [longitude, latitude]
  birth_location?: string; // Optional location name
  is_my_profile: boolean;
  created_at: string;
  updated_at?: string;
}

export class ProfileModel implements Profile {
  id: string;
  user_id?: string;
  name: string;
  birthdate: BirthDate;
  birthtime: BirthTime;
  coordinates: number[];
  birth_location?: string;
  is_my_profile: boolean;
  created_at: string;
  updated_at?: string;

  constructor(data: Partial<Profile>) {
    this.id = data.id || `profile-${Date.now()}`;
    this.user_id = data.user_id;
    this.name = data.name || '';
    this.birthdate = data.birthdate || { birthday: 1, birthmonth: 1, birthyear: 2000 };
    this.birthtime = data.birthtime || { birthhour: 12, birthminute: 0 };
    this.coordinates = data.coordinates || [0, 0];
    this.birth_location = data.birth_location;
    this.is_my_profile = data.is_my_profile || false;
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at;
  }

  toJSON(): Profile {
    return {
      id: this.id,
      user_id: this.user_id,
      name: this.name,
      birthdate: this.birthdate,
      birthtime: this.birthtime,
      coordinates: this.coordinates,
      birth_location: this.birth_location,
      is_my_profile: this.is_my_profile,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

// ============================================================================
// Planetary Positions
// ============================================================================

export interface PlanetaryPosition {
  name: string;
  longitude: number;
  latitude: number;
  zodiacSign: string;
  angle: number;
  house?: number;
}

// ============================================================================
// Houses
// ============================================================================

export interface House {
  houseNumber: number;
  angle: number;
  zodiacSign: string;
  planets: Array<{
    name: string;
    sign: string;
    degree: number;
  }>;
}

export interface HousesData {
  Ascendant: number;
  Midheaven: number;
  Houses: House[];
}

// ============================================================================
// Aspects
// ============================================================================

export type AspectType = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';

export interface Aspect {
  planets: [string, string];
  aspect: AspectType;
  exactAngle: number;
  orb?: number;
}

// ============================================================================
// Birth Chart (Geburtshoroskop)
// ============================================================================

export interface BirthChart {
  id: string;
  profile_id: string;
  user_id?: string;

  // Birth data
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  latitude: number;
  longitude: number;

  // Chart data
  planetaryPositions: PlanetaryPosition[];
  houses: HousesData;
  aspects: Aspect[];

  // Metadata
  calculated_at: string;
  updated_at?: string;
}

export class BirthChartModel implements BirthChart {
  id: string;
  profile_id: string;
  user_id?: string;

  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  latitude: number;
  longitude: number;

  planetaryPositions: PlanetaryPosition[];
  houses: HousesData;
  aspects: Aspect[];

  calculated_at: string;
  updated_at?: string;

  constructor(data: Partial<BirthChart>) {
    this.id = data.id || `chart-${Date.now()}`;
    this.profile_id = data.profile_id || '';
    this.user_id = data.user_id;

    this.year = data.year || 2000;
    this.month = data.month || 1;
    this.day = data.day || 1;
    this.hour = data.hour || 12;
    this.minute = data.minute || 0;
    this.latitude = data.latitude || 0;
    this.longitude = data.longitude || 0;

    this.planetaryPositions = data.planetaryPositions || [];
    this.houses = data.houses || { Ascendant: 0, Midheaven: 0, Houses: [] };
    this.aspects = data.aspects || [];

    this.calculated_at = data.calculated_at || new Date().toISOString();
    this.updated_at = data.updated_at;
  }

  toJSON(): BirthChart {
    return {
      id: this.id,
      profile_id: this.profile_id,
      user_id: this.user_id,
      year: this.year,
      month: this.month,
      day: this.day,
      hour: this.hour,
      minute: this.minute,
      latitude: this.latitude,
      longitude: this.longitude,
      planetaryPositions: this.planetaryPositions,
      houses: this.houses,
      aspects: this.aspects,
      calculated_at: this.calculated_at,
      updated_at: this.updated_at,
    };
  }
}

// ============================================================================
// Synastry (Partnerhoroskop)
// ============================================================================

export interface SynastryAspect {
  person1Planet: string;
  person2Planet: string;
  aspect: AspectType;
  exactAngle: number;
  orb: number;
  person1PlanetSign: string;
  person2PlanetSign: string;
  score: number;
  category: 'emotional' | 'romance' | 'communication' | 'stability' | 'growth' | 'other';
  importance: number;
}

export interface CompatibilityScore {
  total: number;
  categories: {
    [key: string]: {
      score: number;
      count: number;
      percentage: number;
    };
  };
  aspectCount: number;
  positiveAspects: number;
  challengingAspects: number;
  rawScores: {
    positive: number;
    negative: number;
    total: number;
  };
}

export interface Synastry {
  id: string;
  user_id?: string;

  // Profiles
  profile1_id: string;
  profile2_id: string;
  profile1_name: string;
  profile2_name: string;

  // Synastry data
  synastryAspects: SynastryAspect[];
  compatibilityScore: CompatibilityScore;

  // AI interpretation (optional)
  interpretation?: string;

  // Metadata
  calculated_at: string;
  updated_at?: string;
}

export class SynastryModel implements Synastry {
  id: string;
  user_id?: string;

  profile1_id: string;
  profile2_id: string;
  profile1_name: string;
  profile2_name: string;

  synastryAspects: SynastryAspect[];
  compatibilityScore: CompatibilityScore;
  interpretation?: string;

  calculated_at: string;
  updated_at?: string;

  constructor(data: Partial<Synastry>) {
    this.id = data.id || `synastry-${Date.now()}`;
    this.user_id = data.user_id;

    this.profile1_id = data.profile1_id || '';
    this.profile2_id = data.profile2_id || '';
    this.profile1_name = data.profile1_name || '';
    this.profile2_name = data.profile2_name || '';

    this.synastryAspects = data.synastryAspects || [];
    this.compatibilityScore = data.compatibilityScore || {
      total: 0,
      categories: {},
      aspectCount: 0,
      positiveAspects: 0,
      challengingAspects: 0,
      rawScores: { positive: 0, negative: 0, total: 0 }
    };
    this.interpretation = data.interpretation;

    this.calculated_at = data.calculated_at || new Date().toISOString();
    this.updated_at = data.updated_at;
  }

  toJSON(): Synastry {
    return {
      id: this.id,
      user_id: this.user_id,
      profile1_id: this.profile1_id,
      profile2_id: this.profile2_id,
      profile1_name: this.profile1_name,
      profile2_name: this.profile2_name,
      synastryAspects: this.synastryAspects,
      compatibilityScore: this.compatibilityScore,
      interpretation: this.interpretation,
      calculated_at: this.calculated_at,
      updated_at: this.updated_at,
    };
  }
}

// ============================================================================
// Daily Transit (Tageshoroskop)
// ============================================================================

export interface TransitAspect {
  transitPlanet: string;
  natalPlanet: string;
  aspect: AspectType;
  exactAngle: number;
  orb: number;
  transitPlanetLongitude: number;
  natalPlanetLongitude: number;
  transitPlanetSign: string;
  natalPlanetSign: string;
}

export interface DailyTransit {
  id: string;
  profile_id: string;
  user_id?: string;

  // Transit date
  transit_date: string; // ISO date string
  transit_year: number;
  transit_month: number;
  transit_day: number;

  // Transit data
  transits: TransitAspect[];

  // Birth chart reference (for natal positions)
  birth_chart_id?: string;

  // AI interpretation (optional)
  interpretation?: string;

  // Metadata
  calculated_at: string;
  expires_at?: string; // Optional: cache expiration for transits
}

export class DailyTransitModel implements DailyTransit {
  id: string;
  profile_id: string;
  user_id?: string;

  transit_date: string;
  transit_year: number;
  transit_month: number;
  transit_day: number;

  transits: TransitAspect[];
  birth_chart_id?: string;
  interpretation?: string;

  calculated_at: string;
  expires_at?: string;

  constructor(data: Partial<DailyTransit>) {
    this.id = data.id || `transit-${Date.now()}`;
    this.profile_id = data.profile_id || '';
    this.user_id = data.user_id;

    const date = data.transit_date ? new Date(data.transit_date) : new Date();
    this.transit_date = date.toISOString().split('T')[0];
    this.transit_year = data.transit_year || date.getFullYear();
    this.transit_month = data.transit_month || date.getMonth() + 1;
    this.transit_day = data.transit_day || date.getDate();

    this.transits = data.transits || [];
    this.birth_chart_id = data.birth_chart_id;
    this.interpretation = data.interpretation;

    this.calculated_at = data.calculated_at || new Date().toISOString();
    this.expires_at = data.expires_at;
  }

  toJSON(): DailyTransit {
    return {
      id: this.id,
      profile_id: this.profile_id,
      user_id: this.user_id,
      transit_date: this.transit_date,
      transit_year: this.transit_year,
      transit_month: this.transit_month,
      transit_day: this.transit_day,
      transits: this.transits,
      birth_chart_id: this.birth_chart_id,
      interpretation: this.interpretation,
      calculated_at: this.calculated_at,
      expires_at: this.expires_at,
    };
  }
}

// ============================================================================
// Supabase Table Definitions (for reference when creating tables)
// ============================================================================

export const SUPABASE_TABLES = {
  profiles: `
    CREATE TABLE profiles (
      id TEXT PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id),
      name TEXT NOT NULL,
      birthdate JSONB NOT NULL,
      birthtime JSONB NOT NULL,
      coordinates REAL[] NOT NULL,
      birth_location TEXT,
      is_my_profile BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE
    );
  `,

  birth_charts: `
    CREATE TABLE birth_charts (
      id TEXT PRIMARY KEY,
      profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
      user_id UUID REFERENCES auth.users(id),
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      day INTEGER NOT NULL,
      hour INTEGER NOT NULL,
      minute INTEGER NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      planetary_positions JSONB NOT NULL,
      houses JSONB NOT NULL,
      aspects JSONB NOT NULL,
      calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE
    );
  `,

  synastries: `
    CREATE TABLE synastries (
      id TEXT PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id),
      profile1_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
      profile2_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
      profile1_name TEXT NOT NULL,
      profile2_name TEXT NOT NULL,
      synastry_aspects JSONB NOT NULL,
      compatibility_score JSONB NOT NULL,
      interpretation TEXT,
      calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE
    );
  `,

  daily_transits: `
    CREATE TABLE daily_transits (
      id TEXT PRIMARY KEY,
      profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
      user_id UUID REFERENCES auth.users(id),
      transit_date DATE NOT NULL,
      transit_year INTEGER NOT NULL,
      transit_month INTEGER NOT NULL,
      transit_day INTEGER NOT NULL,
      transits JSONB NOT NULL,
      birth_chart_id TEXT REFERENCES birth_charts(id),
      interpretation TEXT,
      calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      expires_at TIMESTAMP WITH TIME ZONE
    );
  `
};
