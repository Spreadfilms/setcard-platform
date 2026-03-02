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
      return NextResponse.json({ error: "Actor not found." }, { status: 404 });
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: `You are a friendly, professional casting assistant for the production company Spreadfilms.
Write formal yet warm emails in English.
Keep emails concise and to the point (max 150 words).
Always address the actor by their first name.
Reply in this exact format:
SUBJECT: [subject here]
---
[email body here]`,
      messages: [
        {
          role: "user",
          content: `Write an email to actor ${actor.first_name} ${actor.last_name}.
Instruction: ${instruction}
Sender: ${adminName || "The Spreadfilms Casting Team"}`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Invalid AI response.");

    const text = content.text;
    const subjectMatch = text.match(/SUBJECT:\s*(.+)/);
    const subject = subjectMatch ? subjectMatch[1].trim() : "Message from Spreadfilms";
    const body = text.replace(/SUBJECT:.+\n---\n?/, "").trim();

    return NextResponse.json({ subject, body });
  } catch (err: unknown) {
    console.error("Email generate error:", err);
    return NextResponse.json({ error: "AI generation failed." }, { status: 500 });
  }
}
