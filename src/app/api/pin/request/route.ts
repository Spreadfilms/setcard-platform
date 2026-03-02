import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resend, FROM_EMAIL, FROM_NAME } from "@/lib/resend";
import * as crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Ungültige E-Mail-Adresse" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Actor suchen
    const { data: actor } = await supabase
      .from("actors")
      .select("id, first_name, pin_expires_at")
      .eq("email", email.toLowerCase())
      .single();

    if (!actor) {
      // Keine Info geben, ob E-Mail existiert (Security)
      return NextResponse.json({ success: true });
    }

    // Rate Limiting: max 3 aktive PINs pro Stunde
    if (actor.pin_expires_at) {
      const expires = new Date(actor.pin_expires_at);
      const now = new Date();
      if (expires > now) {
        const remaining = Math.ceil((expires.getTime() - now.getTime()) / 60000);
        return NextResponse.json(
          { error: `Bitte warte ${remaining} Minuten, bevor du einen neuen PIN anforderst.` },
          { status: 429 }
        );
      }
    }

    // 6-stellige PIN generieren
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const pinHash = crypto.createHash("sha256").update(pin).digest("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 Minuten

    await supabase
      .from("actors")
      .update({ pin_hash: pinHash, pin_expires_at: expiresAt })
      .eq("id", actor.id);

    // PIN per E-Mail senden
    await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: "Dein PIN zur SetCard-Aktualisierung",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Dein PIN: <strong style="font-size: 2rem; letter-spacing: 0.1em;">${pin}</strong></h2>
          <p>Dieser PIN ist 10 Minuten gültig.</p>
          <p>Falls du keinen PIN angefordert hast, ignoriere diese E-Mail.</p>
          <br>
          <p>Spreadfilms Casting-Team</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("PIN request error:", err);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
