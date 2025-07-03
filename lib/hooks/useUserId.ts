import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

export const useUserId = () => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["user", session?.user?.email],
    queryFn: async () => {
      if (!session?.user?.email) return null;

      // First try to get existing user
      const response = await fetch(
        `/api/users?email=${encodeURIComponent(session.user.email)}`
      );
      if (!response.ok) return null;

      const users = await response.json();
      if (users[0]) {
        return users[0]._id;
      }

      // If user doesn't exist, create them
      const createResponse = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user.email,
          name: session.user.name || session.user.email,
        }),
      });

      if (!createResponse.ok) return null;

      const newUser = await createResponse.json();
      return newUser._id;
    },
    enabled: !!session?.user?.email,
  });
};
