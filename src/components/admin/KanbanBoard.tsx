"use client";

import { useState, useCallback } from "react";
import { Actor, ActorStatus } from "@/types";
import ActorCard from "./ActorCard";
import { toast } from "sonner";

const COLUMNS: { id: ActorStatus; label: string; color: string }[] = [
  { id: "neu", label: "New", color: "bg-[#737373]" },
  { id: "onhold", label: "On Hold", color: "bg-[#EAB308]" },
  { id: "pool", label: "Pool", color: "bg-[#22C55E]" },
  { id: "abgelehnt", label: "Rejected", color: "bg-[#EF4444]" },
];

interface KanbanBoardProps {
  initialActors: Actor[];
}

export default function KanbanBoard({ initialActors }: KanbanBoardProps) {
  const [actors, setActors] = useState(initialActors);

  const updateStatus = useCallback(async (id: string, status: string) => {
    setActors((prev) => prev.map((a) => a.id === id ? { ...a, status: status as ActorStatus } : a));
    try {
      const res = await fetch(`/api/actors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success("Status updated");
    } catch {
      toast.error("Error updating status");
      setActors(initialActors);
    }
  }, [initialActors]);

  const updatePriority = useCallback(async (id: string, priority: string | null) => {
    setActors((prev) => prev.map((a) => a.id === id ? { ...a, cast_priority: priority as "A" | "B" | "C" | null } : a));
    try {
      const res = await fetch(`/api/actors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cast_priority: priority }),
      });
      if (!res.ok) throw new Error();
      toast.success("Priority updated");
    } catch {
      toast.error("Error updating priority");
    }
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {COLUMNS.map((col) => {
        const colActors = actors.filter((a) => (a.status || "neu") === col.id);
        return (
          <div key={col.id} className="flex flex-col gap-3">
            {/* Spalten-Header */}
            <div className="flex items-center gap-2 px-1">
              <div className={`w-2 h-2 rounded-full ${col.color}`} />
              <span className="font-semibold text-sm text-[#0A0A0A]">{col.label}</span>
              <span className="ml-auto text-xs text-[#737373] bg-[#F5F5F5] px-2 py-0.5 rounded-full">
                {colActors.length}
              </span>
            </div>

            {/* Karten */}
            <div className="space-y-2 min-h-[100px]">
              {colActors.length === 0 ? (
                <div className="border-2 border-dashed border-[#E5E5E5] rounded-xl h-24 flex items-center justify-center">
                  <p className="text-xs text-[#737373]">No entries</p>
                </div>
              ) : (
                colActors.map((actor) => (
                  <ActorCard
                    key={actor.id}
                    actor={actor}
                    onStatusChange={updateStatus}
                    onPriorityChange={updatePriority}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
