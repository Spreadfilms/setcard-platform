import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { actorId, instruction, adminName } = await req.json();
    const supabase = createAdminClient();

    const { data: actor, error } = await supabase
      .from("actors")
      .select("first_name, last_name, email, gender, experience_level, city")
      .eq("id", actorId)
      .single();

    if (error || !actor) {
      return NextResponse.json({ error: "Schauspieler nicht gefunden" }, { status: 404 });
    }

    const anrede = actor.gender === "männlich" ? "Sehr geehrter Herr" : actor.gender === "weiblich" ? "Sehr geehrte Frau" : "Sehr geehrte(r)";

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: `Du bist ein freundlicher, professioneller Casting-Assistent der Produktionsfirma Spreadfilms.
Schreibe formelle aber warmherzige E-Mails auf Deutsch.
Verwende "Sie" als Anrede.
Halte die E-Mail kurz und auf den Punkt (max. 150 Wörter).
Antworte im Format:
BETREFF: [Betreff hier]
---
[E-Mail-Text hier]`,
      messages: [
        {
          role: "user",
          content: `Schreibe eine E-Mail an den Schauspieler ${actor.first_name} ${actor.last_name} (${anrede} ${actor.last_name}).
Anweisung: ${instruction}
Absender: ${adminName || "Das Spreadfilms Casting-Team"}`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Ungültige KI-Antwort");

    const text = content.text;
    const subjectMatch = text.match(/BETREFF:\s*(.+)/);
    const subject = subjectMatch ? subjectMatch[1].trim() : "Nachricht von Spreadfilms";
    const body = text.replace(/BETREFF:.+\n---\n?/, "").trim();

    return NextResponse.json({ subject, body });
  } catch (err: unknown) {
    console.error("Email generate error:", err);
    return NextResponse.json({ error: "KI-Generierung fehlgeschlagen" }, { status: 500 });
  }
}
