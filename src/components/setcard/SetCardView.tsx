import { Actor } from "@/types";
import { calculateAge, formatDate } from "@/lib/utils";
import Image from "next/image";

interface SetCardViewProps {
  actor: Actor;
}

export default function SetCardView({ actor }: SetCardViewProps) {
  const age = actor.date_of_birth ? calculateAge(actor.date_of_birth) : null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {actor.portrait_photo_url && (
          <div className="w-48 md:w-64 flex-shrink-0">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden">
              <Image
                src={actor.portrait_photo_url}
                alt={`${actor.first_name} ${actor.last_name}`}
                width={256}
                height={341}
                className="w-full h-full object-cover"
                unoptimized
                priority
              />
            </div>
          </div>
        )}
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-4xl font-bold text-[#0A0A0A]">
              {actor.first_name} {actor.last_name}
            </h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {age && <Badge>{age} Jahre</Badge>}
              {actor.gender && <Badge>{actor.gender}</Badge>}
              {actor.city && <Badge>📍 {actor.city}</Badge>}
              {actor.experience_level && <Badge variant="primary">{actor.experience_level}</Badge>}
            </div>
          </div>

          {/* Körperliche Merkmale */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {actor.height_cm && <DataItem label="Größe" value={`${actor.height_cm} cm`} />}
            {actor.weight_kg && <DataItem label="Gewicht" value={`${actor.weight_kg} kg`} />}
            {actor.hair_color && <DataItem label="Haare" value={actor.hair_color} />}
            {actor.eye_color && <DataItem label="Augen" value={actor.eye_color} />}
            {actor.skin_type && <DataItem label="Hauttyp" value={actor.skin_type} />}
            {actor.body_type && <DataItem label="Figur" value={actor.body_type} />}
            {actor.clothing_size_top && <DataItem label="Oben" value={actor.clothing_size_top} />}
            {actor.clothing_size_bottom && <DataItem label="Unten" value={String(actor.clothing_size_bottom)} />}
            {actor.shoe_size && <DataItem label="Schuh" value={`${actor.shoe_size}`} />}
          </div>
        </div>
      </div>

      {/* Über mich */}
      {actor.about_me && (
        <Section title="Über mich">
          <p className="text-[#0A0A0A] leading-relaxed">{actor.about_me}</p>
        </Section>
      )}

      {/* Fähigkeiten */}
      {((actor.acting_skills?.length ?? 0) > 0 || (actor.special_skills?.length ?? 0) > 0 || (actor.sports?.length ?? 0) > 0) && (
        <Section title="Fähigkeiten">
          {(actor.acting_skills?.length ?? 0) > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-[#737373] uppercase tracking-wider mb-2">Schauspiel</p>
              <div className="flex flex-wrap gap-2">
                {actor.acting_skills!.map((s) => <Badge key={s}>{s}</Badge>)}
              </div>
            </div>
          )}
          {(actor.special_skills?.length ?? 0) > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-[#737373] uppercase tracking-wider mb-2">Spezial-Skills</p>
              <div className="flex flex-wrap gap-2">
                {actor.special_skills!.map((s) => <Badge key={s}>{s}</Badge>)}
              </div>
            </div>
          )}
          {(actor.sports?.length ?? 0) > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-[#737373] uppercase tracking-wider mb-2">Sport</p>
              <div className="flex flex-wrap gap-2">
                {actor.sports!.map((s) => <Badge key={s}>{s}</Badge>)}
              </div>
            </div>
          )}
          {(actor.music_skills?.length ?? 0) > 0 && (
            <div>
              <p className="text-xs font-medium text-[#737373] uppercase tracking-wider mb-2">Musik</p>
              <div className="flex flex-wrap gap-2">
                {actor.music_skills!.map((s) => <Badge key={s}>{s}</Badge>)}
              </div>
            </div>
          )}
        </Section>
      )}

      {/* Sprachen */}
      {(actor.languages?.length ?? 0) > 0 && (
        <Section title="Sprachen">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {actor.languages!.map((lang, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-[#F5F5F5] rounded-lg">
                <span className="font-medium text-[#0A0A0A] text-sm">{lang.language}</span>
                <span className="text-xs text-[#737373]">{lang.level}</span>
              </div>
            ))}
          </div>
          {(actor.dialects?.length ?? 0) > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-[#737373] uppercase tracking-wider mb-2">Dialekte</p>
              <div className="flex flex-wrap gap-2">
                {actor.dialects!.map((d) => <Badge key={d}>{d}</Badge>)}
              </div>
            </div>
          )}
        </Section>
      )}

      {/* Führerschein */}
      {(actor.drivers_license?.length ?? 0) > 0 && (
        <Section title="Führerschein">
          <div className="flex flex-wrap gap-2">
            {actor.drivers_license!.map((l) => (
              <span key={l} className="px-3 py-1.5 bg-[#0A0A0A] text-white rounded-full text-sm font-medium">{l}</span>
            ))}
          </div>
        </Section>
      )}

      {/* Fotos */}
      {(actor.halfbody_photo_url || actor.fullbody_photo_url || (actor.additional_photos?.length ?? 0) > 0) && (
        <Section title="Fotos">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {actor.halfbody_photo_url && (
              <div className="aspect-[3/4] rounded-xl overflow-hidden">
                <Image src={actor.halfbody_photo_url} alt="Halbkörper" width={300} height={400} className="w-full h-full object-cover" unoptimized />
              </div>
            )}
            {actor.fullbody_photo_url && (
              <div className="aspect-[3/4] rounded-xl overflow-hidden">
                <Image src={actor.fullbody_photo_url} alt="Ganzkörper" width={300} height={400} className="w-full h-full object-cover" unoptimized />
              </div>
            )}
            {actor.additional_photos?.map((url, i) => (
              <div key={i} className="aspect-[3/4] rounded-xl overflow-hidden">
                <Image src={url} alt={`Foto ${i + 1}`} width={300} height={400} className="w-full h-full object-cover" unoptimized />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Showreel / Video */}
      {actor.showreel_url && (
        <Section title="Showreel">
          <a
            href={actor.showreel_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A0A0A] text-white rounded-xl hover:opacity-90 transition-opacity text-sm font-medium"
          >
            ▶ Showreel ansehen
          </a>
        </Section>
      )}

      {/* Agentur */}
      {actor.agency_name && (
        <Section title="Agentur">
          <p className="font-medium text-[#0A0A0A]">{actor.agency_name}</p>
          {actor.agency_contact && <p className="text-sm text-[#737373]">{actor.agency_contact}</p>}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-[#E5E5E5] pt-6">
      <h2 className="text-lg font-semibold text-[#0A0A0A] mb-4">{title}</h2>
      {children}
    </div>
  );
}

function DataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#F5F5F5] rounded-lg p-3">
      <p className="text-xs text-[#737373] mb-0.5">{label}</p>
      <p className="text-sm font-medium text-[#0A0A0A]">{value}</p>
    </div>
  );
}

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "primary" }) {
  return (
    <span className={`px-3 py-1 rounded-full text-sm ${
      variant === "primary"
        ? "bg-[#0A0A0A] text-white"
        : "bg-[#F5F5F5] text-[#737373]"
    }`}>
      {children}
    </span>
  );
}
