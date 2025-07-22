import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { IUser } from "@/models/User";

export function useUserData() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["userData", session?.user?.email],
    queryFn: async (): Promise<IUser | null> => {
      if (!session?.user?.email) return null;

      try {
        const response = await fetch(`/api/users?email=${session.user.email}`);
        const users = await response.json();

        if (users.length > 0) {
          return users[0];
        }

        // Create user if not found
        const createResponse = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: session.user.email,
            name: session.user.name,
          }),
        });

        if (createResponse.ok) {
          const newUser = await createResponse.json();
          return newUser;
        }

        throw new Error("Failed to create user");
      } catch (error) {
        console.error("Error fetching/creating user:", error);
        throw error;
      }
    },
    enabled: !!session?.user?.email,
  });
} 