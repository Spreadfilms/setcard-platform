"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Search } from "lucide-react";

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/admin/dashboard?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Suche */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
        <input
          type="text"
          placeholder="Name oder Stadt suchen..."
          defaultValue={searchParams.get("search") || ""}
          onChange={(e) => updateParam("search", e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-[#E5E5E5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] focus:border-transparent bg-white"
        />
      </div>

      {/* Geschlecht */}
      <select
        defaultValue={searchParams.get("gender") || ""}
        onChange={(e) => updateParam("gender", e.target.value)}
        className="px-3 py-2.5 border border-[#E5E5E5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] bg-white"
      >
        <option value="">Alle Geschlechter</option>
        <option value="männlich">Männlich</option>
        <option value="weiblich">Weiblich</option>
        <option value="divers">Divers</option>
      </select>

      {/* Cast-Priorität */}
      <select
        defaultValue={searchParams.get("priority") || ""}
        onChange={(e) => updateParam("priority", e.target.value)}
        className="px-3 py-2.5 border border-[#E5E5E5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] bg-white"
      >
        <option value="">Alle Prioritäten</option>
        <option value="A">A-Cast</option>
        <option value="B">B-Cast</option>
        <option value="C">C-Cast</option>
        <option value="none">Kein Cast</option>
      </select>
    </div>
  );
}
