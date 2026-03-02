"use client";

import { ActorFormData } from "@/types";
import { calculateAge } from "@/lib/utils";
import Image from "next/image";

interface SetCardPreviewProps {
  data: ActorFormData;
}

export default function SetCardPreview({ data }: SetCardPreviewProps) {
  const { personal, physical, skills, media, about } = data;
  const hasName = personal.first_name || personal.last_name;
  const age = personal.date_of_birth ? calculateAge(personal.date_of_birth) : null;

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-[#0A0A0A] px-6 py-4">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#737373]">SetCard Vorschau</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Portrait + Name */}
        <div className="flex gap-4">
          <div className="w-24 h-32 rounded-xl overflow-hidden bg-[#F5F5F5] flex-shrink-0">
            {media.portrait_photo_url ? (
              <Image
                src={media.portrait_photo_url}
                alt="Portrait"
                width={96}
                height={128}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-[#E5E5E5]" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-[#0A0A0A] truncate">
              {hasName ? `${personal.first_name} ${personal.last_name}` : "Vorname Nachname"}
            </h2>
            {age && <p className="text-sm text-[#737373]">{age} Jahre</p>}
            {personal.city && <p className="text-sm text-[#737373]">{personal.city}</p>}
            {skills.experience_level && (
              <span className="inline-block mt-2 px-2 py-0.5 bg-[#F5F5F5] text-[#737373] text-xs rounded-full">
                {skills.experience_level}
              </span>
            )}
          </div>
        </div>

        {/* Körperliche Merkmale */}
        {(physical.height_cm || physical.hair_color || physical.eye_color || physical.body_type) && (
          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.1em] text-[#737373] mb-3">
              Körperliche Merkmale
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {physical.height_cm && (
                <DataItem label="Größe" value={`${physical.height_cm} cm`} />
              )}
              {physical.weight_kg && (
                <DataItem label="Gewicht" value={`${physical.weight_kg} kg`} />
              )}
              {physical.hair_color && (
                <DataItem label="Haare" value={physical.hair_color} />
              )}
              {physical.eye_color && (
                <DataItem label="Augen" value={physical.eye_color} />
              )}
              {physical.body_type && (
                <DataItem label="Figur" value={physical.body_type} />
              )}
              {physical.clothing_size_top && (
                <DataItem label="Größe oben" value={physical.clothing_size_top} />
              )}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.acting_skills?.length > 0 && (
          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.1em] text-[#737373] mb-3">
              Fähigkeiten
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {skills.acting_skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-1 bg-[#F5F5F5] text-[#0A0A0A] text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sprachen */}
        {skills.languages?.length > 0 && (
          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.1em] text-[#737373] mb-3">
              Sprachen
            </h3>
            <div className="space-y-1">
              {skills.languages.map((lang, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-[#0A0A0A]">{lang.language}</span>
                  <span className="text-[#737373]">{lang.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Über mich */}
        {about.about_me && (
          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.1em] text-[#737373] mb-2">
              Über mich
            </h3>
            <p className="text-sm text-[#0A0A0A] leading-relaxed line-clamp-4">
              {about.about_me}
            </p>
          </div>
        )}

        {/* Fotos Grid */}
        {(media.halfbody_photo_url || media.fullbody_photo_url) && (
          <div className="grid grid-cols-2 gap-2">
            {media.halfbody_photo_url && (
              <div className="aspect-[3/4] rounded-lg overflow-hidden bg-[#F5F5F5]">
                <Image
                  src={media.halfbody_photo_url}
                  alt="Halbkörper"
                  width={200}
                  height={267}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
            )}
            {media.fullbody_photo_url && (
              <div className="aspect-[3/4] rounded-lg overflow-hidden bg-[#F5F5F5]">
                <Image
                  src={media.fullbody_photo_url}
                  alt="Ganzkörper"
                  width={200}
                  height={267}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DataItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[#737373]">{label}</p>
      <p className="text-sm font-medium text-[#0A0A0A]">{value}</p>
    </div>
  );
}
