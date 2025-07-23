import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    isNewUser?: boolean;
  }

  interface User {
    isNewUser?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isNewUser?: boolean;
  }
} 