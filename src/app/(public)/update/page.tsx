"use client";

import { useState } from "react";
import { toast } from "sonner";
import PinInput from "@/components/shared/PinInput";
import SetCardForm from "@/components/setcard/SetCardForm";
import { Actor, ActorFormData } from "@/types";
import { Loader2 } from "lucide-react";

type Phase = "email" | "pin" | "form" | "success";

export default function UpdatePage() {
  const [phase, setPhase] = useState<Phase>("email");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [actor, setActor] = useState<Actor | null>(null);

  const requestPin = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/pin/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      toast.success("PIN sent to your email.");
      setPhase("pin");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error sending PIN");
    } finally {
      setLoading(false);
    }
  };

  const verifyPin = async () => {
    if (pin.length !== 6) {
      toast.error("Please enter all 6 digits.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/pin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid PIN");
      setActor(data.actor);
      setPhase("form");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Invalid PIN");
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  if (phase === "form" && actor) {
    const initialData: ActorFormData = {
      personal: {
        first_name: actor.first_name || "",
        last_name: actor.last_name || "",
        email: actor.email || "",
        phone: actor.phone || "",
        date_of_birth: actor.date_of_birth || "",
        gender: actor.gender || "",
        nationality: actor.nationality || "",
        city: actor.city || "",
      },
      physical: {
        height_cm: (actor.height_cm ?? "") as number | "",
        weight_kg: (actor.weight_kg ?? "") as number | "",
        hair_color: actor.hair_color || "",
        eye_color: actor.eye_color || "",
        skin_type: actor.skin_type || "",
        body_type: actor.body_type || "",
        clothing_size_top: actor.clothing_size_top || "",
        clothing_size_bottom: actor.clothing_size_bottom || "",
        shoe_size: (actor.shoe_size ?? "") as number | "",
      },
      skills: {
        experience_level: actor.experience_level || "",
        acting_skills: actor.acting_skills || [],
        languages: actor.languages || [],
        dialects: actor.dialects || [],
        special_skills: actor.special_skills || [],
        sports: actor.sports || [],
        music_skills: actor.music_skills || [],
        drivers_license: actor.drivers_license || [],
      },
      media: {
        portrait_photo_url: actor.portrait_photo_url || "",
        halfbody_photo_url: actor.halfbody_photo_url || "",
        fullbody_photo_url: actor.fullbody_photo_url || "",
        additional_photos: actor.additional_photos || [],
        video_urls: actor.video_urls || [],
        showreel_url: actor.showreel_url || "",
      },
      about: {
        about_me: actor.about_me || "",
        agency_name: actor.agency_name || "",
        agency_contact: actor.agency_contact || "",
      },
    };

    return (
      <SetCardForm
        initialData={initialData}
        actorId={actor.id}
        isUpdate
        onSuccess={() => setPhase("success")}
      />
    );
  }

  if (phase === "success") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-8">
        <div className="max-w-md text-center space-y-6">
          <div className="w-16 h-16 bg-[#22C55E] rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]">Sedcard updated!</h1>
          <p className="text-[#737373]">Your changes have been saved successfully.</p>
          <a href="/" className="inline-flex items-center justify-center px-8 py-3 bg-[#0A0A0A] text-white rounded-xl hover:opacity-90 transition-opacity">
            Back to home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="px-6 py-4 border-b border-[#E5E5E5] flex items-center gap-4">
        <a href="/" className="text-sm text-[#737373] hover:text-[#0A0A0A] transition-colors">← Back</a>
        <span className="font-semibold text-[#0A0A0A]">Update Sedcard</span>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {phase === "email" && (
            <>
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-[#0A0A0A]">Enter your email</h1>
                <p className="text-sm text-[#737373]">We will send you a 6-digit PIN to verify your identity.</p>
              </div>
              <div className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && requestPin()}
                  placeholder="your@email.com"
                  className="w-full px-4 py-4 border border-[#E5E5E5] rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] focus:border-transparent"
                  autoFocus
                />
                <button
                  onClick={requestPin}
                  disabled={loading}
                  className="w-full py-4 bg-[#0A0A0A] text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Request PIN
                </button>
              </div>
            </>
          )}

          {phase === "pin" && (
            <>
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-[#0A0A0A]">Enter PIN</h1>
                <p className="text-sm text-[#737373]">
                  We sent a PIN to <strong>{email}</strong>.<br />
                  Valid for 10 minutes.
                </p>
              </div>
              <PinInput value={pin} onChange={setPin} disabled={loading} />
              <button
                onClick={verifyPin}
                disabled={loading || pin.length !== 6}
                className="w-full py-4 bg-[#0A0A0A] text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm
              </button>
              <button
                onClick={() => { setPhase("email"); setPin(""); }}
                className="w-full text-center text-sm text-[#737373] hover:text-[#0A0A0A] transition-colors"
              >
                Use a different email
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
