import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import * as crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email, pin } = await req.json();

    if (!email || !pin) {
      return NextResponse.json({ error: "Email and PIN are required." }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: actor } = await supabase
      .from("actors")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    if (!actor) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    if (!actor.pin_expires_at || new Date(actor.pin_expires_at) < new Date()) {
      return NextResponse.json({ error: "Code expired. Please request a new one." }, { status: 401 });
    }

    const pinHash = crypto.createHash("sha256").update(pin).digest("hex");
    if (pinHash !== actor.pin_hash) {
      return NextResponse.json({ error: "Invalid code. Please try again." }, { status: 401 });
    }

    // Invalidate PIN after use
    await supabase
      .from("actors")
      .update({ pin_hash: null, pin_expires_at: null })
      .eq("id", actor.id);

    return NextResponse.json({ success: true, actor });
  } catch (err: unknown) {
    console.error("PIN verify error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
