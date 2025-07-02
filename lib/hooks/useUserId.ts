import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

export const useUserId = () => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["user", session?.user?.email],
    queryFn: async () => {
      if (!session?.user?.email) return null;

      const response = await fetch(
        `/api/users?email=${encodeURIComponent(session.user.email)}`
      );
      if (!response.ok) return null;

      const users = await response.json();
      return users[0]?._id || null;
    },
    enabled: !!session?.user?.email,
  });
};
