import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export interface StreakData {
  streakCount: number;
  lastActivityDate: string | null;
}

async function fetchStreak(): Promise<StreakData> {
  const res = await fetch("/api/streak");
  if (!res.ok) throw new Error("Failed to fetch streak");
  return res.json();
}

async function recordStreakActivity(): Promise<StreakData> {
  const res = await fetch("/api/streak", { method: "POST" });
  if (!res.ok) throw new Error("Failed to record streak");
  return res.json();
}

export function useStreak() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["streak", session?.user?.email],
    queryFn: fetchStreak,
    enabled: !!session?.user?.email,
  });

  const recordMutation = useMutation({
    mutationFn: recordStreakActivity,
    onSuccess: (data) => {
      queryClient.setQueryData(["streak", session?.user?.email], data);
    },
  });

  return {
    streakCount: query.data?.streakCount ?? 0,
    lastActivityDate: query.data?.lastActivityDate ?? null,
    isLoading: query.isLoading,
    recordActivity: recordMutation.mutate,
  };
}
