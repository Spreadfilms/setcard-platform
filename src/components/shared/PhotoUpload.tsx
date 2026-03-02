"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

interface PhotoUploadProps {
  label: string;
  required?: boolean;
  value?: string;
  onChange: (url: string) => void;
  actorId?: string;
  fieldName: string;
}

export default function PhotoUpload({
  label,
  required,
  value,
  onChange,
  actorId,
  fieldName,
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Validierung
      if (file.size > 10 * 1024 * 1024) {
        setError("Datei zu groß (max. 10 MB)");
        return;
      }

      setUploading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("fieldName", fieldName);
        if (actorId) formData.append("actorId", actorId);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload fehlgeschlagen");

        const { url } = await response.json();
        onChange(url);
      } catch {
        setError("Upload fehlgeschlagen. Bitte erneut versuchen.");
      } finally {
        setUploading(false);
      }
    },
    [actorId, fieldName, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[#0A0A0A]">
        {label}
        {required && <span className="text-[#EF4444] ml-1">*</span>}
      </label>

      {value ? (
        <div className="relative group">
          <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-[#F5F5F5]">
            <Image
              src={value}
              alt={label}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`w-full aspect-[3/4] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? "border-[#0A0A0A] bg-[#F5F5F5]"
              : "border-[#E5E5E5] hover:border-[#737373] bg-[#F5F5F5]"
          } ${uploading ? "pointer-events-none" : ""}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <Loader2 className="w-8 h-8 text-[#737373] animate-spin" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-[#737373] mb-2" />
              <p className="text-sm text-[#737373] text-center px-4">
                {isDragActive ? "Loslassen..." : "Foto hier ablegen oder klicken"}
              </p>
              <p className="text-xs text-[#737373] mt-1">JPEG, PNG, WebP · max. 10 MB</p>
            </>
          )}
        </div>
      )}

      {error && <p className="text-sm text-[#EF4444]">{error}</p>}
    </div>
  );
}
