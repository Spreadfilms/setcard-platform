import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import SetCardView from "@/components/setcard/SetCardView";
import AdminActorControls from "@/components/admin/AdminActorControls";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ActorDetailPage({ params }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { id } = await params;
  const adminClient = createAdminClient();

  const { data: actor, error } = await adminClient
    .from("actors")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !actor) return notFound();

  const { data: emailLogs } = await adminClient
    .from("email_log")
    .select("*")
    .eq("actor_id", id)
    .order("created_at", { ascending: false });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const shareUrl = `${baseUrl}/s/${actor.share_hash}`;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <header className="bg-white border-b border-[#E5E5E5] px-6 py-4 flex items-center gap-4">
        <a href="/admin/dashboard" className="text-sm text-[#737373] hover:text-[#0A0A0A] transition-colors">
          ← Dashboard
        </a>
        <span className="font-semibold text-[#0A0A0A]">
          {actor.first_name} {actor.last_name}
        </span>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SetCard Ansicht */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden">
            <SetCardView actor={actor} />
          </div>

          {/* Admin Controls */}
          <div className="space-y-4">
            <AdminActorControls
              actor={actor}
              shareUrl={shareUrl}
              emailLogs={emailLogs || []}
              adminEmail={user.email || ""}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
