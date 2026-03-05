import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

export function usePetDog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (dogId: string) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Authentication required");

            const { error } = await supabase.from("dog_interactions").insert({
                dog_id: dogId,
                user_id: user.id,
                interaction_type: "petting",
            } as any);

            if (error) {
                if (error.message.includes("6 hours")) {
                    throw new Error("You already petted this dog recently! (6h cooldown)");
                }
                throw new Error(error.message);
            }

            return dogId;
        },
        onSuccess: (dogId) => {
            queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
            queryClient.invalidateQueries({ queryKey: ["dog", dogId] });
            queryClient.invalidateQueries({ queryKey: ["user-profile"] });
            toast({
                title: "Petted! 🐶",
                description: "You've earned +5 Kindness Points for showing love!",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Action Restricted",
                description: error.message,
                variant: "destructive",
            });
        },
    });
}
