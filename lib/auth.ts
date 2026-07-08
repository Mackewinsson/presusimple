import GoogleProvider from "next-auth/providers/google";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";
import { isAdminEmail } from "@/lib/auth/admin-config";
import {
  buildGracePeriodUpdate,
  shouldReceiveBillingGracePeriod,
} from "@/lib/billing/grace-period";
import { sendWelcomeEmail } from "@/lib/email";
import { recordUserLogin } from "@/lib/auth/record-login";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account?.provider === "google") {
        try {
          await dbConnect();
          
          // Check if user already exists
          const existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            // Create new user with trial activation
            const trialEnd = new Date();
            trialEnd.setTime(trialEnd.getTime() + (30 * 24 * 60 * 60 * 1000)); // Exactly 30 days in milliseconds
            
            const newUser = new User({
              email: user.email,
              name: user.name,
              isPaid: false,
              plan: "pro", // Trial users get pro features
              trialStart: new Date(),
              trialEnd: trialEnd,
              subscriptionType: "trial_signup",
              lastLoginAt: new Date(),
            });
            
            await newUser.save();

            sendWelcomeEmail(user.email, user.name).catch((err) =>
              console.error("[auth] Welcome email failed:", err)
            );
    
            
            // Add a flag to indicate this is a new user
            user.isNewUser = true;
          } else if (shouldReceiveBillingGracePeriod(existingUser)) {
            Object.assign(existingUser, buildGracePeriodUpdate());
            await existingUser.save();
          }

          await recordUserLogin(user.email);
        } catch (error) {
          console.error("Error during sign in:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.user = user;
        token.email = user.email ?? token.email;
        if (user.isNewUser) {
          token.isNewUser = true;
        }
      }

      const email = token.email ?? token.user?.email;
      token.isAdmin = email ? isAdminEmail(email) : false;

      return token;
    },
    async session({ session, token }: any) {
      const email =
        token.email ?? token.user?.email ?? session.user?.email ?? null;

      session.user = {
        ...session.user,
        ...(token.user ?? {}),
        email,
        isAdmin: email ? Boolean(token.isAdmin) : false,
      };

      if (token.isNewUser) {
        session.isNewUser = true;
      }

      return session;
    },
    async redirect({ url, baseUrl }: any) {
      // For regular web auth, redirect to /budget
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl + "/budget";
    },
  },
  debug: process.env.NODE_ENV === "development",
};
