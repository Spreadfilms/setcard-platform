import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import KanbanBoard from "@/components/admin/KanbanBoard";
import FilterBar from "@/components/admin/FilterBar";
import { Suspense } from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<Record<string, string>>;
}

export default async function DashboardPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const params = await searchParams;
  const adminClient = createAdminClient();

  let query = adminClient.from("actors").select("*");
  if (params.search) query = query.or(`first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%,city.ilike.%${params.search}%`);
  if (params.gender) query = query.eq("gender", params.gender);
  if (params.priority === "none") query = query.is("cast_priority", null);
  else if (params.priority) query = query.eq("cast_priority", params.priority);
  query = query.order("created_at", { ascending: false });

  const { data: actors = [] } = await query;

  const stats = {
    total: actors?.length || 0,
    neu: actors?.filter((a) => a.status === "neu" || !a.status).length || 0,
    pool: actors?.filter((a) => a.status === "pool").length || 0,
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Admin Header */}
      <header className="bg-white border-b border-[#E5E5E5] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#0A0A0A] rounded-lg" />
            <span className="font-semibold text-[#0A0A0A]">Spreadfilms</span>
          </div>
          <span className="text-[#737373] text-sm">/ Dashboard</span>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button className="text-sm text-[#737373] hover:text-[#0A0A0A] transition-colors">
            Sign Out
          </button>
        </form>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total", value: stats.total },
            { label: "New", value: stats.neu },
            { label: "In Pool", value: stats.pool },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-[#E5E5E5] p-4">
              <p className="text-2xl font-bold text-[#0A0A0A]">{stat.value}</p>
              <p className="text-sm text-[#737373] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <Suspense>
          <FilterBar />
        </Suspense>

        {/* Kanban */}
        <KanbanBoard initialActors={actors || []} />
      </main>
    </div>
  );
}
