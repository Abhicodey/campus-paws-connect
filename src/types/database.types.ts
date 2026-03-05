// Database types matching Supabase schema
// Based on CampusPaws backend specification

export type UserRole = 'student' | 'president' | 'admin';
export type VaccinationStatus = 'unknown' | 'partial' | 'vaccinated';
export type ActionType = 'feed' | 'pet' | 'location_update' | 'detail_update' | 'health_report';
export type ObservationType = 'injury' | 'limping' | 'skin_issue' | 'aggression' | 'other';
export type Severity = 'mild' | 'moderate' | 'urgent';
export type VaccineType = 'rabies' | 'dhpp' | 'unknown';
export type VaccineSource = 'ngo' | 'vet' | 'observation';
export type ReportStatus = 'pending' | 'reviewed' | 'action_taken' | 'hidden' | 'dismissed';
export type UsernameStatus = 'approved' | 'pending' | 'rejected';
export type RankType = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

// ============================================
// Table Types
// ============================================

export interface User {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    role: UserRole;
    points: number;
    profile_completed: boolean;
    is_active: boolean;
    created_at: string;

    // Username System
    username: string | null;
    username_status: UsernameStatus;
    username_pending: string | null;
    username_requested_at?: string | null;
    username_last_changed?: string | null;
    next_username_change?: string | null;
    previous_username?: string | null;

    // Avatar System
    avatar_status?: 'approved' | 'pending' | 'rejected';
    avatar_pending?: string | null;
    avatar_requested_at?: string | null;
    avatar_updated_at?: string | null;
    previous_avatar_url?: string | null;

    // Safety & Moderation
    is_hidden: boolean;
    is_suspended?: boolean;
    suspended_until?: string | null;
    suspended_reason?: string | null;
    is_super_admin: boolean;
    report_count?: number;
    report_strikes?: number;
    is_timed_out?: boolean;
    timeout_until?: string | null;

    // Personal Info
    birthdate?: string | null;
    birth_month?: number | null;
    birth_day?: number | null;
    birthdate_updated_at?: string | null;
    kindness_points: number;

    // Legacy / Other
    app_role?: string | null;
    is_main_admin?: boolean;
    monthly_points?: number;
}

export interface Dog {
    id: string;
    name: string;
    official_name: string | null;
    temporary_name: string | null;
    name_locked: boolean;
    qr_code: string | null;
    profile_image: string | null;
    description: string | null;
    soft_locations: string[]; // Note: Schema usage might differ (array check?)
    vaccination_status: VaccinationStatus;
    sterilized: boolean | null;
    verified: boolean;
    created_by: string | null;
    status: 'approved' | 'pending' | 'hidden'; // Inferred from policies
    is_active: boolean;
    is_hidden: boolean;
    location_lat: number;
    location_lng: number;
    location_name: string | null;
    created_at: string;
    updated_at?: string;

    // Stats (often joined)
    behaviour_score?: number;
    last_fed_at?: string;
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
    updated_by?: string | null;
}

// Gallery table - separate from gallery_images
export interface Gallery {
    id: string;
    user_id: string; // FK to users (was uploaded_by, standardized to user_id)
    dog_id: string | null; // FK to dogs
    verified: boolean;
    created_at: string;
}

export interface GalleryImage {
    id: string;
    file_path: string; // Actual column name in DB
    user_id: string; // FK to users
    status: 'approved' | 'pending' | 'hidden' | 'rejected';
    is_hidden: boolean;
    created_at: string;
}

export interface DogInteraction {
    id: string;
    dog_id: string;
    user_id: string;
    mood_rating: number; // 1-5
    latitude: number | null;
    longitude: number | null;
    interaction_type: string | null;
    created_at: string;
}

export interface UserReport {
    id: string;
    reported_user: string; // or null if reporting content
    reported_by: string;
    target_type: 'user' | 'image' | 'dog';
    target_id: string;
    reason: string;
    status: ReportStatus;
    created_at: string;
    report_date?: string;
}

export interface ImageReport {
    id: string;
    image_id: string;
    reported_by: string;
    reason?: string;
    created_at: string;
}

// ============================================
// New Tables
// ============================================

export interface Announcement {
    id: string;
    title: string;
    content: string;
    created_by: string | null;
    created_at: string;
    is_active: boolean;
    expires_at: string | null;
}

export interface Badge {
    id: string;
    code: string;
    name: string;
    description: string | null;
    icon: string | null;
}

export interface UserBadge {
    id: string;
    user_id: string;
    badge_id: string;
    created_at?: string; // Often inferred
}

export interface AdminLog {
    id: string;
    admin_id: string | null;
    action: string | null;
    target_table: string | null;
    target_id: string | null;
    created_at: string;
}

export interface UserNotification {
    id: string;
    user_id: string;
    announcement_id: string | null;
    is_read: boolean;
    created_at: string;
    expires_at?: string | null;
}

export interface Guideline {
    id: string;
    title: string;
    content: string;
    icon: string;
    order_index: number;
    is_active: boolean;
    created_at: string;
    created_by?: string | null;
    updated_at?: string | null;
}

export interface DogStats {
    id?: string;
    dog_id?: string;
    total_interactions?: number;
    interactions?: number;
    avg_mood: number | null;
    last_fed_at?: string | null;
    last_fed?: string | null;
    last_petted_at?: string | null;
    avg_lat: number | null;
    avg_lon: number | null;
    needs_feeding?: boolean;
    nature_label?: string;
    nature_type?: "friendly" | "shy" | "care" | "avoid";
}

export interface DogSummary {
    dog_id: string;
    name: string;
    total_interactions: number;
    avg_mood: number | null;
    last_fed_at: string | null;
    last_petted_at: string | null;
    avg_lat: number | null;
    avg_lon: number | null;
    needs_feeding: boolean;
    nature: string;
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
            dog_interactions: {
                Row: DogInteraction;
                Insert: Omit<DogInteraction, 'id' | 'created_at'>;
                Update: Partial<Omit<DogInteraction, 'id' | 'created_at'>>;
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
                Row: Gallery;
                Insert: Omit<Gallery, 'id' | 'created_at'>;
                Update: Partial<Omit<Gallery, 'id' | 'created_at'>>;
            };
            gallery_images: {
                Row: GalleryImage;
                Insert: Omit<GalleryImage, 'id' | 'created_at'>;
                Update: Partial<Omit<GalleryImage, 'id' | 'created_at'>>;
            };
            user_reports: {
                Row: UserReport;
                Insert: Omit<UserReport, 'id' | 'created_at'>;
                Update: Partial<Omit<UserReport, 'id' | 'created_at'>>;
            };
            image_reports: {
                Row: ImageReport;
                Insert: Omit<ImageReport, 'id' | 'created_at'>;
                Update: never;
            };
            kindness_actions: {
                Row: {
                    id: string;
                    user_id: string;
                    dog_id: string | null;
                    action_type: string;
                    points: number;
                    created_at: string;
                };
                Insert: Omit<{
                    id: string;
                    user_id: string;
                    dog_id: string | null;
                    action_type: string;
                    points: number;
                    created_at: string;
                }, 'id' | 'created_at'>;
                Update: never;
            };
            announcements: {
                Row: Announcement;
                Insert: Omit<Announcement, 'id' | 'created_at'>;
                Update: Partial<Omit<Announcement, 'id' | 'created_at'>>;
            };
            badges: {
                Row: Badge;
                Insert: Omit<Badge, 'id'>;
                Update: Partial<Omit<Badge, 'id'>>;
            };
            user_badges: {
                Row: UserBadge;
                Insert: Omit<UserBadge, 'id'>;
                Update: never;
            };
            admin_logs: {
                Row: AdminLog;
                Insert: Omit<AdminLog, 'id' | 'created_at'>;
                Update: never;
            };
            user_notifications: {
                Row: UserNotification;
                Insert: Omit<UserNotification, 'id' | 'created_at'>;
                Update: Partial<Omit<UserNotification, 'id' | 'created_at'>>;
            };
            guidelines: {
                Row: Guideline;
                Insert: Omit<Guideline, 'id' | 'created_at'>;
                Update: Partial<Omit<Guideline, 'id' | 'created_at'>>;
            };
            dog_stats: {
                Row: DogStats;
                Insert: never;
                Update: never;
            };
        };
        Views: {
            dog_summary: {
                Row: {
                    dog_id: string;
                    name: string;
                    last_fed_at: string | null;
                    behaviour_score: number;
                };
            };
            monthly_leaderboard: {
                Row: {
                    id: string;
                    username: string | null;
                    avatar_url: string | null;
                    monthly_points: number;
                };
            };
            lifetime_leaderboard: {
                Row: {
                    id: string;
                    username: string | null;
                    avatar_url: string | null;
                    total_points: number;
                };
            };
        };
        Functions: {
            approve_username: {
                Args: {
                    target_user: string;
                };
                Returns: void;
            };
            reject_username: {
                Args: {
                    target_user: string;
                };
                Returns: void;
            };
            add_points: {
                Args: {
                    user_id: string;
                    points_to_add: number;
                };
                Returns: void;
            };
            ensure_public_user: {
                Args: {
                    user_email?: string | null;
                };
                Returns: void;
            };
            reward_dog_approval: {
                Args: {
                    target_user: string;
                };
                Returns: void;
            };
            reward_gallery_approval: {
                Args: {
                    target_user: string;
                };
                Returns: void;
            };
            update_dog_location: {
                Args: {
                    target_dog: string;
                    lat: number;
                    lng: number;
                };
                Returns: void;
            };
            pet_dog: {
                Args: {
                    target_dog: string;
                };
                Returns: void;
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

export function getRank(points: number): { type: RankType; color: string } {
    if (points >= 5000) return { type: 'Diamond', color: '#b9f2ff' };
    if (points >= 2000) return { type: 'Platinum', color: '#e5e4e2' };
    if (points >= 500) return { type: 'Gold', color: '#ffd700' };
    if (points >= 100) return { type: 'Silver', color: '#c0c0c0' };
    return { type: 'Bronze', color: '#cd7f32' };
}
