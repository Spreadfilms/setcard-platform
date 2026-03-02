import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateAge } from "@/lib/utils";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: actor, error } = await supabase
    .from("actors")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !actor) {
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  }

  const age = actor.date_of_birth ? calculateAge(actor.date_of_birth) : null;

  // HTML-basiertes PDF über Browser-Print (kein Puppeteer nötig)
  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>SetCard – ${actor.first_name} ${actor.last_name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; color: #0A0A0A; background: white; }
    .page { max-width: 794px; margin: 0 auto; padding: 40px; }
    .header { display: flex; gap: 24px; align-items: flex-start; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #E5E5E5; }
    .portrait { width: 160px; height: 213px; object-fit: cover; border-radius: 12px; flex-shrink: 0; }
    .portrait-placeholder { width: 160px; height: 213px; background: #F5F5F5; border-radius: 12px; flex-shrink: 0; }
    .info h1 { font-size: 32px; font-weight: 700; margin-bottom: 8px; }
    .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
    .tag { padding: 4px 12px; background: #F5F5F5; border-radius: 999px; font-size: 13px; color: #737373; }
    .tag.primary { background: #0A0A0A; color: white; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .data-item { background: #F5F5F5; padding: 10px 12px; border-radius: 8px; }
    .data-item .label { font-size: 11px; color: #737373; margin-bottom: 2px; }
    .data-item .value { font-size: 13px; font-weight: 500; }
    .section { margin-top: 24px; }
    .section h2 { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #737373; margin-bottom: 12px; }
    .skill-tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .skill-tag { padding: 4px 10px; background: #F5F5F5; border-radius: 999px; font-size: 12px; }
    .photos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 32px; }
    .photo { width: 100%; aspect-ratio: 3/4; object-fit: cover; border-radius: 8px; }
    .about { font-size: 14px; line-height: 1.6; color: #0A0A0A; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #E5E5E5; font-size: 11px; color: #737373; display: flex; justify-content: space-between; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="background:#0A0A0A;color:white;padding:12px 24px;display:flex;justify-content:space-between;align-items:center;">
    <span style="font-size:14px;font-weight:500;">SetCard PDF – ${actor.first_name} ${actor.last_name}</span>
    <button onclick="window.print()" style="background:white;color:#0A0A0A;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:500;">Drucken / Als PDF speichern</button>
  </div>
  <div class="page">
    <div class="header">
      ${actor.portrait_photo_url
        ? `<img src="${actor.portrait_photo_url}" class="portrait" alt="Portrait">`
        : `<div class="portrait-placeholder"></div>`
      }
      <div class="info">
        <h1>${actor.first_name} ${actor.last_name}</h1>
        <div class="tags">
          ${age ? `<span class="tag">${age} Jahre</span>` : ""}
          ${actor.gender ? `<span class="tag">${actor.gender}</span>` : ""}
          ${actor.city ? `<span class="tag">📍 ${actor.city}</span>` : ""}
          ${actor.experience_level ? `<span class="tag primary">${actor.experience_level}</span>` : ""}
        </div>
        <div class="grid">
          ${actor.height_cm ? `<div class="data-item"><div class="label">Größe</div><div class="value">${actor.height_cm} cm</div></div>` : ""}
          ${actor.weight_kg ? `<div class="data-item"><div class="label">Gewicht</div><div class="value">${actor.weight_kg} kg</div></div>` : ""}
          ${actor.hair_color ? `<div class="data-item"><div class="label">Haare</div><div class="value">${actor.hair_color}</div></div>` : ""}
          ${actor.eye_color ? `<div class="data-item"><div class="label">Augen</div><div class="value">${actor.eye_color}</div></div>` : ""}
          ${actor.body_type ? `<div class="data-item"><div class="label">Figur</div><div class="value">${actor.body_type}</div></div>` : ""}
          ${actor.clothing_size_top ? `<div class="data-item"><div class="label">Größe oben</div><div class="value">${actor.clothing_size_top}</div></div>` : ""}
        </div>
      </div>
    </div>

    ${actor.about_me ? `
    <div class="section">
      <h2>Über mich</h2>
      <p class="about">${actor.about_me}</p>
    </div>` : ""}

    ${(actor.acting_skills?.length || actor.special_skills?.length) ? `
    <div class="section">
      <h2>Fähigkeiten</h2>
      <div class="skill-tags">
        ${[...(actor.acting_skills || []), ...(actor.special_skills || [])].map(s => `<span class="skill-tag">${s}</span>`).join("")}
      </div>
    </div>` : ""}

    ${actor.languages?.length ? `
    <div class="section">
      <h2>Sprachen</h2>
      <div class="skill-tags">
        ${actor.languages.map((l: { language: string; level: string }) => `<span class="skill-tag">${l.language} · ${l.level}</span>`).join("")}
      </div>
    </div>` : ""}

    ${(actor.halfbody_photo_url || actor.fullbody_photo_url) ? `
    <div class="photos">
      ${actor.halfbody_photo_url ? `<img src="${actor.halfbody_photo_url}" class="photo" alt="Halbkörper">` : ""}
      ${actor.fullbody_photo_url ? `<img src="${actor.fullbody_photo_url}" class="photo" alt="Ganzkörper">` : ""}
      ${actor.additional_photos?.[0] ? `<img src="${actor.additional_photos[0]}" class="photo" alt="Foto">` : ""}
    </div>` : ""}

    <div class="footer">
      <span>Spreadfilms Casting · ${actor.email}</span>
      <span>${new Date().toLocaleDateString("de-DE")}</span>
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="SetCard_${actor.first_name}_${actor.last_name}.pdf"`,
    },
  });
}
