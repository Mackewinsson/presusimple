import GoogleProvider from "next-auth/providers/google";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";

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
            });
            
            await newUser.save();
    
            
            // Add a flag to indicate this is a new user
            user.isNewUser = true;
          } else {
            // Only give trials to truly new users who have never had a trial
            // Don't reset trials for existing users
            if (!existingUser.trialEnd && !existingUser.isPaid && !existingUser.subscriptionType) {
              // Give existing users a trial only if they have no trial history
              const trialEnd = new Date();
              trialEnd.setTime(trialEnd.getTime() + (30 * 24 * 60 * 60 * 1000)); // Exactly 30 days in milliseconds
              
              existingUser.plan = "pro";
              existingUser.trialStart = new Date();
              existingUser.trialEnd = trialEnd;
              existingUser.subscriptionType = "trial_signup";
              
              await existingUser.save();
      
              
              // Add a flag to indicate this is a returning user getting trial
              user.isNewUser = true;
            }
          }
          
          return true;
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
        // Preserve the isNewUser flag
        if (user.isNewUser) {
          token.isNewUser = true;
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token.user) {
        session.user = token.user;
      }
      // Add isNewUser to session
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
