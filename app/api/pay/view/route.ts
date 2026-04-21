import { createHash } from "crypto";

import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { payCopy } from "@/lib/constants/copy";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { trackViewInputSchema } from "@/lib/validations/pay.schema";

function getRequestIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

function hashIp(ip: string) {
  const salt = process.env.VIEW_HASH_SALT ?? "paylink-default-view-hash-salt";
  return createHash("sha256").update(`${ip}:${salt}`).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = (await request.json()) as unknown;
    const payload = trackViewInputSchema.parse(rawBody);
    const supabase = createAdminSupabaseClient();
    const ipHash = hashIp(getRequestIp(request));
    const userAgent = request.headers.get("user-agent");
    const referrer = request.headers.get("referer");

    const { error } = await supabase.from("link_views").insert({
      link_id: payload.linkId,
      ip_hash: ipHash,
      user_agent: userAgent,
      referrer,
    });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true as const }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: payCopy.errors.invalidPayload }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : payCopy.feedback.checkoutError;
    return NextResponse.json({ message }, { status: 500 });
  }
}

