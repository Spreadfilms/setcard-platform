import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import * as crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email, pin } = await req.json();

    if (!email || !pin) {
      return NextResponse.json({ error: "E-Mail und PIN erforderlich" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: actor } = await supabase
      .from("actors")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    if (!actor) {
      return NextResponse.json({ error: "Ungültige Zugangsdaten" }, { status: 401 });
    }

    // Ablauf prüfen
    if (!actor.pin_expires_at || new Date(actor.pin_expires_at) < new Date()) {
      return NextResponse.json({ error: "PIN abgelaufen. Bitte neuen PIN anfordern." }, { status: 401 });
    }

    // PIN prüfen
    const pinHash = crypto.createHash("sha256").update(pin).digest("hex");
    if (pinHash !== actor.pin_hash) {
      return NextResponse.json({ error: "Ungültiger PIN" }, { status: 401 });
    }

    // PIN verbrauchen
    await supabase
      .from("actors")
      .update({ pin_hash: null, pin_expires_at: null })
      .eq("id", actor.id);

    return NextResponse.json({ success: true, actor });
  } catch (err: unknown) {
    console.error("PIN verify error:", err);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
