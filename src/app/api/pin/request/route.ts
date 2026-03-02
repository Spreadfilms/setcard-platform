import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, emailTemplates } from "@/lib/email";
import * as crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: actor } = await supabase
      .from("actors")
      .select("id, first_name, pin_expires_at")
      .eq("email", email.toLowerCase())
      .single();

    if (!actor) {
      // Don't reveal whether email exists (security)
      return NextResponse.json({ success: true });
    }

    // Rate limiting: wait if PIN was recently sent
    if (actor.pin_expires_at) {
      const expires = new Date(actor.pin_expires_at);
      const now = new Date();
      if (expires > now) {
        const remaining = Math.ceil((expires.getTime() - now.getTime()) / 60000);
        return NextResponse.json(
          { error: `Please wait ${remaining} minute(s) before requesting a new code.` },
          { status: 429 }
        );
      }
    }

    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const pinHash = crypto.createHash("sha256").update(pin).digest("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await supabase
      .from("actors")
      .update({ pin_hash: pinHash, pin_expires_at: expiresAt })
      .eq("id", actor.id);

    await sendEmail({
      to: email,
      subject: "Your Spreadfilms verification code",
      html: emailTemplates.pin(actor.first_name, pin),
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("PIN request error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
