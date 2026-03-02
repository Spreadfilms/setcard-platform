import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import SetCardView from "@/components/setcard/SetCardView";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ shareHash: string }>;
}

export default async function PublicSetCardPage({ params }: Props) {
  const { shareHash } = await params;
  const supabase = createAdminClient();

  const { data: actor, error } = await supabase
    .from("actors")
    .select("*")
    .eq("share_hash", shareHash)
    .single();

  if (error || !actor) return notFound();

  return (
    <div className="min-h-screen bg-white">
      <header className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#0A0A0A] rounded-lg" />
          <span className="font-semibold text-[#0A0A0A]">Spreadfilms Casting</span>
        </div>
        <span className="text-xs text-[#737373]">SetCard</span>
      </header>
      <SetCardView actor={actor} />
    </div>
  );
}
