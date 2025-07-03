import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

export const useUserId = () => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["user", session?.user?.email],
    queryFn: async () => {
      if (!session?.user?.email) return null;

      try {
        // First try to get existing user
        const response = await fetch(
          `/api/users?email=${encodeURIComponent(session.user.email)}`
        );

        if (response.ok) {
          const users = await response.json();
          if (users[0]) {
            console.log("Found existing user:", users[0]._id);
            return users[0]._id;
          }
        } else {
          console.error(
            "Failed to fetch user:",
            response.status,
            response.statusText
          );
        }

        // If user doesn't exist, create them
        console.log("Creating new user for:", session.user.email);
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

        if (createResponse.ok) {
          const newUser = await createResponse.json();
          console.log("Created new user:", newUser._id);
          return newUser._id;
        } else {
          console.error(
            "Failed to create user:",
            createResponse.status,
            createResponse.statusText
          );
          const errorText = await createResponse.text();
          console.error("Error details:", errorText);
        }
      } catch (error) {
        console.error("Error in useUserId:", error);
      }

      // Fallback: return a temporary ID based on email hash
      // This ensures the app works even if the database is not available
      if (session?.user?.email) {
        const tempId = btoa(session.user.email).replace(/[^a-zA-Z0-9]/g, "");
        console.log("Using fallback user ID:", tempId);
        return tempId;
      }

      return null;
    },
    enabled: !!session?.user?.email,
    retry: 3,
    retryDelay: 1000,
  });
};
