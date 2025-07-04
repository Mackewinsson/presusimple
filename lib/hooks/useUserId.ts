import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export function useUserId() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["userId", session?.user?.email],
    queryFn: async () => {
      if (!session?.user?.email) return null;

      try {
        const response = await fetch(`/api/users?email=${session.user.email}`);
        const users = await response.json();

        if (users.length > 0) {
          return users[0]._id;
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
          return newUser._id;
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

export function useUserSubscription() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["userSubscription", session?.user?.email],
    queryFn: async () => {
      if (!session?.user?.email) return null;

      try {
        const response = await fetch(`/api/users?email=${session.user.email}`);
        const users = await response.json();

        if (users.length > 0) {
          const user = users[0];

          // Check if trial has expired and update status if needed
          if (user.trialEnd && !user.isPaid) {
            const now = new Date();
            const trialEnd = new Date(user.trialEnd);

            if (now > trialEnd) {
              // Trial has expired, update user status
              await fetch("/api/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: session.user.email,
                  isPaid: false,
                }),
              });

              return {
                isPaid: false,
                trialStart: user.trialStart ? new Date(user.trialStart) : null,
                trialEnd: new Date(user.trialEnd),
                stripeCustomerId: user.stripeCustomerId,
                stripeSubscriptionId: user.stripeSubscriptionId,
              };
            }
          }

          return {
            isPaid: user.isPaid || false,
            trialStart: user.trialStart ? new Date(user.trialStart) : null,
            trialEnd: user.trialEnd ? new Date(user.trialEnd) : null,
            stripeCustomerId: user.stripeCustomerId,
            stripeSubscriptionId: user.stripeSubscriptionId,
          };
        }

        return {
          isPaid: false,
          trialStart: null,
          trialEnd: null,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
        };
      } catch (error) {
        console.error("Error fetching user subscription:", error);
        throw error;
      }
    },
    enabled: !!session?.user?.email,
  });
}
