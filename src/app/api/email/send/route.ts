import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, emailTemplates } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { actorId, to, subject, body, type, sentBy, firstName } = await req.json();
    const supabase = createAdminClient();

    // Wrap body in beautiful HTML template
    const html = emailTemplates.custom(firstName || "there", body);

    await sendEmail({ to, subject, html });

    // Log to database
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
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }
}
