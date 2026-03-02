import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resend, FROM_EMAIL, FROM_NAME } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const { actorId, to, subject, body, type, sentBy } = await req.json();
    const supabase = createAdminClient();

    // E-Mail senden
    const { error: sendError } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; white-space: pre-wrap;">${body.replace(/\n/g, "<br>")}</div>`,
    });

    if (sendError) throw sendError;

    // Logging
    await supabase.from("email_log").insert([{
      actor_id: actorId,
      subject,
      body,
      type: type || "custom",
      sent_by: sentBy || "admin",
    }]);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Email send error:", err);
    return NextResponse.json({ error: "E-Mail konnte nicht gesendet werden" }, { status: 500 });
  }
}
