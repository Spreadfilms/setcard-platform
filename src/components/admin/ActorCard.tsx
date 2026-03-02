"use client";

import { Actor } from "@/types";
import { calculateAge, formatDate } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface ActorCardProps {
  actor: Actor;
  onStatusChange?: (id: string, status: string) => void;
  onPriorityChange?: (id: string, priority: string | null) => void;
}

const CAST_COLORS: Record<string, string> = {
  A: "bg-[#22C55E]/10 border-[#22C55E] text-[#22C55E]",
  B: "bg-[#EAB308]/10 border-[#EAB308] text-[#EAB308]",
  C: "bg-[#3B82F6]/10 border-[#3B82F6] text-[#3B82F6]",
};

export default function ActorCard({ actor, onStatusChange, onPriorityChange }: ActorCardProps) {
  const age = actor.date_of_birth ? calculateAge(actor.date_of_birth) : null;

  return (
    <div className={`bg-white rounded-xl border overflow-hidden transition-all duration-200 hover:shadow-md ${
      actor.cast_priority ? `border-l-4 ${CAST_COLORS[actor.cast_priority]?.split(" ")[2] ? "" : "border-[#E5E5E5]"}` : "border-[#E5E5E5]"
    }`}
    style={actor.cast_priority ? { borderLeftColor: actor.cast_priority === "A" ? "#22C55E" : actor.cast_priority === "B" ? "#EAB308" : "#3B82F6", borderLeftWidth: "4px" } : {}}
    >
      <Link href={`/admin/actors/${actor.id}`} className="block">
        <div className="flex gap-3 p-3">
          {/* Thumbnail */}
          <div className="w-16 h-20 rounded-lg overflow-hidden bg-[#F5F5F5] flex-shrink-0">
            {actor.portrait_photo_url ? (
              <Image
                src={actor.portrait_photo_url}
                alt={`${actor.first_name} ${actor.last_name}`}
                width={64}
                height={80}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#737373] text-lg">
                {actor.first_name?.[0]}{actor.last_name?.[0]}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <h3 className="font-semibold text-[#0A0A0A] text-sm truncate">
                {actor.first_name} {actor.last_name}
              </h3>
              {actor.cast_priority && (
                <span className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full border ${CAST_COLORS[actor.cast_priority]}`}>
                  {actor.cast_priority}
                </span>
              )}
            </div>
            <p className="text-xs text-[#737373] mt-0.5">
              {[age ? `${age} J.` : null, actor.city].filter(Boolean).join(" · ")}
            </p>
            <p className="text-xs text-[#737373]">{formatDate(actor.created_at)}</p>
          </div>
        </div>
      </Link>

      {/* Schnellaktionen */}
      <div className="px-3 pb-3 flex gap-1.5">
        <select
          value={actor.status || "neu"}
          onChange={(e) => { e.stopPropagation(); onStatusChange?.(actor.id, e.target.value); }}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 text-xs border border-[#E5E5E5] rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] bg-white"
        >
          <option value="neu">Neu</option>
          <option value="abgelehnt">Abgelehnt</option>
          <option value="onhold">On Hold</option>
          <option value="pool">Pool</option>
        </select>
        <select
          value={actor.cast_priority || ""}
          onChange={(e) => { e.stopPropagation(); onPriorityChange?.(actor.id, e.target.value || null); }}
          onClick={(e) => e.stopPropagation()}
          className="text-xs border border-[#E5E5E5] rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] bg-white"
        >
          <option value="">—</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>
      </div>
    </div>
  );
}
