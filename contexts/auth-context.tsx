"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, useContext } from "react";

import type { Tables } from "@/types/database";

type AuthContextValue = {
  user: User;
  profile: Tables<"profiles"> | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  user,
  profile,
}: {
  children: React.ReactNode;
  user: User;
  profile: Tables<"profiles"> | null;
}) {
  return (
    <AuthContext.Provider value={{ user, profile }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
