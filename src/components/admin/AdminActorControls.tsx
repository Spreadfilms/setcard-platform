"use client";

import { useState } from "react";
import { Actor, EmailLog } from "@/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import EmailModal from "./EmailModal";
import { Copy, FileDown, Trash2, Mail, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Props {
  actor: Actor;
  shareUrl: string;
  emailLogs: EmailLog[];
  adminEmail: string;
}

const CAST_COLORS: Record<string, string> = {
  A: "text-[#22C55E] border-[#22C55E]",
  B: "text-[#EAB308] border-[#EAB308]",
  C: "text-[#3B82F6] border-[#3B82F6]",
};

export default function AdminActorControls({ actor, shareUrl, emailLogs, adminEmail }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(actor.status || "neu");
  const [castPriority, setCastPriority] = useState(actor.cast_priority || "");
  const [notes, setNotes] = useState(actor.admin_notes || "");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async (updates: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/actors/${actor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error();
      toast.success("Gespeichert");
      router.refresh();
    } catch {
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  const deleteActor = async () => {
    try {
      const res = await fetch(`/api/actors/${actor.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("SetCard gelöscht");
      router.push("/admin/dashboard");
    } catch {
      toast.error("Löschen fehlgeschlagen");
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Share-Link kopiert!");
  };

  const exportPdf = () => {
    window.open(`/api/actors/${actor.id}/pdf`, "_blank");
  };

  return (
    <>
      {/* Status */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] p-4 space-y-4">
        <h3 className="font-semibold text-[#0A0A0A] text-sm">Status & Priorität</h3>

        <div className="space-y-2">
          <label className="text-xs text-[#737373]">Status</label>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value as "neu" | "abgelehnt" | "onhold" | "pool"); save({ status: e.target.value }); }}
            className="w-full px-3 py-2.5 border border-[#E5E5E5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] bg-white"
          >
            <option value="neu">Neu</option>
            <option value="onhold">On Hold</option>
            <option value="pool">Pool</option>
            <option value="abgelehnt">Abgelehnt</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-[#737373]">Cast-Priorität</label>
          <div className="grid grid-cols-4 gap-1.5">
            {["", "A", "B", "C"].map((p) => (
              <button
                key={p || "none"}
                onClick={() => { setCastPriority(p); save({ cast_priority: p || null }); }}
                className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                  castPriority === p
                    ? p ? `bg-opacity-10 ${CAST_COLORS[p]} font-bold` : "bg-[#0A0A0A] text-white border-[#0A0A0A]"
                    : "border-[#E5E5E5] text-[#737373] hover:border-[#737373]"
                }`}
              >
                {p || "—"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-[#737373]">Interne Notizen</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => save({ admin_notes: notes })}
            rows={3}
            placeholder="Nur für interne Verwendung..."
            className="w-full px-3 py-2 border border-[#E5E5E5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] resize-none"
          />
        </div>
      </div>

      {/* Aktionen */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] p-4 space-y-2">
        <h3 className="font-semibold text-[#0A0A0A] text-sm mb-3">Aktionen</h3>

        <button
          onClick={() => setShowEmailModal(true)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#F5F5F5] transition-colors text-sm text-[#0A0A0A] text-left"
        >
          <Mail className="w-4 h-4 text-[#737373]" /> E-Mail senden
        </button>

        <button
          onClick={copyShareLink}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#F5F5F5] transition-colors text-sm text-[#0A0A0A] text-left"
        >
          <Copy className="w-4 h-4 text-[#737373]" /> Share-Link kopieren
        </button>

        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#F5F5F5] transition-colors text-sm text-[#0A0A0A]"
        >
          <ExternalLink className="w-4 h-4 text-[#737373]" /> Öffentliche Ansicht
        </a>

        <button
          onClick={exportPdf}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#F5F5F5] transition-colors text-sm text-[#0A0A0A] text-left"
        >
          <FileDown className="w-4 h-4 text-[#737373]" /> PDF exportieren
        </button>

        <div className="border-t border-[#E5E5E5] pt-2 mt-2">
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#EF4444]/5 transition-colors text-sm text-[#EF4444] text-left"
            >
              <Trash2 className="w-4 h-4" /> SetCard löschen
            </button>
          ) : (
            <div className="p-3 bg-[#EF4444]/5 rounded-xl space-y-2">
              <p className="text-xs text-[#EF4444] font-medium">Wirklich löschen?</p>
              <div className="flex gap-2">
                <button onClick={deleteActor} className="flex-1 py-2 bg-[#EF4444] text-white rounded-lg text-xs font-medium">
                  Löschen
                </button>
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 border border-[#E5E5E5] rounded-lg text-xs">
                  Abbrechen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* E-Mail-Verlauf */}
      {emailLogs.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-4 space-y-3">
          <h3 className="font-semibold text-[#0A0A0A] text-sm">E-Mail-Verlauf</h3>
          {emailLogs.map((log) => (
            <div key={log.id} className="text-xs border-b border-[#E5E5E5] pb-3 last:border-0 last:pb-0">
              <p className="font-medium text-[#0A0A0A] truncate">{log.subject}</p>
              <p className="text-[#737373] mt-0.5">{formatDate(log.created_at)} · {log.sent_by}</p>
            </div>
          ))}
        </div>
      )}

      {/* E-Mail Modal */}
      {showEmailModal && (
        <EmailModal
          actor={actor}
          adminName={adminEmail.split("@")[0] || "Admin"}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </>
  );
}
