import { NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");
  const nextPath = next && next.startsWith("/") ? next : "/dashboard";
  const redirectTo = new URL(nextPath, url.origin);
  const fallbackRedirect = new URL("/login?error=auth_callback", url.origin);

  if (!code) {
    return NextResponse.redirect(fallbackRedirect);
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(fallbackRedirect);
  }

  return NextResponse.redirect(redirectTo);
}

