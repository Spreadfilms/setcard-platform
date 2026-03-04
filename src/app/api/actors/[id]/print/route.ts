import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function calcAge(dob: string): number {
  return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000));
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/admin/login", _req.url));

  const { id } = await params;
  const adminClient = createAdminClient();
  const { data: actor, error } = await adminClient
    .from("actors")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !actor) return new NextResponse("Not found", { status: 404 });

  const age = actor.date_of_birth ? calcAge(actor.date_of_birth) : null;
  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

  const physicalItems: { label: string; value: string }[] = [
    actor.height_cm && { label: "Height", value: `${actor.height_cm} cm` },
    actor.weight_kg && { label: "Weight", value: `${actor.weight_kg} kg` },
    actor.hair_color && { label: "Hair", value: actor.hair_color },
    actor.eye_color && { label: "Eyes", value: actor.eye_color },
    actor.skin_type && { label: "Skin", value: actor.skin_type },
    actor.body_type && { label: "Build", value: actor.body_type.charAt(0).toUpperCase() + actor.body_type.slice(1) },
    actor.clothing_size_top && { label: "Top size", value: actor.clothing_size_top },
    actor.clothing_size_bottom && { label: "Bottom size", value: String(actor.clothing_size_bottom) },
    actor.shoe_size && { label: "Shoe size", value: String(actor.shoe_size) },
  ].filter(Boolean) as { label: string; value: string }[];

  const photoGrid: string[] = [
    actor.halfbody_photo_url,
    actor.fullbody_photo_url,
    ...(actor.additional_photos || []),
  ].filter(Boolean) as string[];

  const cols = photoGrid.length === 1 ? 1 : photoGrid.length === 2 ? 2 : photoGrid.length >= 4 ? 4 : 3;

  const physicalHTML = physicalItems.map(item => `
    <div class="physical-item">
      <span class="physical-label">${item.label}</span>
      <span class="physical-value">${item.value}</span>
    </div>
  `).join("");

  const photosHTML = photoGrid.map(url => `
    <img src="${url}" alt="Photo" />
  `).join("");

  const tagsHTML = [
    age ? `<span class="tag">${age} yrs</span>` : "",
    actor.gender ? `<span class="tag" style="text-transform:capitalize">${actor.gender}</span>` : "",
    actor.nationality ? `<span class="tag">${actor.nationality}</span>` : "",
    actor.city ? `<span class="tag">📍 ${actor.city}</span>` : "",
    actor.experience_level ? `<span class="tag tag-dark">${actor.experience_level}</span>` : "",
  ].filter(Boolean).join("");

  const portraitHTML = actor.portrait_photo_url
    ? `<img src="${actor.portrait_photo_url}" alt="${actor.first_name} ${actor.last_name}" />`
    : `<div class="portrait-placeholder">${actor.first_name?.[0] || ""}${actor.last_name?.[0] || ""}</div>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${actor.first_name} ${actor.last_name} — Spreadfilms Sedcard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html, body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
      background: #fff;
      color: #0a0a0a;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: #fff;
      display: flex;
      flex-direction: column;
    }

    /* Header */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 22px;
      background: #0a0a0a;
      color: #fff;
    }
    .header-brand { display: flex; align-items: center; gap: 10px; }
    .header-logo {
      width: 28px; height: 28px;
      background: #fff;
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
    }
    .header-logo span { font-size: 12px; font-weight: 800; color: #0a0a0a; letter-spacing: -0.04em; }
    .header-name { font-size: 13px; font-weight: 600; letter-spacing: -0.01em; }
    .header-date { font-size: 11px; color: #888; }

    /* Hero */
    .hero { display: flex; border-bottom: 1.5px solid #e5e5e5; }
    .portrait-col { width: 64mm; flex-shrink: 0; overflow: hidden; background: #f0f0f0; }
    .portrait-col img { width: 100%; height: 90mm; object-fit: cover; display: block; }
    .portrait-placeholder {
      width: 100%; height: 90mm;
      display: flex; align-items: center; justify-content: center;
      font-size: 36px; font-weight: 700; color: #ccc; background: #f5f5f5;
    }

    .info-col {
      flex: 1;
      padding: 18px 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .actor-name {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.04em;
      line-height: 1.05;
      color: #0a0a0a;
    }
    .actor-sub { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 8px; }
    .tag {
      display: inline-block;
      font-size: 10.5px; font-weight: 500;
      padding: 3px 9px;
      border-radius: 100px;
      background: #f0f0f0; color: #404040;
    }
    .tag-dark { background: #0a0a0a; color: #fff; }

    .physical-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px 12px; }
    .physical-item {
      display: flex; flex-direction: column; gap: 1px;
      padding: 5px 8px;
      background: #f7f7f7;
      border-radius: 6px;
    }
    .physical-label { font-size: 9px; font-weight: 500; color: #888; text-transform: uppercase; letter-spacing: 0.06em; }
    .physical-value { font-size: 12px; font-weight: 600; color: #0a0a0a; }

    .contact-info { font-size: 11px; color: #555; }
    .contact-info .lbl { color: #888; font-size: 9px; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; display: block; margin-bottom: 2px; }

    /* Photos */
    .photos-section { padding: 16px 22px; flex: 1; }
    .section-label { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-bottom: 10px; }
    .photo-grid { display: grid; gap: 8px; grid-template-columns: repeat(${cols}, 1fr); }
    .photo-grid img { width: 100%; aspect-ratio: 3/4; object-fit: cover; border-radius: 8px; display: block; }

    /* Showreel */
    .showreel { padding: 0 22px 12px; font-size: 11px; color: #555; }
    .showreel .lbl { color: #888; font-size: 9px; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }
    .showreel a { color: #0a0a0a; font-weight: 600; word-break: break-all; }

    /* Footer */
    .footer {
      margin-top: auto;
      padding: 10px 22px;
      border-top: 1px solid #e5e5e5;
      display: flex; justify-content: space-between; align-items: center;
    }
    .footer-left { font-size: 9.5px; font-weight: 700; color: #0a0a0a; letter-spacing: -0.01em; }
    .footer-right { font-size: 9px; color: #aaa; }

    /* Print button (screen only) */
    .print-toolbar {
      position: fixed; top: 16px; right: 16px; z-index: 999;
      display: flex; gap: 8px;
    }
    .btn-print {
      background: #0a0a0a; color: #fff;
      border: none; border-radius: 8px;
      padding: 10px 20px; font-size: 13px; font-weight: 600;
      cursor: pointer; font-family: inherit;
    }
    .btn-close {
      background: #fff; color: #0a0a0a;
      border: 1px solid #e5e5e5; border-radius: 8px;
      padding: 10px 14px; font-size: 13px;
      cursor: pointer; font-family: inherit;
    }

    @media print {
      .print-toolbar { display: none !important; }
      body { background: #fff; }
      .page { width: 100%; }
    }

    @media screen {
      body { background: #e0e0e0; padding: 30px 20px; }
      .page { box-shadow: 0 4px 48px rgba(0,0,0,0.2); }
    }
  </style>
</head>
<body>
  <div class="print-toolbar">
    <button class="btn-print" onclick="window.print()">⬇ Save as PDF</button>
    <button class="btn-close" onclick="window.close()">✕</button>
  </div>

  <div class="page">
    <!-- Header -->
    <div class="header">
      <div class="header-brand">
        <div class="header-logo"><span>SF</span></div>
        <span class="header-name">Spreadfilms Casting</span>
      </div>
      <span class="header-date">${today}</span>
    </div>

    <!-- Hero -->
    <div class="hero">
      <div class="portrait-col">${portraitHTML}</div>
      <div class="info-col">
        <div>
          <div class="actor-name">${actor.first_name}<br />${actor.last_name}</div>
          <div class="actor-sub">${tagsHTML}</div>
        </div>
        ${physicalItems.length > 0 ? `<div class="physical-grid">${physicalHTML}</div>` : ""}
        ${actor.email ? `
        <div class="contact-info">
          <span class="lbl">Contact</span>
          ${actor.email}${actor.phone ? ` &nbsp;·&nbsp; ${actor.phone}` : ""}
        </div>` : ""}
      </div>
    </div>

    <!-- Photos -->
    ${photoGrid.length > 0 ? `
    <div class="photos-section">
      <div class="section-label">Photos</div>
      <div class="photo-grid">${photosHTML}</div>
    </div>` : ""}

    <!-- Showreel -->
    ${actor.showreel_url ? `
    <div class="showreel">
      <span class="lbl">Showreel &nbsp;</span>
      <a href="${actor.showreel_url}" target="_blank">${actor.showreel_url}</a>
    </div>` : ""}

    <!-- Footer -->
    <div class="footer">
      <span class="footer-left">Spreadfilms Casting</span>
      <span class="footer-right">Confidential · for internal use only</span>
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
