import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, emailTemplates } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("actors")
      .insert([{ ...body, status: "neu" }])
      .select()
      .single();

    if (error) throw error;

    // Send confirmation email
    try {
      await sendEmail({
        to: body.email,
        subject: "Your Spreadfilms Sedcard application",
        html: emailTemplates.confirmation(body.first_name),
      });
    } catch {
      // Don't block response if email fails
    }

    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/actors:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
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
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
