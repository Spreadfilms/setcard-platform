import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resend, FROM_EMAIL, FROM_NAME } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = createAdminClient();

    // E-Mail Einzigartigkeit prüfen
    const { data: existing } = await supabase
      .from("actors")
      .select("id")
      .eq("email", body.email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Diese E-Mail-Adresse ist bereits registriert. Nutze 'SetCard aktualisieren'." },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("actors")
      .insert([{ ...body, status: "neu" }])
      .select()
      .single();

    if (error) throw error;

    // Bestätigungs-E-Mail senden
    try {
      await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: body.email,
        subject: "Deine SetCard-Bewerbung bei Spreadfilms",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Vielen Dank, ${body.first_name}!</h2>
            <p>Wir haben deine SetCard-Bewerbung erhalten und werden sie in Kürze prüfen.</p>
            <p>Du erhältst eine Rückmeldung von uns, sobald wir dein Profil gesichtet haben.</p>
            <br>
            <p>Mit freundlichen Grüßen,<br>Das Spreadfilms Casting-Team</p>
          </div>
        `,
      });
    } catch {
      // E-Mail-Fehler nicht blockieren
    }

    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/actors:", err);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);

    let query = supabase.from("actors").select("*");

    const status = searchParams.get("status");
    if (status && status !== "all") query = query.eq("status", status);

    const search = searchParams.get("search");
    if (search) query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,city.ilike.%${search}%`);

    const gender = searchParams.get("gender");
    if (gender) query = query.eq("gender", gender);

    const priority = searchParams.get("priority");
    if (priority === "none") query = query.is("cast_priority", null);
    else if (priority) query = query.eq("cast_priority", priority);

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: unknown) {
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
