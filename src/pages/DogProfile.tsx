import { useState } from "react";
import { ArrowLeft, MapPin, Clock, Bone, Heart, Navigation, Edit, AlertTriangle, Loader2, Flag } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import StatusTag from "@/components/StatusTag";
import ActionButton from "@/components/ActionButton";
import BottomNav from "@/components/BottomNav";
import { UsernameStatusBanner } from "@/components/UsernameStatusBanner";
import { toast } from "@/hooks/use-toast";
import { useDogProfile } from "@/hooks/useDogProfile";
import { useDogActions } from "@/hooks/useDogActions";
import { useAuth } from "@/contexts/AuthContext";
import { useUsernameStatus } from "@/hooks/useUsernameStatus";
import { useReportContent } from "@/hooks/useReport";
import { useDogStats } from "@/hooks/useDogStats";
import {
  getFeedingStatus,
  getBehaviourLabel,
  getFeedingStatusDisplay,
  getBehaviourDisplay
} from "@/types/database.types";
import { formatDistanceToNow } from "date-fns";

const DogProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const { canParticipate, isPresident, loading: statusLoading } = useUsernameStatus();
  const { data: dogData, isLoading, error } = useDogProfile(id);
  const { data: stats } = useDogStats(id);
  const dogActionsMutation = useDogActions();
  const reportMutation = useReportContent();

  const handleAction = (uiAction: 'feed' | 'pet' | 'location_update', emoji: string, label: string) => {
    if (!authUser) {
      toast({
        title: "Login required",
        description: "Please log in to record your caring action.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!canParticipate) {
      toast({
        title: "Username required",
        description: "Please set up your username to participate.",
        variant: "destructive",
      });
      navigate("/setup-username");
      return;
    }

    if (!id) return;

    // Map UI action to DB interaction type
    let interactionType: 'feeding' | 'petting' | 'location_update';
    switch (uiAction) {
      case 'feed': interactionType = 'feeding'; break;
      case 'pet': interactionType = 'petting'; break;
      case 'location_update': interactionType = 'location_update'; break;
      default: return;
    }

    dogActionsMutation.mutate(
      { dogId: id, actionType: interactionType },
      {
        onSuccess: () => {
          toast({
            title: `Thanks for caring! ${emoji}`,
            description: `+10 kindness points for ${label.toLowerCase()}ing ${dogData?.dog.official_name || dogData?.dog.name}!`,
          });
        },
        onError: (err) => {
          toast({
            title: "Action failed",
            description: err.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading dog profile...</p>
        </div>
      </div>
    );
  }

  if (error || !dogData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Dog Not Found</h2>
        <p className="text-muted-foreground text-center mb-6">
          This dog profile doesn't exist or hasn't been verified yet.
        </p>
        <Link
          to="/dogs"
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium"
        >
          Browse All Dogs
        </Link>
      </div>
    );
  }

  const { dog, summary } = dogData;
  const feedingStatus = getFeedingStatus(summary?.last_fed_at || null);
  const feedingDisplay = getFeedingStatusDisplay(feedingStatus);
  const behaviourLabel = getBehaviourLabel(summary?.behaviour_score || 0);
  const behaviourDisplay = getBehaviourDisplay(behaviourLabel);

  // Map behaviour to status for StatusTag
  const getStatusType = (): "friendly" | "shy" | "care" | "avoid" => {
    switch (behaviourLabel) {
      case 'generally_friendly':
        return 'friendly';
      case 'usually_calm':
        return 'friendly';
      case 'shy_cautious':
        return 'shy';
      case 'needs_space':
        return 'avoid';
      default:
        return 'friendly';
    }
  };

  const lastFedText = summary?.last_fed_at
    ? formatDistanceToNow(new Date(summary.last_fed_at), { addSuffix: true })
    : 'Unknown';

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with image */}
      <div className="relative">
        <img
          src={dog.profile_image || "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800"}
          alt={dog.name}
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <Link
          to="/dogs"
          className="absolute top-4 left-4 p-2 rounded-full bg-card/80 backdrop-blur-sm 
            text-foreground hover:bg-card transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      {/* Content */}
      <div className="px-6 -mt-8 relative">
        <div className="card-elevated p-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{dog.name}</h1>
              <div className="flex items-center gap-1 text-muted-foreground mt-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">
                  Usually seen near: {dog.soft_locations?.[0] || "Campus"}
                </span>
              </div>
            </div>
          </div>

          {/* Status Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            <StatusTag type={getStatusType()} label={behaviourDisplay.text} />
            <StatusTag
              type={feedingStatus === 'recently_fed' ? 'friendly' : feedingStatus === 'due_soon' ? 'shy' : 'care'}
              label={feedingDisplay.label}
            />
          </div>

          {/* Stats from View */}
          {stats && (
            <div className="grid grid-cols-2 gap-4 mt-4 py-4 border-t border-border">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Avg Mood</span>
                <span className="text-lg font-semibold flex items-center gap-1">
                  {stats.avg_mood ? stats.avg_mood.toFixed(1) : '—'} <span className="text-sm">/ 5</span>
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Interactions</span>
                <span className="text-lg font-semibold">
                  {stats.total_interactions || 0}
                </span>
              </div>
            </div>
          )}

          {/* Last Actions */}
          <div className="mt-2 pt-2 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Last fed: {lastFedText}</span>
            </div>
            {dog.vaccination_status !== 'unknown' && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <span className="w-4 h-4 text-center">💉</span>
                <span>Vaccination: {dog.vaccination_status === 'vaccinated' ? 'Vaccinated' : 'Partial'}</span>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground mt-4 italic">
            Based on recent community interactions and observations
          </p>
        </div>

        {/* Username Status Banner */}
        <UsernameStatusBanner className="mt-5" />

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <ActionButton
            icon={<Bone className="w-6 h-6" />}
            label="Feed"
            variant="secondary"
            onClick={() => handleAction("feed", "🦴", "Feed")}
            disabled={dogActionsMutation.isPending}
          />
          <ActionButton
            icon={<Heart className="w-6 h-6" />}
            label="Pet"
            variant="coral"
            onClick={() => handleAction("pet", "🐾", "Pet")}
            disabled={dogActionsMutation.isPending}
          />
          <ActionButton
            icon={<Navigation className="w-6 h-6" />}
            label="Update Location"
            variant="soft"
            onClick={() => handleAction("location_update", "📍", "Update location for")}
            disabled={dogActionsMutation.isPending}
          />

          {authUser && dog.id && (
            <button
              onClick={() => {
                if (!id) return;
                reportMutation.mutate({
                  reported_by: authUser.id,
                  reported_user: dog.created_by || authUser.id,
                  target_type: 'dog',
                  target_id: id,
                  reason: 'Inappropriate or incorrect dog profile',
                });
              }}
              disabled={reportMutation.isPending}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl 
                bg-destructive/10 text-destructive border border-destructive/20
                hover:bg-destructive/20 transition-all disabled:opacity-50"
            >
              <Flag className="w-6 h-6" />
              <span className="text-sm font-medium">
                {reportMutation.isPending ? "Reporting..." : "Report"}
              </span>
            </button>
          )}
        </div>

        {/* Note */}
        <p className="text-center text-xs text-muted-foreground mt-6 px-4">
          Actions are available once every 12 hours to ensure fair caring opportunities for everyone 💚
        </p>
      </div>

      <BottomNav />
    </div>
  );
};

export default DogProfile;
