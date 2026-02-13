// Database types matching Supabase schema
// Based on CampusPaws backend specification

export type UserRole = 'student' | 'president' | 'admin';
export type VaccinationStatus = 'unknown' | 'partial' | 'vaccinated';
export type ActionType = 'feed' | 'pet' | 'location_update' | 'detail_update' | 'health_report';
export type ObservationType = 'injury' | 'limping' | 'skin_issue' | 'aggression' | 'other';
export type Severity = 'mild' | 'moderate' | 'urgent';
export type VaccineType = 'rabies' | 'dhpp' | 'unknown';
export type VaccineSource = 'ngo' | 'vet' | 'observation';
export type ReportStatus = 'pending' | 'reviewed' | 'action_taken';

// ============================================
// Table Types
// ============================================

export interface User {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    username: string | null;
    requested_username: string | null;
    username_verified: boolean;
    role: UserRole;
    points: number;
    is_hidden: boolean;
    is_super_admin: boolean; // Added for User Management Module
    is_active: boolean;
    profile_completed: boolean;
    created_at: string;
    avatar_updated_at: string | null;
    avatar_status?: 'approved' | 'pending' | 'rejected';
    username_status?: 'approved' | 'pending' | 'rejected';
    username_pending?: string | null;
    avatar_pending?: string | null;
    next_username_change?: string | null;
    suspended_until?: string | null;
    suspended_reason?: string | null;
    is_suspended?: boolean;
    birthdate?: string | null;
    birth_month?: number | null;
    birth_day?: number | null;
    birthdate_updated_at?: string | null;
}

export interface Dog {
    id: string;
    name: string; // Deprecated in favor of official_name/temporary_name logic, but kept for types
    temporary_name: string | null;
    official_name: string | null;
    name_locked: boolean;
    qr_code: string | null;
    profile_image: string | null;
    description: string | null;
    soft_locations: string[];
    vaccination_status: VaccinationStatus;
    sterilized: boolean | null;
    verified: boolean;
    created_by: string | null;
    reported_by: string | null; // User who reported (Flow 2)
    registered_by: string | null; // President who registered (Flow 1)
    latitude: number | null;
    longitude: number | null;
    is_active: boolean;
    is_hidden: boolean;
    created_at: string;
}


export interface DogAction {
    id: string;
    dog_id: string;
    user_id: string;
    action_type: ActionType;
    points_given: number;
    notes: string | null;
    created_at: string;
}

export interface HealthLog {
    id: string;
    dog_id: string;
    observed_by: string;
    observation_type: ObservationType;
    severity: Severity;
    description: string | null;
    verified: boolean;
    resolved: boolean;
    created_at: string;
}

export interface VaccinationLog {
    id: string;
    dog_id: string;
    vaccine_type: VaccineType;
    status: 'given' | 'not_given' | 'unknown';
    date_given: string | null;
    source: VaccineSource;
    verified: boolean;
    notes: string | null;
    created_at: string;
}

export interface GalleryImage {
    id: string;
    image_url: string;
    dog_id: string | null;
    uploaded_by: string;
    verified: boolean;
    is_active: boolean;
    is_hidden: boolean; // Added missing field
    created_at: string;
}

export interface UserReport {
    id: string;
    reported_user: string;
    reported_by: string;
    target_type: 'user' | 'image' | 'dog'; // Added missing field
    target_id: string; // Added missing field
    reason: string;
    status: ReportStatus;
    created_at: string;
}

// Module 2: Dog Interactions
export interface DogInteraction {
    id: string;
    dog_id: string;
    user_id: string;
    mood_rating: number | null; // 1-5
    latitude: number | null;
    longitude: number | null;
    interaction_type: 'feeding' | 'petting' | 'location_update';
    created_at: string;
}

// Module 2: Computed View
export interface DogStats {
    id: string; // dog_id
    official_name: string;
    avg_mood: number | null;
    avg_lat: number | null;
    avg_lng: number | null;
    total_interactions: number;
}

// ============================================
// View Types
// ============================================

export interface DogSummary {
    dog_id: string;
    name: string;
    last_fed_at: string | null;
    behaviour_score: number;
}

// ============================================
// Database Schema Type (for Supabase client)
// ============================================

export interface Database {
    public: {
        Tables: {
            users: {
                Row: User;
                Insert: Omit<User, 'created_at'>;
                Update: Partial<Omit<User, 'id' | 'created_at'>>;
            };
            dogs: {
                Row: Dog;
                Insert: Omit<Dog, 'id' | 'created_at'>;
                Update: Partial<Omit<Dog, 'id' | 'created_at'>>;
            };
            dog_actions: {
                Row: DogAction;
                Insert: Omit<DogAction, 'id' | 'created_at' | 'points_given'>;
                Update: never;
            };
            health_logs: {
                Row: HealthLog;
                Insert: Omit<HealthLog, 'id' | 'created_at'>;
                Update: Partial<Omit<HealthLog, 'id' | 'created_at'>>;
            };
            vaccination_logs: {
                Row: VaccinationLog;
                Insert: Omit<VaccinationLog, 'id' | 'created_at'>;
                Update: Partial<Omit<VaccinationLog, 'id' | 'created_at'>>;
            };
            gallery: {
                Row: GalleryImage;
                Insert: Omit<GalleryImage, 'id' | 'created_at'>;
                Update: Partial<Omit<GalleryImage, 'id' | 'created_at'>>;
            };
            user_reports: {
                Row: UserReport;
                Insert: Omit<UserReport, 'id' | 'created_at'>;
                Update: Partial<Omit<UserReport, 'id' | 'created_at'>>;
            };
        };
        Views: {
            dog_summary: {
                Row: DogSummary;
            };
        };
    };
}

// ============================================
// Helper Types for UI
// ============================================

export type FeedingStatus = 'recently_fed' | 'due_soon' | 'needs_feeding';
export type BehaviourLabel = 'generally_friendly' | 'usually_calm' | 'shy_cautious' | 'needs_space';

export function getFeedingStatus(lastFedAt: string | null): FeedingStatus {
    if (!lastFedAt) return 'needs_feeding';

    const lastFed = new Date(lastFedAt);
    const now = new Date();
    const hoursSinceFed = (now.getTime() - lastFed.getTime()) / (1000 * 60 * 60);

    if (hoursSinceFed < 6) return 'recently_fed';
    if (hoursSinceFed < 12) return 'due_soon';
    return 'needs_feeding';
}

export function getBehaviourLabel(score: number): BehaviourLabel {
    if (score >= 5) return 'generally_friendly';
    if (score >= 1) return 'usually_calm';
    if (score >= -2) return 'shy_cautious';
    return 'needs_space';
}

export function getFeedingStatusDisplay(status: FeedingStatus): { label: string; color: string } {
    switch (status) {
        case 'recently_fed':
            return { label: 'Recently fed', color: 'secondary' };
        case 'due_soon':
            return { label: 'Feeding due soon', color: 'accent' };
        case 'needs_feeding':
            return { label: 'Needs feeding', color: 'coral' };
    }
}

export function getBehaviourDisplay(label: BehaviourLabel): { text: string; color: string } {
    switch (label) {
        case 'generally_friendly':
            return { text: 'Generally friendly', color: 'secondary' };
        case 'usually_calm':
            return { text: 'Usually calm', color: 'accent' };
        case 'shy_cautious':
            return { text: 'Shy / cautious', color: 'muted' };
        case 'needs_space':
            return { text: 'Needs space', color: 'coral' };
    }
}
