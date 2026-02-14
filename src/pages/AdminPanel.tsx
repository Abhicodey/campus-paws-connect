import { useState } from "react";
import { ArrowLeft, Check, X, Dog, Image, Flag, User, Loader2, AlertTriangle, Sparkles, RefreshCw, Megaphone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  usePendingDogs,
  usePendingImages,
  usePendingUsernames,
  useUserReports,
  useApproveDog,
  useRejectDog,
  useApproveImage,
  useRejectImage,
  useApproveUsername,
  useRejectUsername,
  useHideUser,
  useDismissReport,
  useMarkActionTaken,
  useRestoreContent,
  useAllUsers,
  useUpdateUserRole,
  useDeleteUser,
} from "@/hooks/useAdmin";

const isDev = import.meta.env.DEV;

// Helper Components
const LoadingState = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-6 h-6 animate-spin text-primary mr-3" />
    <span className="text-muted-foreground">{message}</span>
  </div>
);

const ErrorState = ({ message, detail }: { message: string; detail?: string }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <AlertTriangle className="w-12 h-12 text-destructive mb-3" />
    <p className="font-semibold text-foreground">{message}</p>
    {detail && <p className="text-sm text-muted-foreground mt-1">{detail}</p>}
  </div>
);

const EmptyState = ({ icon, title, message, hint }: { icon: React.ReactNode; title: string; message: string; hint?: string }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="text-muted-foreground mb-3">{icon}</div>
    <p className="font-semibold text-foreground">{title}</p>
    <p className="text-sm text-muted-foreground mt-1">{message}</p>
    {hint && <p className="text-xs text-muted-foreground/60 mt-2 italic">{hint}</p>}
  </div>
);

type TabType = "pending" | "verified" | "naming" | "users";

const AdminPanel = () => {
  const navigate = useNavigate();
  const { profile, isPresident } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [editingDogId, setEditingDogId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [qrCode, setQrCode] = useState("");

  // Queries with error state
  const { data: pendingDogs, isLoading: dogsLoading, error: dogsError, refetch: refetchDogs } = usePendingDogs();
  const { data: pendingImages, isLoading: imagesLoading, error: imagesError, refetch: refetchImages } = usePendingImages();
  const { data: pendingUsernames, isLoading: usernamesLoading, error: usernamesError, refetch: refetchUsernames } = usePendingUsernames();
  const { data: userReports, isLoading: reportsLoading, error: reportsError, refetch: refetchReports } = useUserReports();
  const { data: allUsers, isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useAllUsers(); // Superadmin only

  // Mutations
  const approveDog = useApproveDog();
  const rejectDog = useRejectDog();
  const approveImage = useApproveImage();
  const rejectImage = useRejectImage();
  const approveUsername = useApproveUsername();
  const rejectUsername = useRejectUsername();
  const hideUser = useHideUser();
  const dismissReport = useDismissReport();
  const markActionTaken = useMarkActionTaken();
  const restoreContent = useRestoreContent();
  const updateUserRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();

  const refreshAllData = () => {
    refetchDogs();
    refetchImages();
    refetchUsernames();
    refetchReports();
    if (profile?.is_super_admin) refetchUsers();
    toast({ title: "Refreshed all data" });
  };

  // Handlers


  const handleRejectDog = (id: string) => {
    rejectDog.mutate(id, {
      onSuccess: () => toast({ title: "Profile rejected", description: "The submitter will be notified." }),
      onError: (err) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const handleApproveImage = (id: string) => {
    approveImage.mutate(id, {
      onSuccess: () => toast({ title: "Image approved! ✅", description: "The image is now visible in the gallery." }),
      onError: (err) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const handleRejectImage = (id: string) => {
    rejectImage.mutate(id, {
      onSuccess: () => toast({ title: "Image rejected", description: "The submitter will be notified." }),
      onError: (err) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const handleApproveUsername = async (userId: string, username: string) => {
    try {
      const { error } = await supabase.rpc('approve_username_change', {
        target_user_id: userId
      });

      if (error) throw error;

      toast({ title: "Username approved! ✅", description: "The user can now participate." });
      refetchUsernames();
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleRejectUsername = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('reject_username_change', {
        target_user_id: userId
      });

      if (error) throw error;

      toast({ title: "Username rejected", description: "The user will need to choose another username." });
      refetchUsernames();
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleHideUser = (userId: string, reportId: string) => {
    hideUser.mutate(userId, {
      onSuccess: () => {
        markActionTaken.mutate(reportId);
        toast({ title: "User hidden", description: "The user has been hidden from public view." });
      },
      onError: (err) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const handleDismissReport = (reportId: string) => {
    dismissReport.mutate(reportId, {
      onSuccess: () => toast({ title: "Report dismissed" }),
      onError: (err) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const handleMarkActionTaken = (reportId: string) => {
    markActionTaken.mutate(reportId, {
      onSuccess: () => toast({ title: "Action recorded", description: "Report marked as action taken." }),
      onError: (err) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const handleRestoreContent = (reportId: string, targetType: string, targetId: string) => {
    restoreContent.mutate({ reportId, targetType, targetId }, {
      onSuccess: () => toast({ title: "Content restored ✅", description: "The content is now visible again." }),
      onError: (err) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const handleUpdateRole = (userId: string, newRole: 'student' | 'president' | 'admin') => {
    updateUserRole.mutate({ userId, role: newRole }, {
      onSuccess: () => toast({ title: "Role updated", description: `User is now a ${newRole}.` }),
      onError: (err) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const handleDeleteUser = (userId: string) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    deleteUser.mutate(userId, {
      onSuccess: () => toast({ title: "User deleted", description: "User account has been removed." }),
      onError: (err) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const handleSuspendUser = async (userId: string) => {
    const reason = prompt("Reason for suspension:");
    if (!reason) return;

    const { error } = await supabase
      .from("users")
      .update({
        is_suspended: true,
        suspended_until: null, // Permanent until manually unsuspended
        suspended_reason: reason
      } as any)
      .eq("id", userId);

    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "User Suspended", description: "User has been suspended and cannot access the app." });
      refetchUsers();
    }
  };

  const handleUnsuspendUser = async (userId: string) => {
    if (!confirm("Unsuspend this user?")) return;

    const { error } = await supabase
      .from("users")
      .update({
        is_suspended: false,
        suspended_until: null,
        suspended_reason: null
      } as any)
      .eq("id", userId);

    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "User Unsuspended", description: "User can now access the app again." });
      refetchUsers();
    }
  };

  const tabs: { key: TabType; label: string; icon: React.ReactNode; count: number }[] = [
    { key: "pending", label: "Pending Reports", icon: <AlertTriangle className="w-4 h-4" />, count: pendingDogs?.filter((d: any) => !d.verified).length || 0 },
    { key: "verified", label: "Verified Dogs", icon: <Dog className="w-4 h-4" />, count: pendingDogs?.filter((d: any) => d.qr_code).length || 0 },
    { key: "naming", label: "Needs Naming", icon: <Sparkles className="w-4 h-4" />, count: pendingDogs?.filter((d: any) => !d.official_name).length || 0 },
  ];

  if (profile?.is_super_admin) {
    tabs.push({ key: "users", label: "Manage Users", icon: <User className="w-4 h-4" />, count: allUsers?.length || 0 });
  }

  const totalPending = tabs.reduce((sum, tab) => sum + tab.count, 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary to-primary/80 pt-6 pb-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 rounded-full bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-primary-foreground flex items-center gap-2">
                President Panel
                <Sparkles className="w-4 h-4 opacity-70" />
              </h1>
              <p className="text-primary-foreground/80 text-sm">
                {totalPending > 0 ? `${totalPending} pending approvals` : 'All clear! 🎉'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin/announcements/create')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-foreground text-primary font-medium hover:opacity-90 transition-all"
            >
              <Megaphone className="w-4 h-4" />
              <span className="hidden sm:inline">Announce</span>
            </button>
            <button
              onClick={refreshAllData}
              className="p-2 rounded-full bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* DEV ONLY: Debug Section (Read-Only) */}
      {isDev && (
        <div className="mx-6 mt-4 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-xl border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-yellow-800 dark:text-yellow-200 text-sm flex items-center gap-2">
              🔧 DEV MODE
            </p>
            <span className="text-xs text-yellow-600 dark:text-yellow-400 font-mono">
              {new Date().toLocaleTimeString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <p>Role: <span className="font-bold">{profile?.role}</span></p>
            <p>isPresident: <span className="font-bold">{isPresident ? '✅' : '❌'}</span></p>
            <p>Users: {pendingUsernames?.length ?? '...'}</p>
            <p>Dogs: {pendingDogs?.length ?? '...'}</p>
            <p>Images: {pendingImages?.length ?? '...'}</p>
            <p>Reports: {userReports?.length ?? '...'}</p>
          </div>

          {usernamesError && (
            <p className="text-red-600 text-xs mt-2">❌ Error: {(usernamesError as Error).message}</p>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="px-6 mt-4">
        <div className="card-elevated p-4">
          <div className="grid grid-cols-4 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`text-center p-3 rounded-xl transition-all ${activeTab === tab.key
                  ? 'bg-primary/10 ring-2 ring-primary/20'
                  : 'hover:bg-muted/50'
                  }`}
              >
                <p className={`text-2xl font-bold ${tab.count > 0 ? 'text-coral' : 'text-muted-foreground'}`}>
                  {tab.count}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{tab.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 mt-6">
        <div className="flex gap-1 bg-muted p-1 rounded-xl overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg font-medium 
                transition-all whitespace-nowrap text-sm ${activeTab === tab.key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
                }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-coral text-white animate-pulse">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 mt-6 space-y-3">
        {/* Manage Users Tab (Superadmin) */}
        {activeTab === "users" && (
          usersLoading ? (
            <LoadingState message="Loading all users..." />
          ) : usersError ? (
            <ErrorState message="Unable to load users" detail={(usersError as Error).message} />
          ) : allUsers && allUsers.length > 0 ? (
            <div className="space-y-3">
              {allUsers.map((user, index) => (
                <div key={user.id} className="card-warm p-4 flex items-center justify-between animate-in slide-in-from-bottom-2" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {user.full_name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold">{user.full_name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        @{user.username || 'no_username'} • <span className="uppercase">{user.role}</span>
                        {user.is_super_admin && <span className="text-amber-500 font-bold">SUPER ADMIN</span>}
                      </p>
                    </div>
                  </div>

                  {!user.is_super_admin && (
                    <div className="flex gap-2">
                      {user.role !== 'president' && (
                        <button
                          onClick={() => handleUpdateRole(user.id, 'president')}
                          disabled={updateUserRole.isPending}
                          className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          Make President
                        </button>
                      )}
                      {user.role === 'president' && (
                        <button
                          onClick={() => handleUpdateRole(user.id, 'student')}
                          disabled={updateUserRole.isPending}
                          className="text-xs bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg hover:bg-orange-200 transition-colors"
                        >
                          Demote
                        </button>
                      )}
                      {profile?.is_super_admin && user.id !== profile.id && (
                        user.is_suspended ? (
                          <button
                            onClick={() => handleUnsuspendUser(user.id)}
                            className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors"
                          >
                            Unsuspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSuspendUser(user.id)}
                            className="text-xs bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg hover:bg-orange-200 transition-colors"
                          >
                            Suspend
                          </button>
                        )
                      )}
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={deleteUser.isPending}
                        className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<User className="w-16 h-16" />} title="No users found" message="This is unexpected." />
          )
        )}
        {/* Verified Tab (Dogs with QR Codes - Flow 1) */}
        {activeTab === "verified" && (
          dogsLoading ? (
            <LoadingState message="Loading verified dogs..." />
          ) : dogsError ? (
            <ErrorState
              message="Unable to load verified dogs"
              detail={(dogsError as Error).message}
            />
          ) : pendingDogs && pendingDogs.filter((d: any) => d.qr_code).length > 0 ? (
            <div className="space-y-3">
              {pendingDogs.filter((d: any) => d.qr_code).map((dog, index) => (
                <div
                  key={dog.id}
                  className="card-warm p-4 animate-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex gap-3">
                    <img
                      src={dog.profile_image || "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400"}
                      alt={dog.official_name || dog.name}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-lg flex items-center gap-2">
                        {dog.official_name || dog.name}
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified</span>
                      </h3>
                      <p className="text-sm text-muted-foreground">📍 {dog.soft_locations?.[0] || 'Unknown area'}</p>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">QR: {dog.qr_code}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Dog className="w-16 h-16" />}
              title="No verified dogs yet"
              message="Dogs with QR codes will appear here."
            />
          )
        )}

        {/* Naming Tab (Dogs without Official Names - Flow 3) */}
        {activeTab === "naming" && (
          dogsLoading ? (
            <LoadingState message="Loading dogs needing names..." />
          ) : dogsError ? (
            <ErrorState
              message="Unable to load dogs"
              detail={(dogsError as Error).message}
            />
          ) : pendingDogs && pendingDogs.filter((d: any) => !d.official_name).length > 0 ? (
            <div className="space-y-3">
              {pendingDogs.filter((d: any) => !d.official_name).map((dog, index) => (
                <div
                  key={dog.id}
                  className="card-warm p-4 animate-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex gap-3">
                    <img
                      src={dog.profile_image || "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400"}
                      alt={dog.temporary_name || dog.name}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-lg">
                        {dog.temporary_name || dog.name || "Unnamed"}
                      </h3>
                      <p className="text-sm text-muted-foreground">📍 {dog.soft_locations?.[0] || 'Unknown area'}</p>
                      <p className="text-xs text-amber-600 mt-1">Needs official name</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    {editingDogId === dog.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-background border border-border text-sm"
                          placeholder="Official Name"
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            if (!editName.trim()) return;
                            approveDog.mutate({ dogId: dog.id, name: editName.trim() }, {
                              onSuccess: () => {
                                toast({ title: "Dog named! 🐾", description: `Welcome ${editName}!` });
                                setEditingDogId(null);
                              },
                              onError: (err) => toast({ title: "Failed", description: err.message, variant: "destructive" })
                            });
                          }}
                          disabled={approveDog.isPending}
                          className="px-4 bg-primary text-primary-foreground rounded-xl hover:opacity-90"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingDogId(null)}
                          className="px-3 bg-muted text-muted-foreground rounded-xl"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingDogId(dog.id);
                          setEditName(dog.temporary_name || dog.name || '');
                        }}
                        className="w-full py-2 bg-amber-100 text-amber-700 rounded-xl font-medium hover:bg-amber-200 transition-colors"
                      >
                        <Sparkles className="w-4 h-4 inline mr-2" />
                        Give Official Name
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Sparkles className="w-16 h-16" />}
              title="All dogs have names!"
              message="Dogs needing official names will appear here."
            />
          )
        )}

        {/* Pending Tab (Unverified Dogs - Flow 2 Reports) */}
        {activeTab === "pending" && (
          dogsLoading ? (
            <LoadingState message="Loading pending dogs..." />
          ) : dogsError ? (
            <ErrorState
              message="Unable to load pending dogs"
              detail={(dogsError as Error).message}
            />
          ) : pendingDogs && pendingDogs.filter((d: any) => !d.verified).length > 0 ? (
            <div className="space-y-3">
              {pendingDogs.filter((d: any) => !d.verified).map((dog, index) => (
                <div
                  key={dog.id}
                  className="card-warm p-4 animate-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex gap-3">
                    <img
                      src={dog.profile_image || "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400"}
                      alt={dog.name}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-lg">{dog.name}</h3>
                      <p className="text-sm text-muted-foreground">📍 {dog.soft_locations?.[0] || 'Unknown area'}</p>
                      <p className="text-xs text-muted-foreground mt-1">By: {dog.creator?.username || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    {editingDogId === dog.id ? (
                      <div className="flex-1 flex flex-col gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm"
                          placeholder="Official Name (e.g., Buddy)"
                          autoFocus
                        />
                        <input
                          type="text"
                          value={qrCode}
                          onChange={(e) => setQrCode(e.target.value.toUpperCase())}
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm font-mono"
                          placeholder="Scan/Enter QR Code (e.g., CP-1029)"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (!editName.trim() || !qrCode.trim()) {
                                toast({ title: "Missing Info", description: "Please enter both name and QR code", variant: "destructive" });
                                return;
                              }
                              approveDog.mutate({ dogId: dog.id, name: editName.trim(), qrCode: qrCode.trim() }, {
                                onSuccess: () => {
                                  toast({ title: "Dog Verified! 🐾", description: `${editName} registered with collar ${qrCode}` });
                                  setEditingDogId(null);
                                  setQrCode("");
                                  setEditName("");
                                },
                                onError: (err) => toast({ title: "Failed", description: err.message, variant: "destructive" })
                              });
                            }}
                            disabled={approveDog.isPending}
                            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium flex items-center justify-center gap-2"
                          >
                            {approveDog.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Confirm</>}
                          </button>
                          <button
                            onClick={() => {
                              setEditingDogId(null);
                              setQrCode("");
                              setEditName("");
                            }}
                            className="px-3 bg-muted text-muted-foreground rounded-xl"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingDogId(dog.id);
                          setEditName(dog.temporary_name || dog.name);
                        }}
                        disabled={approveDog.isPending}
                        className="flex-1 flex items-center justify-center gap-2 bg-secondary text-secondary-foreground 
                          py-3 rounded-xl font-medium transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                      >
                        <Check className="w-5 h-5" />
                        Verify & Name
                      </button>
                    )}
                    <button
                      onClick={() => handleRejectDog(dog.id)}
                      disabled={rejectDog.isPending}
                      className="flex-1 flex items-center justify-center gap-2 bg-destructive/10 text-destructive 
                        py-3 rounded-xl font-medium transition-all hover:bg-destructive/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                      <X className="w-5 h-5" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Dog className="w-16 h-16" />}
              title="All dogs verified!"
              message="No pending dog profiles to review."
              hint={isDev ? "Submit a dog from a student account to test" : undefined}
            />
          )
        )}
      </div>

    </div>
  );
};

export default AdminPanel;
