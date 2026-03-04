"use client";

import { useState } from "react";
import { toast } from "sonner";
import ProgressSteps from "@/components/shared/ProgressSteps";
import PhotoUpload from "@/components/shared/PhotoUpload";
import SetCardPreview from "./SetCardPreview";
import { ActorFormData } from "@/types";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

const STEPS = ["Personal", "Physical", "Media"];

const HAIR_COLORS = ["Black", "Brown", "Blonde", "Red", "Grey", "White", "Dyed"];
const EYE_COLORS = ["Brown", "Blue", "Green", "Grey", "Hazel"];
const SKIN_TYPES = ["Very Light", "Light", "Medium", "Dark", "Very Dark"];
const BODY_TYPES = ["slim", "athletic", "average", "heavy"];
const SIZES_TOP = ["XS", "S", "M", "L", "XL", "XXL"];

const INITIAL_FORM: ActorFormData = {
  personal: { first_name: "", last_name: "", email: "", phone: "", date_of_birth: "", gender: "", nationality: "", city: "" },
  physical: { height_cm: "", weight_kg: "", hair_color: "", eye_color: "", skin_type: "", body_type: "", clothing_size_top: "", clothing_size_bottom: "", shoe_size: "" },
  skills: { experience_level: "", acting_skills: [], languages: [], dialects: [], special_skills: [], sports: [], music_skills: [], drivers_license: [] },
  media: { portrait_photo_url: "", halfbody_photo_url: "", fullbody_photo_url: "", additional_photos: [], video_urls: [], showreel_url: "" },
  about: { about_me: "", agency_name: "", agency_contact: "" },
};

interface SetCardFormProps {
  initialData?: Partial<ActorFormData>;
  actorId?: string;
  isUpdate?: boolean;
  onSuccess?: () => void;
}

export default function SetCardForm({ initialData, actorId, isUpdate = false, onSuccess }: SetCardFormProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ActorFormData>({ ...INITIAL_FORM, ...initialData });
  const [loading, setLoading] = useState(false);

  const updatePersonal = (field: string, value: string) =>
    setForm((f) => ({ ...f, personal: { ...f.personal, [field]: value } }));
  const updatePhysical = (field: string, value: string | number) =>
    setForm((f) => ({ ...f, physical: { ...f.physical, [field]: value } }));
  const updateMedia = (field: string, value: string | string[]) =>
    setForm((f) => ({ ...f, media: { ...f.media, [field]: value } }));

  const validate = (): string | null => {
    if (step === 0) {
      if (!form.personal.first_name.trim()) return "First name is required.";
      if (!form.personal.last_name.trim()) return "Last name is required.";
      if (!form.personal.email.trim()) return "Email is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.personal.email)) return "Invalid email address.";
      if (!form.personal.gender) return "Please select a gender.";
    }
    if (step === 1) {
      if (form.physical.height_cm) {
        const h = Number(form.physical.height_cm);
        if (h < 50 || h > 250) return "Height must be between 50 and 250 cm.";
      }
    }
    if (step === 2) {
      if (!form.media.portrait_photo_url) return "Portrait photo is required.";
      if (!form.media.halfbody_photo_url) return "Half-body photo is required.";
      if (!form.media.fullbody_photo_url) return "Full-body photo is required.";
    }
    return null;
  };

  const next = () => {
    const error = validate();
    if (error) { toast.error(error); return; }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    const error = validate();
    if (error) { toast.error(error); return; }

    setLoading(true);
    try {
      const payload = {
        first_name: form.personal.first_name,
        last_name: form.personal.last_name,
        email: form.personal.email,
        phone: form.personal.phone || null,
        date_of_birth: form.personal.date_of_birth || null,
        gender: form.personal.gender || null,
        nationality: form.personal.nationality || null,
        city: form.personal.city || null,
        height_cm: form.physical.height_cm ? Number(form.physical.height_cm) : null,
        weight_kg: form.physical.weight_kg ? Number(form.physical.weight_kg) : null,
        hair_color: form.physical.hair_color || null,
        eye_color: form.physical.eye_color || null,
        skin_type: form.physical.skin_type || null,
        body_type: form.physical.body_type || null,
        clothing_size_top: form.physical.clothing_size_top || null,
        clothing_size_bottom: form.physical.clothing_size_bottom || null,
        shoe_size: form.physical.shoe_size ? Number(form.physical.shoe_size) : null,
        showreel_url: form.media.showreel_url || null,
        portrait_photo_url: form.media.portrait_photo_url || null,
        halfbody_photo_url: form.media.halfbody_photo_url || null,
        fullbody_photo_url: form.media.fullbody_photo_url || null,
        additional_photos: form.media.additional_photos,
        video_urls: form.media.video_urls,
      };

      const url = isUpdate && actorId ? `/api/actors/${actorId}` : "/api/actors";
      const method = isUpdate ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error saving");
      }

      onSuccess?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="px-6 py-4 border-b border-[#E5E5E5] flex items-center gap-4">
        <a href="/" className="text-sm text-[#737373] hover:text-[#0A0A0A] transition-colors">
          ← Back
        </a>
        <span className="font-semibold text-[#0A0A0A]">
          {isUpdate ? "Update Sedcard" : "Create Sedcard"}
        </span>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Progress */}
        <div className="max-w-2xl mx-auto mb-10">
          <ProgressSteps steps={STEPS} currentStep={step} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Form */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[#0A0A0A]">{STEPS[step]}</h1>
              <p className="text-sm text-[#737373] mt-1">Step {step + 1} of {STEPS.length}</p>
            </div>

            {/* STEP 0: Personal */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="First Name" required>
                    <Input value={form.personal.first_name} onChange={(v) => updatePersonal("first_name", v)} placeholder="Jane" />
                  </Field>
                  <Field label="Last Name" required>
                    <Input value={form.personal.last_name} onChange={(v) => updatePersonal("last_name", v)} placeholder="Doe" />
                  </Field>
                </div>
                <Field label="Email" required>
                  <Input type="email" value={form.personal.email} onChange={(v) => updatePersonal("email", v)} placeholder="jane@example.com" />
                </Field>
                <Field label="Phone">
                  <Input type="tel" value={form.personal.phone} onChange={(v) => updatePersonal("phone", v)} placeholder="+1 234 567890" />
                </Field>
                <Field label="Date of Birth">
                  <Input type="date" value={form.personal.date_of_birth} onChange={(v) => updatePersonal("date_of_birth", v)} />
                </Field>
                <Field label="Gender" required>
                  <Select value={form.personal.gender} onChange={(v) => updatePersonal("gender", v)} placeholder="Please select">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                  </Select>
                </Field>
                <Field label="Nationality">
                  <Input value={form.personal.nationality} onChange={(v) => updatePersonal("nationality", v)} placeholder="e.g. German" />
                </Field>
                <Field label="City">
                  <Input value={form.personal.city} onChange={(v) => updatePersonal("city", v)} placeholder="e.g. Berlin" />
                </Field>
              </div>
            )}

            {/* STEP 1: Physical */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Height (cm)">
                    <Input type="number" value={String(form.physical.height_cm)} onChange={(v) => updatePhysical("height_cm", v)} placeholder="175" min={50} max={250} />
                  </Field>
                  <Field label="Weight (kg)">
                    <Input type="number" value={String(form.physical.weight_kg)} onChange={(v) => updatePhysical("weight_kg", v)} placeholder="70" min={5} max={200} />
                  </Field>
                </div>
                <Field label="Hair Color">
                  <Select value={form.physical.hair_color} onChange={(v) => updatePhysical("hair_color", v)} placeholder="Please select">
                    {HAIR_COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </Field>
                <Field label="Eye Color">
                  <Select value={form.physical.eye_color} onChange={(v) => updatePhysical("eye_color", v)} placeholder="Please select">
                    {EYE_COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </Field>
                <Field label="Skin Type">
                  <Select value={form.physical.skin_type} onChange={(v) => updatePhysical("skin_type", v)} placeholder="Please select">
                    {SKIN_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </Field>
                <Field label="Body Type">
                  <Select value={form.physical.body_type} onChange={(v) => updatePhysical("body_type", v)} placeholder="Please select">
                    {BODY_TYPES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </Select>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Clothing Size Top">
                    <Select value={form.physical.clothing_size_top} onChange={(v) => updatePhysical("clothing_size_top", v)} placeholder="Size">
                      {SIZES_TOP.map((s) => <option key={s} value={s}>{s}</option>)}
                    </Select>
                  </Field>
                  <Field label="Clothing Size Bottom">
                    <Input value={form.physical.clothing_size_bottom as string} onChange={(v) => updatePhysical("clothing_size_bottom", v)} placeholder="e.g. M or 32" />
                  </Field>
                </div>
                <Field label="Shoe Size">
                  <Input type="number" value={String(form.physical.shoe_size)} onChange={(v) => updatePhysical("shoe_size", v)} placeholder="42" min={20} max={50} step={0.5} />
                </Field>
              </div>
            )}

            {/* STEP 2: Media */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <PhotoUpload
                    label="Portrait"
                    required
                    value={form.media.portrait_photo_url}
                    onChange={(url) => updateMedia("portrait_photo_url", url)}
                    actorId={actorId}
                    fieldName="portrait"
                  />
                  <PhotoUpload
                    label="Half-body"
                    required
                    value={form.media.halfbody_photo_url}
                    onChange={(url) => updateMedia("halfbody_photo_url", url)}
                    actorId={actorId}
                    fieldName="halfbody"
                  />
                  <PhotoUpload
                    label="Full-body"
                    required
                    value={form.media.fullbody_photo_url}
                    onChange={(url) => updateMedia("fullbody_photo_url", url)}
                    actorId={actorId}
                    fieldName="fullbody"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0A0A0A] mb-2">
                    Additional Photos (optional, max. 5)
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {Array.from({ length: Math.min(5, (form.media.additional_photos?.length || 0) + 1) }).map((_, i) => (
                      <PhotoUpload
                        key={i}
                        label={`Photo ${i + 1}`}
                        value={form.media.additional_photos?.[i] || ""}
                        onChange={(url) => {
                          const updated = [...(form.media.additional_photos || [])];
                          if (url) { updated[i] = url; } else { updated.splice(i, 1); }
                          updateMedia("additional_photos", updated.filter(Boolean));
                        }}
                        actorId={actorId}
                        fieldName={`additional_${i}`}
                      />
                    ))}
                  </div>
                </div>

                <Field label="Showreel Link (YouTube, Vimeo, ...)">
                  <Input
                    type="url"
                    value={form.media.showreel_url}
                    onChange={(v) => updateMedia("showreel_url", v)}
                    placeholder="https://vimeo.com/..."
                  />
                </Field>

                {/* Privacy notice */}
                <div className="p-4 bg-[#F5F5F5] rounded-xl text-xs text-[#737373] leading-relaxed">
                  Your data is stored exclusively for casting purposes at Spreadfilms and will not be shared with third parties. You can request deletion of your data at any time by email.
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={back}
                disabled={step === 0}
                className="flex items-center gap-2 px-6 py-3 border border-[#E5E5E5] rounded-xl text-sm font-medium text-[#0A0A0A] hover:border-[#737373] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={next}
                  className="flex items-center gap-2 px-6 py-3 bg-[#0A0A0A] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3 bg-[#0A0A0A] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isUpdate ? "Save" : "Submit"}
                </button>
              )}
            </div>
          </div>

          {/* Live Preview (Desktop) */}
          <div className="hidden lg:block sticky top-8">
            <SetCardPreview data={form} />
          </div>
        </div>

        {/* Mobile Preview */}
        <div className="lg:hidden mt-8">
          <details className="group">
            <summary className="flex items-center justify-between px-4 py-3 bg-[#F5F5F5] rounded-xl cursor-pointer text-sm font-medium">
              Show preview
              <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
            </summary>
            <div className="mt-4">
              <SetCardPreview data={form} />
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-[#0A0A0A]">
        {label}{required && <span className="text-[#EF4444] ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ onChange, ...props }: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & { onChange: (v: string) => void }) {
  return (
    <input
      {...props}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] focus:border-transparent min-h-[48px] bg-white"
    />
  );
}

function Select({ value, onChange, placeholder, children }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] focus:border-transparent min-h-[48px] bg-white appearance-none"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {children}
    </select>
  );
}
