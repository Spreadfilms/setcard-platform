"use client";

import { useState } from "react";
import { Actor } from "@/types";
import { toast } from "sonner";
import { X, Loader2, Send } from "lucide-react";

interface EmailModalProps {
  actor: Actor;
  adminName: string;
  onClose: () => void;
}

export default function EmailModal({ actor, adminName, onClose }: EmailModalProps) {
  const [instruction, setInstruction] = useState("");
  const [preview, setPreview] = useState<{ subject: string; body: string } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [editedSubject, setEditedSubject] = useState("");
  const [editedBody, setEditedBody] = useState("");

  const generate = async () => {
    if (!instruction.trim()) {
      toast.error("Please enter an instruction.");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/email/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: actor.id, instruction, adminName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPreview(data);
      setEditedSubject(data.subject);
      setEditedBody(data.body);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const send = async () => {
    setSending(true);
    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorId: actor.id,
          to: actor.email,
          subject: editedSubject,
          body: editedBody,
          type: "custom",
          sentBy: adminName,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Email sent!");
      onClose();
    } catch {
      toast.error("Email could not be sent.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E5E5E5]">
          <div>
            <h2 className="font-semibold text-[#0A0A0A]">Send Email</h2>
            <p className="text-sm text-[#737373]">to {actor.first_name} {actor.last_name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F5F5F5] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Anweisung */}
          <div>
            <label className="block text-sm font-medium text-[#0A0A0A] mb-2">
              Instruction for AI
            </label>
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              rows={3}
              placeholder={`e.g.: "Send a rejection", "Ask for current showreel", "Invitation to casting on March 15th"`}
              className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] resize-none"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {["Send rejection", "Request showreel", "Complete profile", "Casting invitation"].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setInstruction(suggestion)}
                  className="text-xs px-3 py-1.5 bg-[#F5F5F5] text-[#737373] rounded-full hover:bg-[#E5E5E5] transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generate}
            disabled={generating || !instruction.trim()}
            className="w-full py-3 border border-[#0A0A0A] text-[#0A0A0A] rounded-xl text-sm font-medium hover:bg-[#0A0A0A] hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {generating && <Loader2 className="w-4 h-4 animate-spin" />}
            ✦ Generate AI Email
          </button>

          {/* Preview */}
          {preview && (
            <div className="space-y-3 border-t border-[#E5E5E5] pt-4">
              <p className="text-sm font-medium text-[#0A0A0A]">Preview (editable)</p>
              <div>
                <label className="text-xs text-[#737373] mb-1 block">Subject</label>
                <input
                  value={editedSubject}
                  onChange={(e) => setEditedSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A]"
                />
              </div>
              <div>
                <label className="text-xs text-[#737373] mb-1 block">Body</label>
                <textarea
                  value={editedBody}
                  onChange={(e) => setEditedBody(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] resize-none font-mono"
                />
              </div>
              <button
                onClick={send}
                disabled={sending}
                className="w-full py-3 bg-[#0A0A0A] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                E-Mail senden
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
