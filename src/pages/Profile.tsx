import { useState } from "react";
import Badge from "@/components/Badge";
import { Dog, Heart, Award, Clock, Bone, LogOut, Loader2, User, Edit3, Check, Cake } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserBadges } from "@/hooks/useUserBadges";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import EditUsernameModal from "@/components/profile/EditUsernameModal";
import EditAvatarModal from "@/components/profile/EditAvatarModal";
import EditBirthdayModal from "@/components/profile/EditBirthdayModal";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useRecentNotifications } from "@/hooks/useRecentNotifications";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/components/ThemeProvider";
import { toast } from "sonner";
import Page from "@/components/layout/Page";
import ResponsiveCard from "@/components/ui/ResponsiveCard";

// Helper for cooldown text
function getCooldownRemaining(date?: string) {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  if (diff <= 0) return null;

  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return `${days} day${days > 1 ? "s" : ""}`;
}

const Profile = () => {
  const navigate = useNavigate();

  /* -------------------- ALL HOOKS AT TOP LEVEL -------------------- */
  const { profile, signOut, authLoading, profileLoading, authUser } = useAuth();
  const { data: profileData } = useUserProfile();
  const { data: userBadges, isLoading: badgesLoading } = useUserBadges(authUser?.id);
  const { data: notifications, isLoading: notificationsLoading } = useRecentNotifications();

  // New state for Edit Modals
  const [usernameModalOpen, setUsernameModalOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [birthdayModalOpen, setBirthdayModalOpen] = useState(false);

  // Inline Birthday State
  const [birthdate, setBirthdate] = useState<string>(profile?.birthdate || "");
  const { theme, setTheme } = useTheme();

  // Sync state with profile
  if (profile?.birthdate && birthdate === "") {
    setBirthdate(profile.birthdate);
  }

  const saveBirthdate = async () => {
    if (!birthdate) return;

    // Cooldown check
    const lastUpdate = profile?.birthdate_updated_at ? new Date(profile.birthdate_updated_at) : null;
    const daysSinceUpdate = lastUpdate ? (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24) : 999;

    if (profile?.birthdate && daysSinceUpdate < 7) {
      toast.error(`Cooldown active. Try again in ${Math.ceil(7 - daysSinceUpdate)} days.`);
      return;
    }

    const { error } = await supabase
      .from("users")
      .update({
        birthdate,
        // Trigger handles birthdate_updated_at
      })
      .eq("id", authUser?.id);

    if (!error) {
      toast.success("Birthdate updated 🎉");
      // Optional: Refresh profile logic here if needed, but context listener might pick it up
    } else {
      toast.error(error.message);
    }
  };

  // ... guards ...

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <p className="text-muted-foreground mb-4">Unable to load profile</p>
        <button
          onClick={() => navigate("/login")}
          className="bg-brand text-white px-6 py-3 rounded-xl font-medium"
        >
          Sign In
        </button>
      </div>
    );
  }

  /* -------------------- DERIVED DATA -------------------- */
  const displayUser = profileData?.user || profile;
  const isOwnProfile = true; // This page is always the current user's profile for now
  const rank = profileData?.rank || 0;

  // Convert database badges to display format
  const badges = (userBadges || []).map(badge => ({
    icon: badge.icon || "🏆",
    label: badge.name,
    earned: true, // All fetched badges are earned
  }));

  const isAdmin = displayUser.role === 'president' || displayUser.role === 'admin';
  const roleLabel = displayUser.role === 'president'
    ? '🛡️ Campus Welfare President'
    : displayUser.role === 'admin'
      ? '👑 Verified Admin'
      : null;

  /* -------------------- UI -------------------- */
  return (
    <Page>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {/* Header & Main Info - Column 1 */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-brand pt-8 pb-16 px-6 h-40 rounded-3xl relative z-0 shadow-lg">
            <div className="flex justify-between items-start">
              <div className="relative z-10 flex items-center gap-4">

                {/* Clickable Avatar */}
                <div
                  className={`relative group ${profileData ? '' : 'cursor-pointer'} w-fit`}
                  onClick={() => !profileData && setAvatarModalOpen(true)}
                >
                  <Avatar className="w-20 h-20 border-4 border-background/20 shadow-xl">
                    <AvatarImage
                      key={(displayUser as any).avatar_updated_at || 'avatar'}
                      src={(() => {
                        if (!displayUser.avatar_url) return undefined;
                        const separator = displayUser.avatar_url.includes('?') ? '&' : '?';
                        return `${displayUser.avatar_url}${separator}t=${(displayUser as any).avatar_updated_at || Date.now()}`;
                      })()}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-white/20 text-white text-2xl backdrop-blur-md">
                      {displayUser.username?.[0]?.toUpperCase() || <User className="w-8 h-8" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Edit3 className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div>
                  <div
                    className="group cursor-pointer"
                    onClick={() => setUsernameModalOpen(true)}
                  >
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-bold text-white group-hover:text-white/90 transition-colors">
                        @{displayUser.username || 'Campus Pawer'}
                      </h1>
                      {profile?.username_status === 'approved' && (
                        <Check className="w-4 h-4 text-green-300" />
                      )}
                      {profile?.username_status === 'pending' && (
                        <span className="bg-yellow-500/20 text-yellow-200 text-[10px] px-1.5 py-0.5 rounded border border-yellow-500/30">
                          PENDING
                        </span>
                      )}
                    </div>
                    <p className="text-white/60 text-xs mt-0.5 group-hover:text-white/80 transition-colors flex items-center gap-1">
                      Tap to edit <Edit3 className="w-3 h-3 opacity-50" />
                    </p>
                  </div>

                  {roleLabel && (
                    <p className="text-white font-medium text-sm mt-1 bg-white/10 px-2 py-0.5 rounded-lg w-fit backdrop-blur-md border border-white/5">{roleLabel}</p>
                  )}

                  <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="absolute top-0 right-0 p-2 text-white/70 hover:text-white transition-colors bg-white/10 rounded-full backdrop-blur-md hover:bg-white/20"
                    title="Toggle Theme"
                  >
                    {theme === "dark" ? "🌞" : "🌙"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Inline Birthday Section */}
          {isOwnProfile && (
            <div className="px-1 relative z-10 -mt-10">
              <ResponsiveCard className="p-5 shadow-lg border-border/50">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-foreground">
                  <Cake className="w-4 h-4 text-accent" />
                  Birthdate
                  {profile?.birthdate && <span className="text-xs font-normal text-muted-foreground ml-auto">(Saved)</span>}
                </h3>

                <input
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Optional — Used only to send you a birthday wish from CampusPaws 🐾
                </p>

                <button
                  onClick={saveBirthdate}
                  className="mt-4 w-full px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all shadow-sm active:scale-[0.98]"
                >
                  {profile?.birthdate ? "Update Birthdate" : "Save Birthdate"}
                </button>
              </ResponsiveCard>
            </div>
          )}

          {/* Badges */}
          <div className="px-1">
            <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Your Badges
            </h2>
            {badgesLoading ? (
              <div className="flex items-center justify-center p-6">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : badges.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {badges.map((badge, index) => (
                  <Badge key={index} icon={badge.icon} label={badge.label} earned={badge.earned} />
                ))}
              </div>
            ) : (
              <ResponsiveCard className="p-6 text-center text-muted-foreground bg-muted/30 border-dashed">
                <p className="text-sm">No badges yet. Start caring for dogs to earn badges! 🐾</p>
              </ResponsiveCard>
            )}
          </div>

          {/* Actions */}
          <div className="px-1 space-y-3">
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="w-full flex items-center justify-center gap-2 bg-accent text-accent-foreground py-3.5 rounded-xl 
                  font-medium transition-all hover:opacity-90 active:scale-[0.98] shadow-sm hover:shadow-md"
              >
                <Award className="w-5 h-5" />
                President Panel
              </button>
            )}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 bg-destructive/10 hover:bg-destructive/20 text-destructive py-3.5 rounded-xl 
                font-medium transition-all active:scale-[0.98] border border-destructive/20"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats & Activity - Column 2 & 3 */}
        <div className="md:col-span-1 lg:col-span-2 space-y-6">
          {/* Stats Card */}
          <ResponsiveCard className="p-6 bg-gradient-to-br from-card to-accent/5">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-4xl font-bold text-primary tracking-tight">{displayUser.points || 0}</p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Kindness Points</p>
              </div>
              <div className="w-px h-16 bg-border/50" />
              <div className="text-center flex-1">
                {profileLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
                ) : (
                  <p className="text-4xl font-bold text-foreground">#{rank || '-'}</p>
                )}
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Monthly Rank</p>
              </div>
            </div>
          </ResponsiveCard>

          {/* Recent Notifications */}
          <div>
            <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Updates
            </h2>
            {notificationsLoading ? (
              <ResponsiveCard className="p-6 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
              </ResponsiveCard>
            ) : notifications && notifications.length > 0 ? (
              <ResponsiveCard className="p-0 overflow-hidden">
                <div className="divide-y divide-border/50">
                  {notifications.map((n: any) => (
                    <div
                      key={n.id}
                      className="p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <p className="font-medium text-foreground text-sm">{n.title || "Notification"}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap bg-muted px-1.5 py-0.5 rounded">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ResponsiveCard>
            ) : (
              <ResponsiveCard className="p-8 text-center text-muted-foreground bg-muted/30 border-dashed">
                <p className="text-sm">No new notifications. Everything is quiet! 🤫</p>
              </ResponsiveCard>
            )}
          </div>
        </div>

      </div>

      {/* Modals */}
      {usernameModalOpen && authUser && (
        <EditUsernameModal user={authUser} profile={profile} onClose={() => setUsernameModalOpen(false)} />
      )}
      {avatarModalOpen && authUser && (
        <EditAvatarModal user={authUser} profile={profile} onClose={() => setAvatarModalOpen(false)} />
      )}
      {birthdayModalOpen && authUser && (
        <EditBirthdayModal user={authUser} profile={profile} onClose={() => setBirthdayModalOpen(false)} />
      )}
    </Page>
  );
};

export default Profile;
